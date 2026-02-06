import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSessionChat } from '@/hooks/useSessionChat';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { ChatEmptyState } from './ChatEmptyState';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n';

interface SessionChatProps {
  sessionId: string;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  const { messages, isLoading, isSending, sendMessage, currentUserId } = useSessionChat(sessionId);
  const { t, locale } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    const result = await sendMessage(content);
    if (!result.success && result.error) {
      toast.error(t('sessionChat.sendError'));
    }
    return result;
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              content={message.content}
              createdAt={message.created_at}
              senderName={message.sender_name}
              senderAvatar={message.sender_avatar}
              isOwn={message.user_id === currentUserId}
              locale={locale}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} isSending={isSending} />
    </div>
  );
}
