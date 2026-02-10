import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Users, MessageCircle, Plus } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/utils/mockData';

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isGroup: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: Date;
}

export default function MessagesPage() {
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'hier';
    return `${diffDays}j`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Moi',
      text: newMessage.trim(),
      time: new Date(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');

    // Simulated response
    setTimeout(() => {
      const responses = [
        'D\'accord, ça marche !',
        'Top, je note 👍',
        'Haha oui 😄',
        'On fait comme ça !',
        'Super idée !',
      ];
      setMessages(prev => [...prev, {
        id: `msg-reply-${Date.now()}`,
        senderId: 'user-1',
        senderName: activeConversation?.participants[0] || 'Quelqu\'un',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date(),
      }]);
    }, 1000 + Math.random() * 2000);
  };

  // Conversation detail view
  if (activeConversation) {
    return (
      <PageLayout className="pb-28" animate={false}>
        <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col">
          {/* Header */}
          <div className="safe-top px-4 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                activeConversation.isGroup
                  ? 'bg-violet/20 text-violet'
                  : 'bg-violet text-white'
              )}>
                {activeConversation.isGroup
                  ? <Users className="h-5 w-5" />
                  : activeConversation.name.charAt(0)
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-foreground truncate">{activeConversation.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {activeConversation.isGroup
                    ? `${activeConversation.participants.length} participants`
                    : 'En ligne'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex',
                  msg.senderId === 'me' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm',
                  msg.senderId === 'me'
                    ? 'bg-violet text-white rounded-br-md'
                    : 'bg-card border border-white/10 text-foreground rounded-bl-md'
                )}>
                  {msg.senderId !== 'me' && activeConversation.isGroup && (
                    <p className="text-xs font-bold text-violet mb-1">{msg.senderName}</p>
                  )}
                  <p>{msg.text}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    msg.senderId === 'me' ? 'text-white/60' : 'text-muted-foreground'
                  )}>
                    {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écris un message..."
                className="flex-1 px-4 py-3 rounded-xl bg-card border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={cn(
                  'p-3 rounded-xl transition-all',
                  newMessage.trim()
                    ? 'bg-violet text-white shadow-[0_0_12px_hsl(263_83%_58%/0.3)]'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Conversation list
  return (
    <PageLayout className="pb-28">
      <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col">
        {/* Header */}
        <div className="safe-top px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <button className="p-2.5 rounded-xl bg-violet/10 text-violet hover:bg-violet/20 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-violet/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-violet" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Pas encore de messages</h3>
              <p className="text-sm text-muted-foreground">
                Lance une session depuis le Radar pour commencer à discuter !
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {conversations.map((conv, idx) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveConversation(conv)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-card/50 active:bg-card/70 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm',
                      conv.isGroup
                        ? 'bg-violet/20 text-violet'
                        : 'bg-violet text-white'
                    )}>
                      {conv.isGroup ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        conv.name.charAt(0)
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        'font-semibold truncate',
                        conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                      )}>
                        {conv.name}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className={cn(
                      'text-sm truncate',
                      conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}>
                      {conv.lastMessage}
                    </p>
                    {conv.isGroup && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {conv.participants.join(', ')}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 text-center">
          <p className="text-[10px] text-muted-foreground/50 font-medium">
            NEARVITY v2.0.0 — Made in France by EmotionsCare SASU
          </p>
        </div>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
