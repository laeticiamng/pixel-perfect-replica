import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      {/* Main Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-7xl lg:text-8xl font-extrabold text-center tracking-tight mb-6"
      >
        <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          {t('landing.seeWhoIsOpen')}
        </span>
        <br />
        <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
          {t('landing.openToInteract')}
        </span>
      </motion.h1>
      
      {/* Subtitle - single concise line */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground text-center max-w-lg mb-6 leading-relaxed"
      >
        {t('landing.heroSubtitle')}
      </motion.p>

      {/* "Not a dating app" badge - below subtitle for clear hierarchy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30">
          <span className="text-sm font-bold text-destructive">⚠️ {t('landing.notADatingApp')}</span>
        </div>
      </motion.div>
      
      {/* CTA Buttons - no pulse animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => navigate('/onboarding')}
          size="lg"
          className="h-16 px-10 text-xl font-black bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl shadow-coral/30 hover:shadow-coral/40 transition-all duration-300 hover:scale-105"
        >
          {t('landing.createMyAccount')}
          <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
        <Button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg font-medium rounded-full border-2 border-muted hover:border-coral/50 hover:bg-coral/5 transition-all duration-300"
        >
          {t('auth.signIn')}
        </Button>
      </motion.div>
      
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
