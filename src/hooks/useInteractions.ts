import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { logger } from '@/lib/logger';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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

    if (!error && data) {
      logger.action.feedbackGiven(user.id, interactionId, feedback === 'positive');
      
      // Use submit_rating RPC (SECURITY DEFINER) instead of direct user_stats access
      // This avoids RLS violations since user_stats UPDATE is blocked and SELECT is own-only
      const ratingValue = feedback === 'positive' ? 5 : 3;
      const { error: ratingError } = await supabase.rpc('submit_rating', {
        p_target_user_id: data.target_user_id,
        p_rating: ratingValue,
      });

      if (ratingError) {
        logger.api.error('user_stats', 'submit-rating', String(ratingError));
      }

      // Increment interaction counts using RPC
      await supabase.rpc('increment_interactions', { p_user_id: user.id });
      await supabase.rpc('increment_interactions', { p_user_id: data.target_user_id });
    }

    return { data, error };
  };

  // Get my interactions history
  const getMyInteractions = useCallback(async (limit: number = 50) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    // Fetch interactions without FK join (profiles RLS blocks access to other users)
    const { data: rawInteractions, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !rawInteractions) return { data: null, error };

    // Fetch target profiles via secure RPC
    const targetIds = [...new Set(rawInteractions.map(i => i.target_user_id))];
    
    let profileMap: Record<string, { first_name: string; avatar_url: string | null }> = {};
    
    if (targetIds.length > 0) {
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_ids: targetIds });
      
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = { first_name: p.first_name, avatar_url: p.avatar_url };
        }
      }
    }

    // Combine data
    const interactions: Interaction[] = rawInteractions.map(i => ({
      ...i,
      activity: i.activity as ActivityType,
      feedback: i.feedback as FeedbackType | null,
      target_profile: profileMap[i.target_user_id] || { first_name: t('eventsExtra.anonymous'), avatar_url: null },
    }));

    return { data: interactions, error: null };
  }, [user]);

  return {
    createInteraction,
    addFeedback,
    getMyInteractions,
    isLoading,
  };
}
