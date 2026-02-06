import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

interface ChatInputProps {
  onSend: (content: string) => Promise<{ success: boolean }>;
  isSending: boolean;
  maxLength?: number;
}

export function ChatInput({ onSend, isSending, maxLength = 500 }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    const result = await onSend(message);
    if (result.success) setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyPress={handleKeyPress}
          placeholder={t('sessionChat.placeholder')}
          className="flex-1 bg-muted border-border rounded-xl"
          disabled={isSending}
          aria-label={t('sessionChat.sendMessage')}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="bg-coral hover:bg-coral-dark rounded-xl px-4"
          aria-label={t('sessionChat.sendMessage')}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
