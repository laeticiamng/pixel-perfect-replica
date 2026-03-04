import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  interaction_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: string;
  activity: string;
  message_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    // Get all interactions where user is involved
    const { data: interactions, error } = await supabase
      .from('interactions')
      .select('*')
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error || !interactions) {
      setIsLoading(false);
      return;
    }

    // For each interaction, get the last message and other user's profile
    const convos: Conversation[] = [];
    
    for (const interaction of interactions) {
      const otherUserId = interaction.user_id === user.id 
        ? interaction.target_user_id 
        : interaction.user_id;

      // Get last message
      const { data: messages } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('interaction_id', interaction.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get profile via RPC
      const { data: profileData } = await supabase
        .rpc('get_profile_for_display', { p_user_id: otherUserId });

      const profile = profileData?.[0];
      const lastMsg = messages?.[0];

      // Get message count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('interaction_id', interaction.id);

      convos.push({
        interaction_id: interaction.id,
        other_user_id: otherUserId,
        other_user_name: profile?.first_name || 'Utilisateur',
        other_user_avatar: profile?.avatar_url || null,
        last_message: lastMsg?.content || interaction.icebreaker || '',
        last_message_at: lastMsg?.created_at || interaction.created_at,
        activity: interaction.activity,
        message_count: count || 0,
      });
    }

    // Sort by most recent message
    convos.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    setConversations(convos);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    refetch: fetchConversations,
  };
}
