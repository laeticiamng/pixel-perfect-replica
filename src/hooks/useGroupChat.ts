import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface GroupMessage {
  id: string;
  group_signal_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export function useGroupChat(groupSignalId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { first_name: string; avatar_url: string | null }>>({});

  const fetchMessages = useCallback(async () => {
    if (!groupSignalId || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_signal_messages')
        .select('*')
        .eq('group_signal_id', groupSignalId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set((data || []).map(m => m.sender_id))];
      if (senderIds.length > 0) {
        const { data: profileData } = await supabase.rpc('get_public_profiles', { profile_ids: senderIds });
        const profileMap: Record<string, { first_name: string; avatar_url: string | null }> = {};
        (profileData || []).forEach(p => {
          profileMap[p.id] = { first_name: p.first_name, avatar_url: p.avatar_url };
        });
        setProfiles(profileMap);
      }

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching group messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [groupSignalId, user]);

  const sendMessage = async (content: string) => {
    if (!groupSignalId || !user || !content.trim()) return;

    const { error } = await supabase
      .from('group_signal_messages')
      .insert({
        group_signal_id: groupSignalId,
        sender_id: user.id,
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending group message:', error);
    }
  };

  // Realtime subscription for new messages
  useEffect(() => {
    if (!groupSignalId || !user) return;

    fetchMessages();

    const channel = supabase
      .channel(`group-chat-${groupSignalId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_signal_messages',
          filter: `group_signal_id=eq.${groupSignalId}`,
        },
        async (payload) => {
          const newMsg = payload.new as GroupMessage;
          // Fetch profile if unknown
          if (!profiles[newMsg.sender_id]) {
            const { data } = await supabase.rpc('get_public_profiles', { profile_ids: [newMsg.sender_id] });
            if (data?.[0]) {
              setProfiles(prev => ({ ...prev, [newMsg.sender_id]: { first_name: data[0].first_name, avatar_url: data[0].avatar_url } }));
            }
          }
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupSignalId, user?.id]);

  const enrichedMessages = messages.map(m => ({
    ...m,
    sender_name: profiles[m.sender_id]?.first_name || 'User',
    sender_avatar: profiles[m.sender_id]?.avatar_url || null,
  }));

  return {
    messages: enrichedMessages,
    isLoading,
    sendMessage,
  };
}
