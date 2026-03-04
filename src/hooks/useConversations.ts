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
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .rpc('get_conversations_with_unread', { p_user_id: user.id });

    if (error) {
      console.error('Failed to fetch conversations:', error.message);
      setIsLoading(false);
      return;
    }

    setConversations((data || []).map((c: any) => ({
      interaction_id: c.interaction_id,
      other_user_id: c.other_user_id,
      other_user_name: c.other_user_name || 'User',
      other_user_avatar: c.other_user_avatar || null,
      last_message: c.last_message || c.icebreaker || '',
      last_message_at: c.last_message_at,
      activity: c.activity,
      message_count: Number(c.message_count) || 0,
      unread_count: Number(c.unread_count) || 0,
    })));
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for new messages to refresh conversations list
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-refresh')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return {
    conversations,
    isLoading,
    totalUnread,
    refetch: fetchConversations,
  };
}
