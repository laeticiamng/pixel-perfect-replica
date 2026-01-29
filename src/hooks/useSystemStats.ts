import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyActiveUsers {
  date: string;
  active_users: number;
}

interface SystemStats {
  total_users: number;
  active_signals: number;
  total_interactions: number;
  active_events: number;
  reports_last_24h: number;
  daily_active_users: DailyActiveUsers[];
  timestamp: string;
}

interface ErrorRate {
  error_count: number;
  total_events: number;
  error_rate_percent: number;
  health_status: 'healthy' | 'warning' | 'critical';
  period_hours: number;
  since: string;
  timestamp: string;
}

interface UserQuota {
  user_id: string;
  stats: {
    interactions: number;
    hours_active: number;
    rating: number;
    total_ratings: number;
  };
  report_count: number;
  has_active_signal: boolean;
  active_signal: {
    id: string;
    activity: string;
    expires_at: string;
  } | null;
  quotas: {
    max_interactions_per_day: number;
    max_signals_per_day: number;
    max_reports_before_review: number;
  };
  timestamp: string;
}

interface UseSystemStatsReturn {
  stats: SystemStats | null;
  errorRate: ErrorRate | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchUserQuota: (userId: string) => Promise<UserQuota | null>;
  triggerCleanup: () => Promise<boolean>;
}

export function useSystemStats(autoFetch = true): UseSystemStatsReturn {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [errorRate, setErrorRate] = useState<ErrorRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch stats and error rate in parallel
      const [statsResponse, errorRateResponse] = await Promise.all([
        supabase.functions.invoke('system', {
          body: { action: 'get-stats', days_back: 7 }
        }),
        supabase.functions.invoke('system', {
          body: { action: 'get-error-rate', hours_back: 24 }
        })
      ]);

      if (statsResponse.error) {
        throw new Error(statsResponse.error.message);
      }

      if (statsResponse.data?.success) {
        setStats(statsResponse.data.data);
      }

      if (errorRateResponse.data?.success) {
        setErrorRate(errorRateResponse.data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch system stats';
      setError(message);
      console.error('[useSystemStats] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserQuota = useCallback(async (userId: string): Promise<UserQuota | null> => {
    try {
      const response = await supabase.functions.invoke('system', {
        body: { action: 'get-user-quota', user_id: userId }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        return response.data.data as UserQuota;
      }

      return null;
    } catch (err) {
      console.error('[useSystemStats] Error fetching user quota:', err);
      return null;
    }
  }, []);

  const triggerCleanup = useCallback(async (): Promise<boolean> => {
    try {
      const response = await supabase.functions.invoke('system', {
        body: { action: 'cleanup-expired' }
      });

      return response.data?.success ?? false;
    } catch (err) {
      console.error('[useSystemStats] Error triggering cleanup:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    stats,
    errorRate,
    isLoading,
    error,
    refetch: fetchStats,
    fetchUserQuota,
    triggerCleanup
  };
}
