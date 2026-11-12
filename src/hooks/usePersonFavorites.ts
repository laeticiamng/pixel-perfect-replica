import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/** Personal favorites never change server-side discovery eligibility. */
export function usePersonFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setFavoriteIds([]); return; }
    setIsLoading(true);
    try {
      // Migration must be deployed before this feature is enabled.
      const { data, error } = await supabase
        .from('person_favorites' as never)
        .select('favorite_id')
        .eq('owner_id', user.id);
      if (error) throw error;
      setFavoriteIds(((data || []) as { favorite_id: string }[]).map(row => row.favorite_id));
    } catch {
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toggle = useCallback(async (favoriteId: string) => {
    if (!user || favoriteId === user.id) return false;
    const isFavorite = favoriteIds.includes(favoriteId);
    const query = supabase.from('person_favorites' as never);
    const { error } = isFavorite
      ? await query.delete().eq('owner_id', user.id).eq('favorite_id', favoriteId)
      : await query.insert({ owner_id: user.id, favorite_id: favoriteId } as never);
    if (error) return false;
    await refresh();
    return true;
  }, [user?.id, favoriteIds, refresh]);

  return { favoriteIds, isLoading, toggle, refresh };
}
