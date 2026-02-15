import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';
import { useTranslation } from '@/lib/i18n';
import { sanitizeInput } from '@/lib/sanitize';

interface Message {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface ProfileCacheEntry {
  first_name: string;
  avatar_url: string | null;
}

export function useSessionChat(sessionId: string) {
  const { user } = useAuth();
  const { showNotification } = usePushNotifications();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // PERF-05: Local profile cache to avoid re-fetching on each real-time message
  const profileCacheRef = useRef<Map<string, ProfileCacheEntry>>(new Map());

  const getProfilesCached = useCallback(async (userIds: string[]): Promise<Map<string, ProfileCacheEntry>> => {
    const cache = profileCacheRef.current;
    const uncachedIds = userIds.filter(id => !cache.has(id));

    if (uncachedIds.length > 0) {
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_ids: uncachedIds });

      (profiles || []).forEach((p: { id: string; first_name?: string; avatar_url?: string | null }) => {
        cache.set(p.id, {
          first_name: p.first_name || t('eventsExtra.anonymous'),
          avatar_url: p.avatar_url || null,
        });
      });
    }

    return cache;
  }, [t]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const uniqueUserIds = [...new Set((data || []).map(m => m.user_id))];
      const cache = await getProfilesCached(uniqueUserIds);

      const messagesWithProfiles: Message[] = (data || []).map(msg => ({
        ...msg,
        sender_name: cache.get(msg.user_id)?.first_name || t('eventsExtra.anonymous'),
        sender_avatar: cache.get(msg.user_id)?.avatar_url || null
      }));

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('[useSessionChat] Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, getProfilesCached, t]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending || !user) return { success: false };

    // SEC-08: Sanitize message content before sending
    const sanitizedContent = sanitizeInput(content.trim(), 1000);
    if (!sanitizedContent) return { success: false };

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: sanitizedContent
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

          // Use cached profiles to avoid N+1
          const cache = await getProfilesCached([newMsg.user_id]);
          const profile = cache.get(newMsg.user_id);

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
  }, [sessionId, user?.id, fetchMessages, getProfilesCached, t, showNotification]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    currentUserId: user?.id
  };
}
