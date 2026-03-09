import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { motion, MotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface HeroSectionProps {
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
}

export function HeroSection({ heroOpacity, heroScale }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.section 
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 pt-16"
    >
      {/* Tagline badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/60 bg-card/60 backdrop-blur-md hover:border-coral/40 transition-all duration-300 cursor-default">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-coral/10 via-transparent to-coral/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkles className="h-3.5 w-3.5 text-coral relative z-10" />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground relative z-10">
            {t('landing.heroTagline')}
          </span>
        </div>
      </motion.div>

      {/* Main Title with shimmer effect */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-center tracking-tight mb-6"
      >
        <span className="relative inline-block">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('landing.seeWhoIsOpen')}
          </span>
        </span>
        <br />
        <span className="relative inline-block">
          <span className="hero-shimmer bg-gradient-to-r from-coral via-coral-light via-50% to-coral bg-clip-text text-transparent bg-[length:200%_100%]">
            {t('landing.openToInteract')}
          </span>
        </span>
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground text-center max-w-lg mb-10 leading-relaxed"
      >
        {t('landing.heroSubtitle')}
      </motion.p>
      
      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => navigate('/onboarding')}
          size="lg"
          className="group h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-black bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl shadow-coral/25 hover:shadow-coral/40 transition-all duration-300 hover:scale-105"
        >
          {t('landing.createMyAccount')}
          <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      {/* Discrete login link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-sm text-muted-foreground"
      >
        {t('landing.alreadyAccount')}{' '}
        <button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          className="text-coral hover:underline font-medium transition-colors"
        >
          {t('auth.signIn')}
        </button>
      </motion.p>

      {/* PWA Install hint - visible on mobile */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => navigate('/install')}
        className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-coral transition-colors sm:hidden"
      >
        <Download className="h-3.5 w-3.5" />
        {t('landing.install')}
      </motion.button>
      
      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-2.5 bg-coral rounded-full"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
