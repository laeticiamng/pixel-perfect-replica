import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Batch-fetches verification badges for a list of user IDs.
 * Returns a Set of user IDs that have at least one badge.
 */
export function useBatchVerificationBadges(userIds: string[]) {
  const [verifiedUserIds, setVerifiedUserIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<string>('');

  const fetchBadges = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setVerifiedUserIds(new Set());
      return;
    }

    const { data } = await supabase
      .from('verification_badges')
      .select('user_id')
      .in('user_id', ids);

    if (data) {
      setVerifiedUserIds(new Set(data.map(b => b.user_id)));
    }
  }, []);

  useEffect(() => {
    // Only refetch when the sorted list of IDs actually changes
    const key = [...userIds].sort().join(',');
    if (key === prevIdsRef.current) return;
    prevIdsRef.current = key;
    fetchBadges(userIds);
  }, [userIds, fetchBadges]);

  return verifiedUserIds;
}
