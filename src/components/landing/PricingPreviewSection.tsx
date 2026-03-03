import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Ticket, ArrowRight } from 'lucide-react';
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
    <section ref={ref} className="py-16 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">
            {t('landing.pricingTitle')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            {t('landing.pricingSubtitle')}
          </p>
        </RevealText>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <RevealText key={tier.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-6 h-full transition-shadow',
                  tier.highlighted
                    ? 'border-coral/50 bg-gradient-to-b from-coral/5 to-transparent shadow-lg shadow-coral/10'
                    : 'border-border/50 bg-card/50 backdrop-blur-sm'
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-coral text-white text-xs font-bold">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => navigate(tier.route)}
                  className={cn(
                    'w-full',
                    tier.highlighted
                      ? 'bg-gradient-to-r from-coral to-coral-light text-white hover:shadow-coral/25 shadow-lg'
                      : 'variant-outline'
                  )}
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});
