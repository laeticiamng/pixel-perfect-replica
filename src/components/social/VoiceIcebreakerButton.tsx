import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceIcebreaker } from '@/hooks/useVoiceIcebreaker';
import { cn } from '@/lib/utils';

interface VoiceIcebreakerButtonProps {
  text: string;
  className?: string;
  variant?: 'icon' | 'full';
}

export function VoiceIcebreakerButton({
  text,
  className = '',
  variant = 'icon',
}: VoiceIcebreakerButtonProps) {
  const { playIcebreaker, stopPlayback, isLoading, isPlaying, error } = useVoiceIcebreaker();

  const handleClick = async () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      await playIcebreaker(text);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="ghost"
        size="icon"
        className={cn(
          'relative rounded-full transition-all',
          isPlaying && 'bg-coral/20 text-coral',
          className
        )}
        title={isPlaying ? 'Arrêter' : 'Écouter'}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <VolumeX className="h-4 w-4" />
          </motion.div>
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
        
        {/* Audio wave animation when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full"
            >
              <span className="absolute inset-0 rounded-full animate-ping bg-coral/30" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className={cn(
        'gap-2 border-coral/30 hover:border-coral hover:bg-coral/5',
        isPlaying && 'bg-coral/10 border-coral',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Génération...</span>
        </>
      ) : isPlaying ? (
        <>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <VolumeX className="h-4 w-4" />
          </motion.div>
          <span>Arrêter</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-coral" />
          <Volume2 className="h-4 w-4" />
          <span>Écouter l'icebreaker</span>
        </>
      )}
    </Button>
  );
}
