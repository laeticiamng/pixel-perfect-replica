import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Radar, MessageCircle, ChevronRight, X, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'nearvity_map_onboarding_seen';

interface TutorialStep {
  targetSelector: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TutorialStep[] = [
  {
    targetSelector: '[data-tour="signal-button"]',
    icon: <Radio className="h-6 w-6" />,
    titleKey: 'mapTutorial.step1Title',
    descKey: 'mapTutorial.step1Desc',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="view-toggle"]',
    icon: <Radar className="h-6 w-6" />,
    titleKey: 'mapTutorial.step2Title',
    descKey: 'mapTutorial.step2Desc',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="map-area"]',
    icon: <MessageCircle className="h-6 w-6" />,
    titleKey: 'mapTutorial.step3Title',
    descKey: 'mapTutorial.step3Desc',
    position: 'bottom',
  },
];

export function MapOnboardingTutorial() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const animFrameRef = useRef<number>();

  // Check if tutorial was already seen
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Small delay so the map page renders first
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Position the tooltip relative to the target element
  const updateTargetRect = useCallback(() => {
    if (!visible) return;
    const step = STEPS[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [visible, currentStep]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => updateTargetRect();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateTargetRect]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Done
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }, []);

  if (!visible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 16;
    const centerX = targetRect.left + targetRect.width / 2;

    if (step.position === 'top') {
      return {
        bottom: window.innerHeight - targetRect.top + padding,
        left: Math.max(padding, Math.min(centerX - 160, window.innerWidth - 336)),
      };
    }
    // bottom
    return {
      top: targetRect.bottom + padding,
      left: Math.max(padding, Math.min(centerX - 160, window.innerWidth - 336)),
    };
  };

  // Spotlight cutout around target
  const getSpotlightStyle = (): React.CSSProperties => {
    if (!targetRect) return {};
    const pad = 8;
    return {
      top: targetRect.top - pad,
      left: targetRect.left - pad,
      width: targetRect.width + pad * 2,
      height: targetRect.height + pad * 2,
    };
  };

  return (
    <div className="fixed inset-0 z-[100]" aria-live="polite">
      {/* Backdrop overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />

      {/* Spotlight ring */}
      {targetRect && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-2xl ring-2 ring-coral ring-offset-2 ring-offset-transparent"
          style={{
            ...getSpotlightStyle(),
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            background: 'transparent',
            zIndex: 101,
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: step.position === 'top' ? 12 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: step.position === 'top' ? 12 : -12 }}
          transition={{ duration: 0.25 }}
          className="absolute z-[102] w-[320px]"
          style={getTooltipStyle()}
        >
          <div className="glass-strong rounded-2xl p-5 shadow-strong border border-border">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-coral/15 text-coral">
                  {step.icon}
                </div>
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        i === currentStep ? 'bg-coral' : i < currentStep ? 'bg-coral/40' : 'bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={t('skip')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-foreground mb-1">
              {t(step.titleKey)}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t(step.descKey)}
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('mapTutorial.skip')}
              </button>
              <button
                onClick={handleNext}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  'bg-coral text-primary-foreground hover:bg-coral-dark'
                )}
              >
                {isLast ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t('mapTutorial.done')}
                  </>
                ) : (
                  <>
                    {t('mapTutorial.next')}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
