import { useState, useRef, useEffect } from 'react';
import { X, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITIES } from '@/types/signal';
import type { GroupSignal } from '@/hooks/useGroupSignals';

interface GroupChatPanelProps {
  group: GroupSignal;
  onClose: () => void;
}

export function GroupChatPanel({ group, onClose }: GroupChatPanelProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { messages, sendMessage, isLoading } = useGroupChat(group.id);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const activity = ACTIVITIES.find(a => a.id === group.activity);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-[70] max-w-[500px] mx-auto h-[70dvh] bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-coral/10 flex items-center justify-center text-base shrink-0">
            {activity?.emoji || '✨'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground truncate text-sm">{group.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {group.current_members}/{group.max_participants} {t('groupSignal.members')}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t('loading')}</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t('groupSignal.chatEmpty')}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                    {msg.sender_avatar ? (
                      <img src={msg.sender_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      msg.sender_name?.charAt(0).toUpperCase()
                    )}
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
                  isMe
                    ? 'bg-coral text-white rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}>
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{msg.sender_name}</p>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('groupSignal.typeMessage')}
            className="flex-1 h-11 rounded-xl bg-muted/50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="h-11 w-11 rounded-xl bg-coral hover:bg-coral-dark text-primary-foreground shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
