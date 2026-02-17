import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useCallback } from 'react';
import { translations, Locale, setCurrentLocale } from './translations';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface I18nStore {
  locale: Locale;
  isHydrated: boolean;
  setLocale: (locale: Locale) => void;
  setHydrated: () => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'en', // Default to English
      isHydrated: false,
      setLocale: (locale) => {
        setCurrentLocale(locale);
        set({ locale });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'nearvity-i18n',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

function getNestedValue(obj: any, path: string): { en: string; fr: string } | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  
  if (current && typeof current === 'object' && 'en' in current && 'fr' in current) {
    return current as { en: string; fr: string };
  }
  
  return undefined;
}

export function useTranslation() {
  const { locale, setLocale, isHydrated } = useI18nStore();
  const { user, isAuthenticated } = useAuth();

  // Sync locale from database on mount (when authenticated)
  useEffect(() => {
    if (!isAuthenticated || !user || !isHydrated) return;

    const fetchLanguagePreference = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('language_preference')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data?.language_preference) {
        const dbLocale = data.language_preference as Locale;
        if (dbLocale !== locale) {
          setLocale(dbLocale);
        }
      }
    };

    fetchLanguagePreference();
  }, [isAuthenticated, user, isHydrated]);

  // Save locale to database when it changes (if authenticated)
  const updateLocale = useCallback(async (newLocale: Locale) => {
    setLocale(newLocale);
    
    if (isAuthenticated && user) {
      await supabase
        .from('user_settings')
        .update({ language_preference: newLocale })
        .eq('user_id', user.id);
    }
  }, [isAuthenticated, user, setLocale]);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key);
    
    if (!translation) {
      logger.ui.warning(`Missing translation for key: ${key}`);
      return key;
    }
    
    let text = translation[locale] || translation.en;
    
    // Handle replacements like {max} -> 6
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    
    return text;
  };

  const toggleLocale = () => {
    updateLocale(locale === 'en' ? 'fr' : 'en');
  };

  return {
    t,
    locale,
    setLocale: updateLocale,
    toggleLocale,
    isEnglish: locale === 'en',
    isFrench: locale === 'fr',
  };
}
