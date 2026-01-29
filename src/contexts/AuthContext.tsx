import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  stats: UserStats | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName: string, university?: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'email' | 'created_at' | 'updated_at'>>) => Promise<{ data?: any; error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useSupabaseAuth();

  return (
    <AuthContext.Provider value={auth}>
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
