import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useExperienceStore } from '@/experience/core/experience-store';

const toneClasses = {
  calm: 'from-white/4 via-white/2 to-transparent',
  warm: 'from-coral/16 via-orange-200/8 to-transparent',
  anticipation: 'from-amber-300/18 via-coral/10 to-transparent',
  focus: 'from-sky-200/10 via-white/4 to-transparent',
  celebration: 'from-amber-200/16 via-coral/14 to-transparent',
  trust: 'from-cyan-100/10 via-white/5 to-transparent',
} as const;

interface AmbientLayerProps {
  className?: string;
}

export const AmbientLayer = memo(function AmbientLayer({ className }: AmbientLayerProps) {
  const immersionLevel = useExperienceStore((state) => state.immersionLevel);
  const emotionalTone = useExperienceStore((state) => state.emotionalTone);
  const ambientDensity = useExperienceStore((state) => state.ambientDensity);
  const motionMode = useExperienceStore((state) => state.motionMode);
  const reducedExperience = useExperienceStore((state) => state.reducedExperience);

  if (immersionLevel === 0) {
    return <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-radial opacity-60" aria-hidden="true" />;
  }

  const opacity = reducedExperience ? 0.2 : 0.16 + ambientDensity * 0.28;
  const blur = reducedExperience ? 'blur-3xl' : immersionLevel >= 2 ? 'blur-[120px]' : 'blur-[90px]';
  const shouldAnimate = motionMode === 'full' && !reducedExperience;

  return (
    <div className={cn('fixed inset-0 overflow-hidden pointer-events-none z-0', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-radial opacity-90" />

      <motion.div
        className={cn('absolute -left-24 top-[14%] h-80 w-80 rounded-full bg-gradient-to-br', toneClasses[emotionalTone], blur)}
        animate={shouldAnimate ? { x: [0, 14, 0], y: [0, -12, 0], scale: [1, 1.03, 1] } : undefined}
        transition={shouldAnimate ? { duration: 15, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{ opacity }}
      />

      <motion.div
        className={cn('absolute right-[-8rem] top-[34%] h-72 w-72 rounded-full bg-gradient-to-br', toneClasses[emotionalTone], blur)}
        animate={shouldAnimate ? { x: [0, -18, 0], y: [0, 14, 0], scale: [1, 1.05, 1] } : undefined}
        transition={shouldAnimate ? { duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } : undefined}
        style={{ opacity: opacity * 0.92 }}
      />

      {immersionLevel >= 2 && (
        <motion.div
          className={cn('absolute bottom-[8%] left-[28%] h-64 w-64 rounded-full bg-gradient-to-br', toneClasses[emotionalTone], blur)}
          animate={shouldAnimate ? { y: [0, -10, 0], scale: [1, 1.04, 1] } : undefined}
          transition={shouldAnimate ? { duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 } : undefined}
          style={{ opacity: opacity * 0.72 }}
        />
      )}

      {immersionLevel >= 3 && !reducedExperience && (
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/8 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-coral/6 to-transparent" />
        </div>
      )}
    </div>
  );
});
