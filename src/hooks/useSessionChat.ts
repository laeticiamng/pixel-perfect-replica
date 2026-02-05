import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchSenderProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .rpc('get_public_profile_secure', { p_user_id: userId });
    return {
      name: data?.[0]?.first_name || 'Utilisateur',
      avatar: data?.[0]?.avatar_url || null
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesWithProfiles: Message[] = [];
      for (const msg of data || []) {
        const profile = await fetchSenderProfile(msg.user_id);
        messagesWithProfiles.push({
          ...msg,
          sender_name: profile.name,
          sender_avatar: profile.avatar
        });
      }

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('[useSessionChat] Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, fetchSenderProfile]);

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

  // Subscribe to new messages
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
          const profile = await fetchSenderProfile(newMsg.user_id);
          
          const msgWithProfile = {
            ...newMsg,
            sender_name: profile.name,
            sender_avatar: profile.avatar
          };

          setMessages(prev => [...prev, msgWithProfile]);
          
          if (newMsg.user_id !== user?.id && isSubscribed) {
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
  }, [sessionId, fetchMessages, fetchSenderProfile, user?.id, isSubscribed, showNotification]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    currentUserId: user?.id
  };
}
