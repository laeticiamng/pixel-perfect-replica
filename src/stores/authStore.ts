import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/signal';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, university?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For MVP, accept any valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || password.length < 4) {
          set({ isLoading: false });
          return false;
        }
        
        // Check if user exists in localStorage (from previous registration)
        const storedUser = localStorage.getItem('signal-user-' + email);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      register: async (email: string, password: string, firstName: string, university?: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const newUser: User = {
          id: 'user-' + Date.now(),
          email,
          firstName,
          university,
          createdAt: new Date(),
          stats: {
            interactions: 0,
            hoursActive: 0,
            rating: 5.0,
          },
        };
        
        // Store user data
        localStorage.setItem('signal-user-' + email, JSON.stringify(newUser));
        
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          localStorage.setItem('signal-user-' + currentUser.email, JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'signal-auth-storage',
    }
  )
);
