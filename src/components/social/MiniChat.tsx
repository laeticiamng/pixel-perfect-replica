import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MiniChatProps {
  interactionId: string;
  otherUserName: string;
  className?: string;
}

export function MiniChat({ interactionId, otherUserName, className }: MiniChatProps) {
  const { user } = useAuth();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    canSendMessage, 
    remainingMessages,
    maxMessages 
  } = useMessages(interactionId);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !canSendMessage || isSending) return;

    setIsSending(true);
    const { error } = await sendMessage(newMessage);
    setIsSending(false);

    if (!error) {
      setNewMessage('');
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
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">
          Chat avec {otherUserName}
        </h3>
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          remainingMessages > 3 
            ? "bg-muted text-muted-foreground" 
            : remainingMessages > 0 
              ? "bg-signal-yellow/20 text-signal-yellow"
              : "bg-signal-red/20 text-signal-red"
        )}>
          {remainingMessages}/{maxMessages} restants
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              Envoie un message pour continuer la conversation !<br />
              <span className="text-xs">({maxMessages} messages max)</span>
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isOwn ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
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
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {canSendMessage ? (
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
              onKeyPress={handleKeyPress}
              placeholder="Écris ton message..."
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
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Limite de messages atteinte 💬
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Continuez la conversation en personne !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
