import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
  route: string;
}

export const PricingPreviewSection = forwardRef<HTMLElement>(function PricingPreviewSection(_props, ref) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tiers: PricingTier[] = [
    {
      name: t('landing.pricingFree'),
      price: '0€',
      period: '',
      description: t('landing.pricingFreeDesc'),
      features: [
        t('landing.pricingFreeF1'),
        t('landing.pricingFreeF2'),
        t('landing.pricingFreeF3'),
      ],
      cta: t('landing.pricingFreeCTA'),
      route: '/onboarding',
    },
    {
      name: 'Nearvity+',
      price: '9,90€',
      period: t('landing.pricingPerMonth'),
      description: t('landing.pricingPlusDesc'),
      features: [
        t('landing.pricingPlusF1'),
        t('landing.pricingPlusF2'),
        t('landing.pricingPlusF3'),
        t('landing.pricingPlusF4'),
      ],
      cta: t('landing.pricingPlusCTA'),
      highlighted: true,
      badge: t('landing.pricingRecommended'),
      route: '/premium',
    },
    {
      name: t('landing.pricingUnit'),
      price: '0,99€',
      period: t('landing.pricingPerSession'),
      description: t('landing.pricingUnitDesc'),
      features: [
        t('landing.pricingUnitF1'),
        t('landing.pricingUnitF2'),
      ],
      cta: t('landing.pricingUnitCTA'),
      route: '/premium',
    },
  ];

  return (
    <section ref={ref} className="py-14 sm:py-16 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">
            {t('landing.pricingTitle')}
          </h2>
          <p className="text-center text-muted-foreground mb-10 sm:mb-12 max-w-lg mx-auto">
            {t('landing.pricingSubtitle')}
          </p>
        </RevealText>

        <div className="grid md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {tiers.map((tier, i) => (
            <RevealText key={tier.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className={cn(
                  'relative flex flex-col rounded-2xl p-5 sm:p-6 h-full transition-all duration-400 overflow-hidden',
                  tier.highlighted
                    ? 'border-2 border-coral/30 bg-card/50 backdrop-blur-xl shadow-xl shadow-coral/10'
                    : 'border border-border/30 bg-card/30 backdrop-blur-xl hover:border-coral/20 hover:bg-card/50'
                )}
              >
                {/* Top shine */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
                
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-28 bg-coral/8 blur-[50px] rounded-full pointer-events-none" />
                )}

                {tier.badge && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg bg-gradient-to-r from-coral to-coral-light text-white text-xs font-bold shadow-lg shadow-coral/20">
                    {tier.badge}
                  </div>
                )}

                <div className={cn('mb-4', tier.badge && 'mt-5')}>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-coral" />
                      </div>
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate(tier.route)}
                  className={cn(
                    'w-full group rounded-xl',
                    tier.highlighted
                      ? 'bg-gradient-to-r from-coral to-coral-light text-white hover:shadow-coral/25 shadow-lg'
                      : ''
                  )}
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});
