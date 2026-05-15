import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'nearvity-high-contrast';
const EVENT = 'nearvity:high-contrast-change';

export function getStoredHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function getSystemHighContrast(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  // forced-colors covers Windows High Contrast; prefers-contrast: more is the
  // explicit user-level OS preference for stronger contrast.
  return (
    window.matchMedia('(prefers-contrast: more)').matches ||
    window.matchMedia('(forced-colors: active)').matches
  );
}

/**
 * Returns true when the UI should render in a stronger-contrast variant —
 * either because the OS asks for it or because the user toggled the in-app
 * accessibility preference. Mirrored to <html data-high-contrast="true">.
 */
export function useHighContrast(): {
  highContrast: boolean;
  userPreference: boolean;
  systemPreference: boolean;
  setUserPreference: (value: boolean) => void;
} {
  const [systemPreference, setSystemPreference] = useState(getSystemHighContrast);
  const [userPreference, setUserPreferenceState] = useState(getStoredHighContrast);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const queries = [
      window.matchMedia('(prefers-contrast: more)'),
      window.matchMedia('(forced-colors: active)'),
    ];
    const handler = () => setSystemPreference(getSystemHighContrast());
    queries.forEach((mq) => mq.addEventListener?.('change', handler));
    return () => queries.forEach((mq) => mq.removeEventListener?.('change', handler));
  }, []);

  useEffect(() => {
    const sync = () => setUserPreferenceState(getStoredHighContrast());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setUserPreference = useCallback((value: boolean) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new Event(EVENT));
    setUserPreferenceState(value);
  }, []);

  return {
    highContrast: systemPreference || userPreference,
    userPreference,
    systemPreference,
    setUserPreference,
  };
}
