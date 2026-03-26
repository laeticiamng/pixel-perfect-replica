import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export function PromoVideoSection() {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <section ref={containerRef} className="py-16 sm:py-24 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            {locale === 'fr' ? 'Découvre Nearvity en 15 secondes' : 'Discover Nearvity in 15 seconds'}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            {locale === 'fr'
              ? 'Signal → Match → Rencontre. Aussi simple que ça.'
              : 'Signal → Match → Meet. It\'s that simple.'}
          </p>
        </RevealText>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl shadow-coral/10 border border-border/30"
          onClick={handlePlayPause}
        >
          {/* Ambient glow behind video */}
          <div className="absolute -inset-4 bg-gradient-to-r from-coral/10 via-purple-accent/5 to-coral/10 blur-3xl opacity-50 -z-10 rounded-3xl" />

          {/* Video element */}
          <video
            ref={videoRef}
            src="/nearvity-promo.mp4"
            className="w-full aspect-video object-cover"
            playsInline
            muted
            preload="metadata"
            onEnded={handleVideoEnd}
            poster=""
          />

          {/* Play/Pause overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
            initial={false}
            animate={{ opacity: isPlaying && hasStarted ? 0 : 1 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-coral/90 flex items-center justify-center shadow-xl shadow-coral/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              ) : (
                <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white ml-1" />
              )}
            </motion.div>
          </motion.div>

          {/* Bottom gradient for polish */}
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
