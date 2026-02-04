import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useEventFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('event_favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.event_id) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((eventId: string) => {
    return favorites.includes(eventId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (eventId: string) => {
    if (!user) return { error: 'Not authenticated' };

    setIsLoading(true);
    try {
      if (isFavorite(eventId)) {
        // Remove favorite
        const { error } = await supabase
          .from('event_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== eventId));
      } else {
        // Add favorite
        const { error } = await supabase
          .from('event_favorites')
          .insert({ user_id: user.id, event_id: eventId });

        if (error) throw error;
        setFavorites(prev => [...prev, eventId]);
      }
      return { error: null };
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      return { error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, isFavorite]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoading,
    refetch: fetchFavorites,
  };
}
