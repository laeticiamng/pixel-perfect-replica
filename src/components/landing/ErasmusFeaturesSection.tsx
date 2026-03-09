import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckSquare, Heart, Calendar, Brain } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErasmusFeature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const features: ErasmusFeature[] = [
  { icon: Globe, titleKey: 'landing.erasmusFeature1Title', descKey: 'landing.erasmusFeature1Desc' },
  { icon: CheckSquare, titleKey: 'landing.erasmusFeature2Title', descKey: 'landing.erasmusFeature2Desc' },
  { icon: Heart, titleKey: 'landing.erasmusFeature3Title', descKey: 'landing.erasmusFeature3Desc' },
  { icon: Calendar, titleKey: 'landing.erasmusFeature4Title', descKey: 'landing.erasmusFeature4Desc' },
  { icon: Brain, titleKey: 'landing.erasmusFeature5Title', descKey: 'landing.erasmusFeature5Desc' },
];

export const ErasmusFeaturesSection = forwardRef<HTMLElement>(
  function ErasmusFeaturesSection(_props, ref) {
    const { t } = useTranslation();

    return (
      <section ref={ref} className="py-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <RevealText>
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border border-coral/30 bg-coral/10 text-coral">
                <Globe className="h-3.5 w-3.5" />
                {t('landing.erasmusBadge')}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
              {t('landing.erasmusTitle')}
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
              {t('landing.erasmusSubtitle')}
            </p>
          </RevealText>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <RevealText key={i} delay={i * 0.1}>
                <motion.div
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md p-6 transition-all duration-500 hover:border-coral/30',
                    i === 0 && 'sm:col-span-2 lg:col-span-1'
                  )}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coral/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Top shine */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mb-4 border border-coral/10">
                      <feature.icon className="h-6 w-6 text-coral" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 text-lg">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </motion.div>
              </RevealText>
            ))}
          </div>

          <RevealText delay={0.5}>
            <div className="flex justify-center mt-10">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/onboarding">
                  {t('landing.erasmusCTA')}
                </Link>
              </Button>
            </div>
          </RevealText>
        </div>
      </section>
    );
  }
);
