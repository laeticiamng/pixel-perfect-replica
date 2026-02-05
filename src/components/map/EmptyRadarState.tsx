import { Radio, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface EmptyRadarStateProps {
  onActivateSignal: () => void;
  isDemoMode?: boolean;
  onEnableDemo?: () => void;
}

export function EmptyRadarState({ onActivateSignal, isDemoMode, onEnableDemo }: EmptyRadarStateProps) {
  const { t } = useTranslation();
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EASY - Le premier réseau social 100% réel',
          text: 'Rejoins-moi sur EASY pour des rencontres spontanées en vrai !',
          url: window.location.origin,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      {/* Animated radar visualization */}
      <div className="relative w-48 h-48 mb-8">
        {/* Radar circles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 rounded-full border border-muted/30" />
          <div className="absolute inset-[25%] rounded-full border border-muted/40" />
          <div className="absolute inset-[50%] rounded-full border border-muted/50" />
        </motion.div>
        
        {/* Radar sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--coral) / 0.6), transparent)',
            }}
          />
          {/* Sweep trail */}
          <div 
            className="absolute top-1/2 left-1/2 w-1/2 h-full origin-left -rotate-30"
            style={{
              background: 'conic-gradient(from 0deg, transparent, hsl(var(--coral) / 0.1) 30deg, transparent 60deg)',
              clipPath: 'polygon(0 50%, 100% 0, 100% 100%)',
            }}
          />
        </motion.div>
        
        {/* Center dot - You */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center shadow-lg glow-coral">
            <span className="text-white font-bold text-sm">T</span>
          </div>
        </motion.div>
        
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-coral/50"
        />
      </div>
      
      {/* Message */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-6"
      >
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t('map.noOneAround')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {t('map.beTheFirst')}
        </p>
      </motion.div>
      
      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button
          onClick={onActivateSignal}
          className="h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl font-semibold glow-coral"
        >
          <Radio className="h-5 w-5 mr-2" />
          {t('map.activateMySignal')}
        </Button>
        
        <Button
          onClick={handleShare}
          variant="outline"
          className="h-12 rounded-xl border-2"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t('map.inviteFriends')}
        </Button>
        
        {!isDemoMode && onEnableDemo && (
          <Button
            onClick={onEnableDemo}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t('map.seeDemo')}
          </Button>
        )}
      </motion.div>
    </div>
  );
}
