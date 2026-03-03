import { useEffect, useRef } from 'react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'nearvity_utm';

export type UTMParams = Partial<Record<typeof UTM_KEYS[number], string>>;

function captureUTM(): UTMParams | null {
  const params = new URLSearchParams(window.location.search);
  const utm: UTMParams = {};
  let hasAny = false;
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) { utm[key] = val; hasAny = true; }
  }
  return hasAny ? utm : null;
}

export function getStoredUTM(): UTMParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function useUTM() {
  const captured = useRef(false);

  useEffect(() => {
    if (captured.current) return;
    captured.current = true;
    const utm = captureUTM();
    if (utm) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    }
  }, []);

  return getStoredUTM();
}
