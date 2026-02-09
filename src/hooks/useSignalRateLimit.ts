import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MAX_SIGNALS_PER_HOUR = 10;

/**
 * Hook to enforce signal rate limiting (max 10 signals per hour).
 * Tracks signal creation count via the signal_rate_limits table
 * and provides both client-side and server-side rate limit checks.
 */
export function useSignalRateLimit() {
  const { user } = useAuth();
  const [canCreateSignal, setCanCreateSignal] = useState(true);
  const [remainingSignals, setRemainingSignals] = useState(MAX_SIGNALS_PER_HOUR);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Checks the current signal creation count against the hourly limit.
   * Queries signal_rate_limits where user_id = current user and
   * created_at is within the last hour.
   */
  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setCanCreateSignal(false);
      setRemainingSignals(0);
      return false;
    }

    setIsLoading(true);

    try {
      // Server-side check via Supabase function
      const { data: serverAllowed, error: rpcError } = await supabase.rpc(
        'check_signal_rate_limit',
        { p_user_id: user.id }
      );

      if (!rpcError && serverAllowed !== null) {
        const allowed = serverAllowed === true;
        setCanCreateSignal(allowed);

        // If server says allowed, also fetch the exact count for remaining calculation
        if (allowed) {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

          const { count, error: countError } = await supabase
            .from('signal_rate_limits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneHourAgo);

          if (!countError && count !== null) {
            const remaining = Math.max(0, MAX_SIGNALS_PER_HOUR - count);
            setRemainingSignals(remaining);
            setCanCreateSignal(remaining > 0);
            return remaining > 0;
          }
        }

        if (!allowed) {
          setRemainingSignals(0);
        }
        return allowed;
      }

      // Fallback: direct query if RPC is unavailable
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count, error: countError } = await supabase
        .from('signal_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo);

      if (countError) {
        console.error('[SignalRateLimit] Count query error:', countError);
        // Fail open to avoid blocking legitimate users
        setCanCreateSignal(true);
        setRemainingSignals(MAX_SIGNALS_PER_HOUR);
        return true;
      }

      const currentCount = count ?? 0;
      const remaining = Math.max(0, MAX_SIGNALS_PER_HOUR - currentCount);
      setCanCreateSignal(remaining > 0);
      setRemainingSignals(remaining);
      return remaining > 0;
    } catch (err) {
      console.error('[SignalRateLimit] Exception during check:', err);
      // Fail open on unexpected errors
      setCanCreateSignal(true);
      setRemainingSignals(MAX_SIGNALS_PER_HOUR);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Records a signal creation in the signal_rate_limits table.
   * Should be called after a signal is successfully created.
   * Returns true if the record was inserted successfully.
   */
  const recordSignalCreation = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('signal_rate_limits')
        .insert({ user_id: user.id });

      if (error) {
        console.error('[SignalRateLimit] Error recording signal creation:', error);
        return false;
      }

      // Update local state after successful recording
      setRemainingSignals(prev => {
        const updated = Math.max(0, prev - 1);
        setCanCreateSignal(updated > 0);
        return updated;
      });

      return true;
    } catch (err) {
      console.error('[SignalRateLimit] Exception recording signal creation:', err);
      return false;
    }
  }, [user]);

  // Check rate limit on mount and when user changes
  useEffect(() => {
    if (user) {
      checkRateLimit();
    } else {
      setCanCreateSignal(false);
      setRemainingSignals(0);
    }
  }, [user, checkRateLimit]);

  return {
    canCreateSignal,
    remainingSignals,
    maxSignalsPerHour: MAX_SIGNALS_PER_HOUR,
    isLoading,
    recordSignalCreation,
    checkRateLimit,
  };
}
