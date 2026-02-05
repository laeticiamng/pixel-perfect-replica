import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSessionChat } from '@/hooks/useSessionChat';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatInput } from './ChatInput';
import { ChatEmptyState } from './ChatEmptyState';
import { toast } from 'sonner';

interface SessionChatProps {
  sessionId: string;
}

export function SessionChat({ sessionId }: SessionChatProps) {
  const { messages, isLoading, isSending, sendMessage, currentUserId } = useSessionChat(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    const result = await sendMessage(content);
    if (!result.success && result.error) {
      toast.error('Erreur lors de l\'envoi du message');
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
      {/* Messages */}
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
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isSending={isSending} />
    </div>
  );
}
