import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';
import { useTranslation } from '@/lib/i18n';

interface Message {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export function useSessionChat(sessionId: string) {
  const { user } = useAuth();
  const { showNotification, isSubscribed } = usePushNotifications();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);


  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Batch profile fetch: collect unique user_ids
      const uniqueUserIds = [...new Set((data || []).map(m => m.user_id))];
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_ids: uniqueUserIds });
      
      const profileMap = new Map<string, { first_name: string; avatar_url: string | null }>();
      (profiles || []).forEach((p: any) => profileMap.set(p.id, p));

      const messagesWithProfiles: Message[] = (data || []).map(msg => ({
        ...msg,
        sender_name: profileMap.get(msg.user_id)?.first_name || t('eventsExtra.anonymous'),
        sender_avatar: profileMap.get(msg.user_id)?.avatar_url || null
      }));

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('[useSessionChat] Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending || !user) return { success: false };

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[useSessionChat] Error sending message:', error);
      return { success: false, error };
    } finally {
      setIsSending(false);
    }
  }, [sessionId, user, isSending]);

  // Subscribe to new messages (stable deps to avoid re-subscriptions)
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`session-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: profiles } = await supabase
            .rpc('get_public_profiles', { profile_ids: [newMsg.user_id] });
          const profile = profiles?.[0];
          
          const msgWithProfile = {
            ...newMsg,
            sender_name: profile?.first_name || t('eventsExtra.anonymous'),
            sender_avatar: profile?.avatar_url || null
          };

          setMessages(prev => [...prev, msgWithProfile]);
          
          if (newMsg.user_id !== user?.id) {
            showNotification(`${msgWithProfile.sender_name} 💬`, {
              body: newMsg.content.slice(0, 100),
              tag: `session-message-${newMsg.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    currentUserId: user?.id
  };
}
