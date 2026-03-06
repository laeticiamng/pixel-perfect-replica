import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

interface Message {
  id: string;
  interaction_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useMessages(interactionId: string | null) {
  const { user } = useAuth();
  const { showNotification, isSubscribed } = usePushNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!interactionId) return;
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('interaction_id', interactionId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMessages((data || []) as Message[]);
    }
    setIsLoading(false);
  }, [interactionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!interactionId || !user) {
      return { error: new Error('Not authenticated') };
    }

    const { data, error: sendError } = await supabase
      .from('messages')
      .insert({
        interaction_id: interactionId,
        sender_id: user.id,
        content: content.trim().slice(0, 500),
      })
      .select()
      .single();

    if (sendError) {
      return { error: sendError };
    }

    setMessages(prev => [...prev, data as unknown as Message]);
    return { data };
  }, [interactionId, user]);

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!interactionId || !user) return;
    
    const { error } = await supabase
      .from('conversation_reads')
      .upsert(
        { user_id: user.id, interaction_id: interactionId, last_read_at: new Date().toISOString() },
        { onConflict: 'user_id,interaction_id' }
      );
    
    if (error) console.warn('Failed to mark as read:', error.message);
  }, [interactionId, user]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!interactionId) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages:${interactionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `interaction_id=eq.${interactionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          if (newMessage.sender_id !== user?.id && isSubscribed) {
            showNotification('Nouveau message 💬', {
              body: newMessage.content.slice(0, 100),
              tag: `message-${newMessage.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [interactionId, fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}
