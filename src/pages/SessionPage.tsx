import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Send, Star, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACTIVITY_CONFIG } from '@/types/signal';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: Date;
}

export default function SessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const partner = location.state?.partner;
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [sessionActive, setSessionActive] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState<boolean | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'partner',
      senderName: partner?.firstName || 'Partenaire',
      text: 'Hey ! Ravi·e de cette session 🙌',
      time: new Date(),
    },
  ]);

  // Timer
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    setSessionActive(false);
    setShowFeedback(true);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Moi',
      text: chatMessage.trim(),
      time: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');

    // Simulated response
    setTimeout(() => {
      const responses = [
        'Trop bien ! 🔥',
        'Je suis d\'accord !',
        'On est bien partis 💪',
        'Haha oui carrément',
        'Tu gères !',
      ];
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-reply`,
        senderId: 'partner',
        senderName: partner?.firstName || 'Partenaire',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date(),
      }]);
    }, 1500 + Math.random() * 2000);
  };

  const handleSubmitFeedback = () => {
    setFeedbackSent(true);
    setTimeout(() => {
      navigate('/app/radar');
    }, 2000);
  };

  const activity = partner?.activity || 'other';
  const activityConfig = ACTIVITY_CONFIG[activity];

  // No partner - redirect
  if (!partner && !sessionActive) {
    return (
      <PageLayout className="pb-28">
        <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col items-center justify-center px-6">
          <p className="text-muted-foreground text-center mb-4">Aucune session active</p>
          <button
            onClick={() => navigate('/app/radar')}
            className="px-6 py-3 rounded-xl bg-violet text-white font-bold"
          >
            Retour au Radar
          </button>
          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Feedback screen
  if (showFeedback && !feedbackSent) {
    return (
      <PageLayout className="pb-28">
        <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-violet/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Session terminée !</h2>
                <p className="text-muted-foreground">
                  {formatTime(elapsedSeconds)} avec {partner?.firstName || 'ton binôme'}
                </p>
              </div>

              {/* Star rating */}
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-foreground mb-3">Comment s'est passée la session ?</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-all duration-200 hover:scale-110"
                    >
                      <Star
                        className={cn(
                          'h-10 w-10 transition-colors',
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Meet again */}
              <div className="text-center mb-8">
                <p className="text-sm font-medium text-foreground mb-3">Revoir cette personne ?</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setWouldMeetAgain(true)}
                    className={cn(
                      'px-6 py-3 rounded-xl font-bold text-sm transition-all',
                      wouldMeetAgain === true
                        ? 'bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.4)]'
                        : 'bg-card border border-white/10 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Oui, avec plaisir ! 👍
                  </button>
                  <button
                    onClick={() => setWouldMeetAgain(false)}
                    className={cn(
                      'px-6 py-3 rounded-xl font-bold text-sm transition-all',
                      wouldMeetAgain === false
                        ? 'bg-gray-600 text-white'
                        : 'bg-card border border-white/10 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Pas cette fois
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className={cn(
                  'w-full py-4 rounded-xl font-bold text-sm transition-all',
                  rating > 0
                    ? 'bg-violet text-white shadow-[0_0_20px_hsl(263_83%_58%/0.3)]'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                Envoyer le feedback
              </button>
            </motion.div>
          </div>
          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Feedback sent confirmation
  if (feedbackSent) {
    return (
      <PageLayout className="pb-28">
        <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Merci !</h2>
            <p className="text-muted-foreground">Retour au radar...</p>
          </motion.div>
          <BottomNav />
        </div>
      </PageLayout>
    );
  }

  // Active session
  return (
    <PageLayout className="pb-28" animate={false}>
      <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col">
        {/* Session header */}
        <div className="safe-top px-4 pt-4 pb-3">
          <div className="glass-strong rounded-2xl p-4 shadow-medium">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navigate('/app/radar')} className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet flex items-center justify-center text-white font-bold text-sm">
                  {partner?.firstName?.charAt(0) || '?'}
                </div>
                <span className="font-bold text-foreground">{partner?.firstName || 'Partenaire'}</span>
              </div>
              <button
                onClick={handleEndSession}
                className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-colors"
              >
                Terminer
              </button>
            </div>

            {/* Timer + Activity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-violet" />
                <span className="font-mono text-lg font-bold text-foreground">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet/10 border border-violet/20">
                <span>{activityConfig?.emoji || '✨'}</span>
                <span className="text-sm font-medium text-violet">
                  {activityConfig?.label || 'Activité'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Chat */}
        <div className="flex-1 min-h-0 flex flex-col px-4">
          <div className="flex-1 overflow-y-auto space-y-3 py-3">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
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
                  {msg.senderId !== 'me' && (
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

          {/* Chat input */}
          <div className="py-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écris un message..."
                className="flex-1 px-4 py-3 rounded-xl bg-card border border-white/10 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-violet/50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className={cn(
                  'p-3 rounded-xl transition-all',
                  chatMessage.trim()
                    ? 'bg-violet text-white shadow-[0_0_12px_hsl(263_83%_58%/0.3)]'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
