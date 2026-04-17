/**
 * Observability module — unified routing for telemetry signals.
 *
 * Three channels, one severity model:
 *   - track()  → behavioural events (analytics_events table)
 *   - report() → exceptions / faults (errorReporter → log-client-error)
 *   - audit()  → consequential actions (admin_audit_logs via DB triggers / RPC)
 *
 * Severity ladder (use deliberately):
 *   info     — routine signal, sampled in production
 *   warn     — unexpected but recoverable
 *   error    — user-visible failure
 *   critical — invariant violation, data loss risk
 *
 * Design notes:
 *   - Direct INSERT into admin_audit_logs is blocked by RLS — audit() is a
 *     thin wrapper that documents intent. Real audit rows are emitted by
 *     SECURITY DEFINER triggers (e.g. audit_sensitive_profile_changes) or
 *     by RPCs running with elevated privileges.
 *   - track() uses fire-and-forget so observability never blocks UX.
 *   - Sampling for `info` keeps analytics_events lean in production.
 */

import { supabase } from '@/integrations/supabase/client';
import { reportError } from '@/lib/errorReporter';

export type Severity = 'info' | 'warn' | 'error' | 'critical';

interface TrackOptions {
  category?: string;
  severity?: Severity;
  /** Override the default sampling rate (0..1). Only applied to severity=info. */
  sampleRate?: number;
}

interface ReportOptions {
  component?: string;
  severity?: Extract<Severity, 'warn' | 'error' | 'critical'>;
}

const DEFAULT_INFO_SAMPLE_RATE = 0.25; // keep 25% of info events in prod
const IS_PROD = import.meta.env.PROD;

function shouldSample(severity: Severity, override?: number): boolean {
  if (severity !== 'info') return true;
  if (!IS_PROD) return true;
  const rate = override ?? DEFAULT_INFO_SAMPLE_RATE;
  return Math.random() < rate;
}

/**
 * Emit a behavioural event. Non-blocking, never throws.
 */
export function track(
  eventName: string,
  payload: Record<string, unknown> = {},
  options: TrackOptions = {}
): void {
  const severity: Severity = options.severity ?? 'info';
  const category = options.category ?? 'general';

  if (!shouldSample(severity, options.sampleRate)) return;

  // Fire-and-forget — never block UX on telemetry.
  void (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // RLS requires user_id = auth.uid()

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_name: eventName,
        event_category: category,
        event_data: { ...payload, severity } as never,
        page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      });
    } catch {
      // Silently swallow — analytics must never break the app.
    }
  })();
}

/**
 * Report an exception or fault. Routes to errorReporter + console (dev).
 */
export function report(
  error: Error | string | unknown,
  options: ReportOptions = {}
): void {
  const severity = options.severity ?? 'error';
  const level = severity === 'warn' ? 'warn' : 'error';

  if (!IS_PROD) {
    // In dev, surface immediately with full context.
    const tag = severity === 'critical' ? '[CRITICAL]' : `[${severity.toUpperCase()}]`;
    // eslint-disable-next-line no-console
    console[severity === 'warn' ? 'warn' : 'error'](tag, options.component ?? 'unknown', error);
  }

  reportError(error, { component: options.component, level });
}

/**
 * Document an audit-worthy action from the client side.
 *
 * NOTE: this does NOT write to admin_audit_logs directly (RLS blocks it).
 * The actual audit row is produced by:
 *   - SECURITY DEFINER triggers (e.g. profile field changes)
 *   - SECURITY DEFINER RPCs (e.g. role assignments)
 *
 * This wrapper exists to make client-side intent explicit and to mirror
 * the action into analytics_events for cross-referencing.
 */
export function audit(
  action: string,
  target: { type: string; id?: string },
  metadata: Record<string, unknown> = {}
): void {
  track(`audit.${action}`, { target_type: target.type, target_id: target.id, ...metadata }, {
    category: 'audit',
    severity: 'warn', // never sampled out
  });
}

/**
 * Convenience: time an async operation and emit perf telemetry.
 */
export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>,
  category = 'perf'
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    track(`${name}.success`, { duration_ms: Math.round(performance.now() - start) }, { category });
    return result;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    track(`${name}.failure`, { duration_ms: duration }, { category, severity: 'warn' });
    report(err, { component: name, severity: 'error' });
    throw err;
  }
}
