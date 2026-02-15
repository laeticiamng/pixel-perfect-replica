import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  interactions: number;
  hours_active: number;
  rating: number;
  total_ratings: number;
}

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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('interactions, hours_active, rating, total_ratings')
        .eq('user_id', userId)
        .maybeSingle();

      if (statsError) {
        console.error('Error fetching stats:', statsError);
      }

      return { profile, stats };
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
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

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(data => {
              if (data) {
                setAuthState(prev => ({
                  ...prev,
                  profile: data.profile,
                  stats: data.stats,
                }));
              }
            });
          }, 0);
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
        fetchProfile(session.user.id).then(data => {
          if (data) {
            setAuthState(prev => ({
              ...prev,
              profile: data.profile,
              stats: data.stats,
            }));
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

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
      console.error('Signup error:', error);
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
          
          console.warn(`Profile update attempt ${i + 1} failed:`, updateError.message);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
          }
        }
      };
      
      // Don't block signup on profile update - fire and forget with retries
      updateProfileWithRetry(data.user.id).catch(err => {
        console.error('All profile update retries failed:', err);
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
      console.error('Signin error:', error);
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
      console.error('Magic link error:', error);
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
      console.error(`${provider} OAuth error:`, error);
      return { error };
    }

    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
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
