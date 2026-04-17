import { forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Dumbbell, BookOpen } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

/**
 * Mini in-app preview shown inside the phone mockup.
 * Replaces the abstract "radar/signal" metaphor with a concrete
 * map-like view: 3 people nearby, each with a clear activity bubble.
 * No jargon — a novice instantly gets "people available around me".
 */
export const SignalDemo = forwardRef<HTMLDivElement>(function SignalDemo(_props, ref) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActiveIndex((i) => (i + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);

  // 3 people positioned around "you" — natural map distribution
  const people = [
    {
      name: 'Léa',
      initial: 'L',
      activity: t('activities.coffee') ?? 'Café',
      icon: Coffee,
      // top-right
      x: 58,
      y: 22,
      distance: '180m',
      tone: 'bg-signal-green',
    },
    {
      name: 'Tom',
      initial: 'T',
      activity: t('activities.sport') ?? 'Sport',
      icon: Dumbbell,
      // bottom-left
      x: 18,
      y: 64,
      distance: '320m',
      tone: 'bg-signal-green',
    },
    {
      name: 'Sara',
      initial: 'S',
      activity: t('activities.studying') ?? 'Révisions',
      icon: BookOpen,
      // bottom-right
      x: 70,
      y: 70,
      distance: '450m',
      tone: 'bg-signal-yellow',
    },
  ];

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[240px] sm:max-w-[260px] aspect-square mx-auto"
      aria-label={t('landing.appPreviewTitle')}
    >
      {/* Soft "map" background — concentric distance rings + grid hint */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coral/[0.04] via-transparent to-coral/[0.06] overflow-hidden">
        {/* Subtle map grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Distance rings centered on "me" */}
        {[1, 0.7, 0.42].map((scale, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full border border-coral/15"
            style={{
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Center marker — "Me" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          {/* Pulse halo */}
          <motion.div
            animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-coral/40"
          />
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg shadow-coral/30 ring-2 ring-background">
            <span className="text-white font-bold text-sm">
              {t('landing.radarMe') ?? 'Moi'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* People around */}
      {people.map((p, i) => {
        const isActive = activeIndex === i;
        const Icon = p.icon;
        return (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.4, type: 'spring' }}
            className="absolute z-10"
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Avatar with activity ring */}
            <motion.div
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div
                className={`relative w-10 h-10 rounded-full ${p.tone} flex items-center justify-center shadow-md ring-2 ring-background transition-shadow ${
                  isActive ? 'shadow-lg shadow-signal-green/40' : ''
                }`}
              >
                <span className="text-white font-bold text-sm">{p.initial}</span>
                {/* Activity icon badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-border/40">
                  <Icon className="h-2.5 w-2.5 text-foreground" />
                </div>
              </div>

              {/* Active tooltip — name + activity */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-1/2 -translate-x-1/2 -top-9 whitespace-nowrap"
                  >
                    <div className="px-2 py-1 rounded-lg bg-foreground text-background text-[10px] font-semibold shadow-lg flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span className="opacity-60">·</span>
                      <span className="opacity-90">{p.activity}</span>
                    </div>
                    {/* tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Distance label */}
            {!isActive && (
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[9px] text-muted-foreground/70 font-medium whitespace-nowrap">
                {p.distance}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
});
