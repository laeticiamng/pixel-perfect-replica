import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionUsage {
  sessionsCreated: number;
  sessionsLimit: number;
  isPremium: boolean;
  canCreate: boolean;
  remaining: number;
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
        setUsage({
          sessionsCreated: row.sessions_created,
          sessionsLimit: row.sessions_limit,
          isPremium: row.is_premium,
          canCreate: row.can_create,
          remaining: row.sessions_limit === -1 ? Infinity : Math.max(0, row.sessions_limit - row.sessions_created),
        });
      } else {
        // Default for new users
        setUsage({
          sessionsCreated: 0,
          sessionsLimit: 4,
          isPremium: false,
          canCreate: true,
          remaining: 4,
        });
      }
    } catch (err) {
      console.error('Error fetching session usage:', err);
      // Fallback
      setUsage({
        sessionsCreated: 0,
        sessionsLimit: 4,
        isPremium: false,
        canCreate: true,
        remaining: 4,
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
    remaining: usage?.remaining ?? 4,
    isPremium: usage?.isPremium ?? false,
  };
}
