import { forwardRef } from 'react';
import { ArrowRight, X, Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { motion } from 'framer-motion';

export const ComparisonSection = forwardRef<HTMLDivElement>(function ComparisonSection(_props, ref) {
  const { t } = useTranslation();
  
  const comparisons = [
    { old: t('landing.imHere'), new: t('landing.imOpenToInteract') },
    { old: t('landing.passiveProfiles'), new: t('landing.activeIntentions') },
    { old: t('landing.hopeForMatch'), new: t('landing.mutualConsent') },
    { old: t('landing.awkwardApproach'), new: t('landing.naturalApproach') },
  ];
  
  return (
    <div ref={ref} className="space-y-3">
      {comparisons.map((item, i) => (
        <RevealText key={i} delay={i * 0.1}>
          <motion.div 
            className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md hover:border-coral/20 transition-all duration-300"
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <X className="h-3.5 w-3.5 text-destructive/60 shrink-0" />
              <span className="text-muted-foreground line-through text-sm truncate">{item.old}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-coral flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Check className="h-3.5 w-3.5 text-signal-green shrink-0" />
              <span className="text-foreground font-semibold text-sm truncate">{item.new}</span>
            </div>
          </motion.div>
        </RevealText>
      ))}
    </div>
  );
});
