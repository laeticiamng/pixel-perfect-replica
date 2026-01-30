import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Locale, setCurrentLocale, getCurrentLocale } from './translations';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'en', // Default to English
      setLocale: (locale) => {
        setCurrentLocale(locale);
        set({ locale });
      },
    }),
    {
      name: 'easy-i18n',
    }
  )
);

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends { en: string; fr: string }
        ? K
        : T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : never
      : never
    }[keyof T]
  : never;

type TranslationPath = NestedKeyOf<typeof translations> | keyof typeof translations;

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
  const { locale, setLocale } = useI18nStore();

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations, key);
    
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
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
    setLocale(locale === 'en' ? 'fr' : 'en');
  };

  return {
    t,
    locale,
    setLocale,
    toggleLocale,
    isEnglish: locale === 'en',
    isFrench: locale === 'fr',
  };
}
