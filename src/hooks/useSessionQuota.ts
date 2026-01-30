import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionUsage {
  sessionsCreated: number;
  sessionsLimit: number;
  isPremium: boolean;
  canCreate: boolean;
  remaining: number;
  purchasedSessions: number;
  freeRemaining: number;
}

export function useSessionQuota() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<SessionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!user?.id) {
      setUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_current_month_usage', { p_user_id: user.id });

      if (error) throw error;

      if (data && data.length > 0) {
        const row = data[0];
        const limit = row.sessions_limit === -1 ? Infinity : row.sessions_limit;
        const purchased = row.purchased_sessions || 0;
        const freeLimit = 2; // Free tier: 2 sessions/month
        const freeUsed = Math.min(row.sessions_created, freeLimit);
        const freeRemaining = Math.max(0, freeLimit - freeUsed);
        
        setUsage({
          sessionsCreated: row.sessions_created,
          sessionsLimit: row.sessions_limit,
          isPremium: row.is_premium,
          canCreate: row.can_create,
          remaining: row.sessions_limit === -1 ? Infinity : Math.max(0, row.sessions_limit - row.sessions_created),
          purchasedSessions: purchased,
          freeRemaining,
        });
      } else {
        // Default for new users
        setUsage({
          sessionsCreated: 0,
          sessionsLimit: 2,
          isPremium: false,
          canCreate: true,
          remaining: 2,
          purchasedSessions: 0,
          freeRemaining: 2,
        });
      }
    } catch (err) {
      console.error('Error fetching session usage:', err);
      // Fallback
      setUsage({
        sessionsCreated: 0,
        sessionsLimit: 2,
        isPremium: false,
        canCreate: true,
        remaining: 2,
        purchasedSessions: 0,
        freeRemaining: 2,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { 
    usage, 
    isLoading, 
    refetch: fetchUsage,
    canCreate: usage?.canCreate ?? true,
    remaining: usage?.remaining ?? 2,
    isPremium: usage?.isPremium ?? false,
    purchasedSessions: usage?.purchasedSessions ?? 0,
    freeRemaining: usage?.freeRemaining ?? 2,
  };
}
