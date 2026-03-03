import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Profile, UserStats } from '@/types/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    stats: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Prevent duplicate profile fetches from getSession + onAuthStateChange racing
  const profileFetchInFlight = useRef<string | null>(null);
  const lastProfileFetchedAt = useRef<number>(0);
  const PROFILE_CACHE_TTL = 5_000; // 5s dedup window

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        logger.api.error('profiles', 'select', profileError.message);
        return null;
      }

      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('interactions, hours_active, rating, total_ratings')
        .eq('user_id', userId)
        .maybeSingle();

      if (statsError) {
        logger.api.error('user_stats', 'select', statsError.message);
      }

      return { profile, stats };
    } catch (error) {
      logger.api.error('profiles', 'fetchProfile', String(error));
      return null;
    }
  }, []);

  // Deduplicated profile fetch: skips if same user fetch is in-flight or recently completed
  const fetchProfileDeduped = useCallback(async (userId: string) => {
    const now = Date.now();
    if (
      profileFetchInFlight.current === userId ||
      (now - lastProfileFetchedAt.current < PROFILE_CACHE_TTL)
    ) {
      return; // skip duplicate
    }

    profileFetchInFlight.current = userId;
    const data = await fetchProfile(userId);
    profileFetchInFlight.current = null;
    lastProfileFetchedAt.current = Date.now();

    if (data) {
      setAuthState(prev => ({
        ...prev,
        profile: data.profile,
        stats: data.stats,
      }));
    }
  }, [fetchProfile]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.auth.sessionRefresh(session?.user?.id || 'anonymous');
        
        if (event === 'SIGNED_IN' && session?.user) {
          logger.auth.login(session.user.id, 'email');
        } else if (event === 'SIGNED_OUT') {
          logger.auth.logout();
        }
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
          isAuthenticated: !!session?.user,
          isLoading: false,
        }));

        if (session?.user) {
          // Defer to avoid deadlock, deduplicated
          setTimeout(() => fetchProfileDeduped(session.user.id), 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            profile: null,
            stats: null,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        isAuthenticated: !!session?.user,
        isLoading: false,
      }));

      if (session?.user) {
        fetchProfileDeduped(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchProfileDeduped]);

  const signUp = async (email: string, password: string, firstName: string, university?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          university: university || null,
        },
      },
    });

    if (error) {
      logger.auth.signupFailed(error.message);
      return { error };
    }

    logger.auth.signupSuccess(data.user?.id || 'unknown');

    // Update profile with additional data after signup
    // Only attempt if we have an active session (email confirmed or auto-confirm enabled)
    // The handle_new_user trigger already saves first_name from raw_user_meta_data
    if (data.user && data.session) {
      const updateProfileWithRetry = async (userId: string, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              first_name: firstName, 
              university: university || null 
            })
            .eq('id', userId);

          if (!updateError) return;
          
          logger.ui.warning(`Profile update attempt ${i + 1} failed: ${updateError.message}`);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
          }
        }
      };
      
      // Don't block signup on profile update - fire and forget with retries
      updateProfileWithRetry(data.user.id).catch(err => {
        logger.api.error('profiles', 'update-retry', String(err));
      });
    }

    return { data, error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.auth.loginFailed(error.message);
      return { error };
    }

    logger.auth.login(data.user.id, 'email');

    return { data, error: null };
  };

  const signInWithMagicLink = async (email: string) => {
    const redirectUrl = `${window.location.origin}/map`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      logger.api.error('auth', 'magic-link', error.message);
      return { error };
    }

    return { error: null };
  };

  const signInWithOAuthSupabase = async (provider: 'google') => {
    const redirectUrl = `${window.location.origin}/map`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      logger.api.error('auth', `oauth-${provider}`, error.message);
      return { error };
    }

    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.api.error('auth', 'signout', error.message);
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>) => {
    if (!authState.user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id)
      .select()
      .single();

    if (!error && data) {
      setAuthState(prev => ({
        ...prev,
        profile: data,
      }));
    }

    return { data, error };
  };

  const refreshProfile = async () => {
    if (!authState.user) return { error: 'No user' };

    const data = await fetchProfile(authState.user.id);
    if (data) {
      setAuthState(prev => ({
        ...prev,
        profile: data.profile,
        stats: data.stats,
      }));
      return { error: null };
    }
    return { error: 'Failed to refresh profile' };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signInWithMagicLink,
    signInWithOAuthSupabase,
    signOut,
    updateProfile,
    refreshProfile,
  };
}
