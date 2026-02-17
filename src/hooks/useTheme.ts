import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme: Theme) => {
        let resolved: 'dark' | 'light' = 'dark';
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          resolved = theme;
        }
        
        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: 'nearvity-theme-storage',
    }
  )
);

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    
    // Add transition class for smooth theme change
    root.classList.add('theme-transition');
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the resolved theme class
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0a0a14' : '#ffffff'
      );
    }
    
    // Remove transition class after animation completes to avoid interfering with other transitions
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 400);
    
    return () => clearTimeout(timeout);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      useThemeStore.setState({ resolvedTheme: e.matches ? 'dark' : 'light' });
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
  };
}
