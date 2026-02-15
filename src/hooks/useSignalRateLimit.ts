import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MAX_SIGNALS_PER_HOUR = 10;

/**
 * Hook to enforce signal rate limiting (max 10 signals per hour).
 * Uses edge_function_rate_limits table for tracking.
 */
export function useSignalRateLimit() {
  const { user } = useAuth();
  const [canCreateSignal, setCanCreateSignal] = useState(true);
  const [remainingSignals, setRemainingSignals] = useState(MAX_SIGNALS_PER_HOUR);
  const [isLoading, setIsLoading] = useState(false);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setCanCreateSignal(false);
      setRemainingSignals(0);
      return false;
    }

    setIsLoading(true);

    try {
      const { data: serverAllowed, error: rpcError } = await supabase.rpc(
        'check_edge_function_rate_limit',
        { p_user_id: user.id, p_function_name: 'signal_activate', p_max_requests: MAX_SIGNALS_PER_HOUR, p_window_seconds: 3600 }
      );

      if (!rpcError && serverAllowed !== null && serverAllowed !== undefined) {
        const allowed = serverAllowed === true;
        setCanCreateSignal(allowed);

        if (allowed) {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

          const { count, error: countError } = await supabase
            .from('edge_function_rate_limits')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('function_name', 'signal_activate')
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

      // Fallback: direct query
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count, error: countError } = await supabase
        .from('edge_function_rate_limits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('function_name', 'signal_activate')
        .gte('created_at', oneHourAgo);

      if (countError) {
        console.error('[SignalRateLimit] Count query error:', countError);
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
      setCanCreateSignal(true);
      setRemainingSignals(MAX_SIGNALS_PER_HOUR);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const recordSignalCreation = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('edge_function_rate_limits')
        .insert({ user_id: user.id, function_name: 'signal_activate' });

      if (error) {
        console.error('[SignalRateLimit] Error recording signal creation:', error);
        return false;
      }

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
