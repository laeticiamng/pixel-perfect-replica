import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n';

interface MiniChatProps {
  interactionId: string;
  otherUserName: string;
  className?: string;
}

export function MiniChat({ interactionId, otherUserName, className }: MiniChatProps) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const { messages, isLoading, sendMessage, markAsRead } = useMessages(interactionId);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  // Mark as read when opening chat and when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    const { error } = await sendMessage(newMessage);
    setIsSending(false);
    if (!error) setNewMessage('');
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">
          {t('miniChat.chatWith').replace('{name}', otherUserName)}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              {t('miniChat.emptyPrompt')}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div key={message.id} className={cn("flex flex-col max-w-[80%]", isOwn ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn("px-4 py-2 rounded-2xl text-sm", isOwn ? "bg-coral text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md")}>
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: dateFnsLocale })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
            onKeyPress={handleKeyPress}
            placeholder={t('miniChat.placeholder')}
            className="flex-1 bg-muted border-border rounded-xl"
            disabled={isSending}
            aria-label={t('miniChat.sendLabel')}
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="bg-coral hover:bg-coral-dark rounded-xl px-4" aria-label={t('miniChat.sendLabel')}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
