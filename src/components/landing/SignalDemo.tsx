import { forwardRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Dumbbell, Coffee } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const SignalDemo = forwardRef<HTMLDivElement>(function SignalDemo(_props, ref) {
  const { t } = useTranslation();
  const [activeSignal, setActiveSignal] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const signals = [
    { color: 'bg-signal-green', glow: 'glow-green', label: t('activities.studying'), icon: BookOpen },
    { color: 'bg-signal-green', glow: 'glow-green', label: t('activities.sport'), icon: Dumbbell },
    { color: 'bg-signal-yellow', glow: 'glow-yellow', label: t('activities.talking'), icon: Coffee },
  ];
  
  return (
    <div ref={ref} className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto">
      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border border-coral/20" />
        <div className="absolute w-3/4 h-3/4 rounded-full border border-coral/30" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-coral/40" />
      </div>
      
      {/* Center - You */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg glow-coral">
          <span className="text-white font-bold">T</span>
        </div>
      </div>
      
      {/* Animated signals around */}
      {signals.map((signal, i) => {
        const angle = (i / signals.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 80;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: activeSignal === i ? 1.2 : 1,
              opacity: 1,
              x: x - 20,
              y: y - 20,
            }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <div className={`w-10 h-10 rounded-full ${signal.color} ${activeSignal === i ? signal.glow : ''} flex items-center justify-center shadow-md transition-all duration-300`}>
              <signal.icon className="h-4 w-4 text-white" />
            </div>
            {activeSignal === i && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground"
              >
                {signal.label}
              </motion.div>
            )}
          </motion.div>
        );
      })}
      
      {/* Radar sweep */}
      <div className="absolute inset-0 animate-radar-sweep origin-center pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--coral) / 0.8), transparent)',
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
});
