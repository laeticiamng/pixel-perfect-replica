import { supabase } from '@/integrations/supabase/client';

/**
 * Lightweight client-side error reporter.
 * Batches errors and sends them to the log-client-error edge function.
 * Debounces to avoid flooding: max 1 report per 5 seconds.
 */

let lastReportTime = 0;
const MIN_INTERVAL_MS = 5_000;
const errorQueue: ErrorPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

interface ErrorPayload {
  message: string;
  stack?: string;
  component?: string;
  url?: string;
  userAgent?: string;
  level?: 'error' | 'warn';
}

async function flush() {
  if (errorQueue.length === 0) return;
  
  const batch = errorQueue.splice(0, 5); // max 5 per flush
  
  for (const payload of batch) {
    try {
      await supabase.functions.invoke('log-client-error', {
        body: payload,
      });
    } catch {
      // Silently fail — monitoring should never break the app
    }
  }
  
  lastReportTime = Date.now();
}

function scheduleFlush() {
  if (flushTimer) return;
  const elapsed = Date.now() - lastReportTime;
  const delay = Math.max(0, MIN_INTERVAL_MS - elapsed);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, delay);
}

export function reportError(
  error: Error | string,
  context?: { component?: string; level?: 'error' | 'warn' }
) {
  // Only report in production
  if (!import.meta.env.PROD) return;

  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? undefined : error.stack;

  errorQueue.push({
    message,
    stack,
    component: context?.component,
    url: window.location.pathname,
    userAgent: navigator.userAgent,
    level: context?.level ?? 'error',
  });

  scheduleFlush();
}

/**
 * Install global handlers for unhandled errors and promise rejections.
 * Call once at app startup.
 */
export function installGlobalErrorHandlers() {
  if (!import.meta.env.PROD) return;

  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, { component: 'window.onerror' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    reportError(message, { component: 'unhandledrejection' });
  });
}
