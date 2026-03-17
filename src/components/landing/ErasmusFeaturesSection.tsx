import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Heart, Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { type LucideIcon } from 'lucide-react';

interface ErasmusFeature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const features: ErasmusFeature[] = [
  { icon: Globe, titleKey: 'landing.erasmusFeature1Title', descKey: 'landing.erasmusFeature1Desc' },
  { icon: Heart, titleKey: 'landing.erasmusFeature3Title', descKey: 'landing.erasmusFeature3Desc' },
  { icon: Calendar, titleKey: 'landing.erasmusFeature4Title', descKey: 'landing.erasmusFeature4Desc' },
];

export const ErasmusFeaturesSection = forwardRef<HTMLElement>(
  function ErasmusFeaturesSection(_props, ref) {
    const { t } = useTranslation();

    return (
      <section ref={ref} className="py-10 px-6 relative z-10 opacity-90">
        <div className="max-w-4xl mx-auto">
          <RevealText>
            <p className="text-center text-sm text-muted-foreground/80 uppercase tracking-wider font-medium mb-3">
              {t('landing.erasmusTitle')}
            </p>
          </RevealText>

          <div className="grid sm:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <RevealText key={i} delay={i * 0.1}>
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border/30 bg-card/30 backdrop-blur-md p-5 transition-all duration-500 hover:border-coral/20"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative z-10 text-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral/10 to-coral/5 flex items-center justify-center mx-auto mb-3 border border-coral/10">
                      <feature.icon className="h-5 w-5 text-coral/70" />
                    </div>
                    <h3 className="font-semibold text-foreground/90 mb-1 text-sm">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </div>
                </motion.div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
