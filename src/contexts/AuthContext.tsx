import { createContext, useContext, useMemo, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import type { Profile, UserStats } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName: string, university?: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signInWithOAuthSupabase: (provider: 'google') => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>) => Promise<{ data?: any; error: any }>;
  refreshProfile: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();

  const value = useMemo(() => auth, [
    auth.user,
    auth.session,
    auth.profile,
    auth.stats,
    auth.isLoading,
    auth.isAuthenticated,
    auth.signUp,
    auth.signIn,
    auth.signInWithMagicLink,
    auth.signInWithOAuthSupabase,
    auth.signOut,
    auth.updateProfile,
    auth.refreshProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
