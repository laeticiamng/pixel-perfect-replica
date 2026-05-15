import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'nearvity-reduce-motion';
const EVENT = 'nearvity:reduce-motion-change';

export function getStoredReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function getSystemReduceMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns true when motion should be reduced — either because the OS asks for it
 * or because the user toggled the in-app accessibility preference.
 */
export function useReducedMotion(): {
  reduceMotion: boolean;
  userPreference: boolean;
  systemPreference: boolean;
  setUserPreference: (value: boolean) => void;
} {
  const [systemPreference, setSystemPreference] = useState(getSystemReduceMotion);
  const [userPreference, setUserPreferenceState] = useState(getStoredReduceMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    const sync = () => setUserPreferenceState(getStoredReduceMotion());
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
    reduceMotion: systemPreference || userPreference,
    userPreference,
    systemPreference,
    setUserPreference,
  };
}
