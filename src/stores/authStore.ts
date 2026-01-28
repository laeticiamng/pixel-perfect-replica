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
  incrementInteractions: () => void;
  addHoursActive: (hours: number) => void;
  updateRating: (newRating: number) => void;
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
          // Ensure dates are properly parsed
          user.createdAt = new Date(user.createdAt);
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

      incrementInteractions: () => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              interactions: currentUser.stats.interactions + 1,
            },
          };
          localStorage.setItem('signal-user-' + currentUser.email, JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      addHoursActive: (hours: number) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              hoursActive: currentUser.stats.hoursActive + hours,
            },
          };
          localStorage.setItem('signal-user-' + currentUser.email, JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },

      updateRating: (newRating: number) => {
        const currentUser = get().user;
        if (currentUser) {
          // Calculate weighted average
          const totalInteractions = currentUser.stats.interactions + 1;
          const newAvgRating = 
            (currentUser.stats.rating * currentUser.stats.interactions + newRating) / totalInteractions;
          
          const updatedUser = {
            ...currentUser,
            stats: {
              ...currentUser.stats,
              rating: Math.round(newAvgRating * 10) / 10,
            },
          };
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
