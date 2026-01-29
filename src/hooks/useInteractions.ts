import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { logger } from '@/lib/logger';

type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';
type FeedbackType = 'positive' | 'negative';

interface Interaction {
  id: string;
  user_id: string;
  target_user_id: string;
  activity: ActivityType;
  icebreaker: string | null;
  feedback: FeedbackType | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  target_profile?: {
    first_name: string;
    avatar_url: string | null;
  };
}

export function useInteractions() {
  const { user } = useAuth();
  const { position } = useLocationStore();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new interaction
  const createInteraction = async (
    targetUserId: string,
    activity: ActivityType,
    icebreaker?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        activity: activity,
        icebreaker: icebreaker || null,
        latitude: position?.latitude || null,
        longitude: position?.longitude || null,
      })
      .select()
      .single();

    setIsLoading(false);
    
    if (!error && data) {
      logger.action.interactionCreated(user.id, targetUserId);
    }
    
    return { data, error };
  };

  // Add feedback to an interaction
  const addFeedback = async (interactionId: string, feedback: FeedbackType) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('interactions')
      .update({ feedback })
      .eq('id', interactionId)
      .eq('user_id', user.id)
      .select()
      .single();

    // Update target user's rating if feedback is positive or negative
    if (!error && data) {
      logger.action.feedbackGiven(user.id, interactionId, feedback === 'positive');
      
      const newRating = feedback === 'positive' ? 5.0 : 3.0;
      
      // Get current stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('rating, total_ratings')
        .eq('user_id', data.target_user_id)
        .single();

      if (statsData) {
        const totalRatings = statsData.total_ratings + 1;
        const avgRating = 
          (Number(statsData.rating) * statsData.total_ratings + newRating) / totalRatings;

        await supabase
          .from('user_stats')
          .update({
            rating: Math.round(avgRating * 100) / 100,
            total_ratings: totalRatings,
          })
          .eq('user_id', data.target_user_id);
      }

      // Increment interaction counts using RPC to avoid race conditions
      await supabase.rpc('increment_interactions', { p_user_id: user.id });
      await supabase.rpc('increment_interactions', { p_user_id: data.target_user_id });
    }

    return { data, error };
  };

  // Get my interactions history
  const getMyInteractions = useCallback(async (limit: number = 50) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        target_profile:profiles!interactions_target_user_id_fkey(
          first_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data: data as Interaction[] | null, error };
  }, [user]);

  return {
    createInteraction,
    addFeedback,
    getMyInteractions,
    isLoading,
  };
}
