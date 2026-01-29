import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Message {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface SessionChatProps {
  sessionId: string;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch sender profiles
      const messagesWithProfiles: Message[] = [];
      for (const msg of data || []) {
        const { data: profileData } = await supabase
          .rpc('get_public_profile_secure', { p_user_id: msg.user_id });
        
        messagesWithProfiles.push({
          ...msg,
          sender_name: profileData?.[0]?.first_name || 'Utilisateur',
          sender_avatar: profileData?.[0]?.avatar_url || null
        });
      }

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('[SessionChat] Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
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
          // Fetch sender profile
          const { data: profileData } = await supabase
            .rpc('get_public_profile_secure', { p_user_id: newMsg.user_id });
          
          const msgWithProfile = {
            ...newMsg,
            sender_name: profileData?.[0]?.first_name || 'Utilisateur',
            sender_avatar: profileData?.[0]?.avatar_url || null
          };

          setMessages(prev => [...prev, msgWithProfile]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      console.error('[SessionChat] Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col glass rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center py-12">
            <p className="text-muted-foreground text-sm">
              Aucun message pour l'instant 💬<br />
              <span className="text-xs">Sois le premier à écrire !</span>
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isOwn ? "flex-row-reverse" : "flex-row"
                )}
              >
                {!isOwn && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.sender_avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {message.sender_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "flex flex-col max-w-[75%]",
                  isOwn ? "items-end" : "items-start"
                )}>
                  {!isOwn && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {message.sender_name}
                    </span>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm",
                      isOwn 
                        ? "bg-coral text-primary-foreground rounded-br-md" 
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    {message.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(new Date(message.created_at), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
            onKeyPress={handleKeyPress}
            placeholder="Écris un message..."
            className="flex-1 bg-muted border-border rounded-xl"
            disabled={isSending}
            aria-label="Message"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="bg-coral hover:bg-coral-dark rounded-xl px-4"
            aria-label="Envoyer le message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
