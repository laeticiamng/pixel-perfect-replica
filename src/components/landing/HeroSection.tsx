import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Download, Sparkles } from 'lucide-react';
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

interface HeroSectionProps {
  heroOpacity: MotionValue<number>;
  heroScale: MotionValue<number>;
}

// Magnetic CTA button that subtly follows cursor
function MagneticButton({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export function HeroSection({ heroOpacity, heroScale }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Animated gradient for the accent word
  const shimmerX = useMotionValue(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = ((ts - start) % 4000) / 4000;
      shimmerX.set(progress * 200 - 100);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [shimmerX]);

  return (
    <motion.section 
      style={{ opacity: heroOpacity, scale: heroScale }}
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 relative z-10 pt-16"
    >
      {/* Radial glow behind hero content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coral/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Tagline badge with shimmer border */}
      <motion.div
        initial={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mb-6 sm:mb-8"
      >
        <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-xl hover:border-coral/40 transition-all duration-500 cursor-default overflow-hidden">
          {/* Animated border shimmer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, hsl(var(--coral) / 0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPositionX: ['0%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          <Sparkles className="h-3.5 w-3.5 text-coral relative z-10" />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground relative z-10">
            {t('landing.heroTagline')}
          </span>
        </div>
      </motion.div>

      {/* Main Title — staggered word reveal with blur-in */}
      <motion.h1 
        className="text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl font-extrabold text-center tracking-tight mb-5 sm:mb-6 leading-[1.05]"
      >
        <motion.span
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="block"
        >
          <span className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('landing.seeWhoIsOpen')}
          </span>
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="block"
        >
          <span
            className="hero-shimmer bg-gradient-to-r from-coral via-coral-light via-50% to-coral bg-clip-text text-transparent bg-[length:200%_100%]"
          >
            {t('landing.openToInteract')}
          </span>
        </motion.span>
      </motion.h1>
      
      {/* Subtitle — fade up with slight delay */}
      <motion.p
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="text-base sm:text-lg md:text-xl text-muted-foreground text-center max-w-md sm:max-w-lg mb-8 sm:mb-10 leading-relaxed"
      >
        {t('landing.heroSubtitle')}
      </motion.p>
      
      {/* CTA Buttons — magnetic primary + ghost secondary */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
      >
        <MagneticButton
          onClick={() => navigate('/onboarding')}
          className="group relative h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl font-black bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl shadow-coral/25 hover:shadow-2xl hover:shadow-coral/40 transition-all duration-300 overflow-hidden"
        >
          {/* Shine sweep on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <span className="relative flex items-center justify-center gap-2">
            {t('landing.createMyAccount')}
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
          </span>
        </MagneticButton>
        <Button
          onClick={() => document.getElementById('app-preview')?.scrollIntoView({ behavior: 'smooth' }) ?? document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          variant="outline"
          size="lg"
          className="group h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-xl font-bold rounded-full border-border/50 hover:border-coral/40 bg-card/30 backdrop-blur-sm transition-all duration-300"
        >
          {t('landing.seeHowItWorks')}
          <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
        </Button>
      </motion.div>

      {/* Signup expectation + login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-5 flex flex-col items-center gap-1.5"
      >
        <p className="text-xs text-muted-foreground/60">
          {t('landing.signupExpectation')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('landing.alreadyAccount')}{' '}
          <button
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            className="text-coral hover:underline font-medium transition-colors"
          >
            {t('auth.signIn')}
          </button>
        </p>
      </motion.div>

      {/* PWA Install hint - visible on mobile */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        onClick={() => navigate('/install')}
        className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-coral transition-colors sm:hidden"
      >
        <Download className="h-3.5 w-3.5" />
        {t('landing.install')}
      </motion.button>
      
      {/* Scroll indicator — breathing pill */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1.5"
        >
          <motion.div 
            animate={{ opacity: [0.3, 0.8, 0.3], y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1.5 bg-coral/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
