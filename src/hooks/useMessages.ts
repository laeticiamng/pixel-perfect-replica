import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

const MAX_MESSAGES = 10;

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

  // Fetch messages for interaction
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
      setMessages(data || []);
    }
    
    setIsLoading(false);
  }, [interactionId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!interactionId || !user) {
      return { error: new Error('Not authenticated') };
    }

    // Check message limit
    if (messages.length >= MAX_MESSAGES) {
      return { error: new Error(`Limite de ${MAX_MESSAGES} messages atteinte`) };
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

    setMessages(prev => [...prev, data]);
    return { data };
  }, [interactionId, user, messages.length]);

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
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          
          // Show push notification for messages from other users
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

  const canSendMessage = messages.length < MAX_MESSAGES;
  const remainingMessages = MAX_MESSAGES - messages.length;

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    canSendMessage,
    remainingMessages,
    maxMessages: MAX_MESSAGES,
    refetch: fetchMessages,
  };
}
