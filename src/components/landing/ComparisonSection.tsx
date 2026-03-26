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
    <div ref={ref} className="space-y-2.5 sm:space-y-3">
      {comparisons.map((item, i) => (
        <RevealText key={i} delay={i * 0.08}>
          <motion.div 
            className="group flex items-center gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-xl hover:border-coral/25 hover:bg-card/50 transition-all duration-400"
            whileHover={{ x: 6, scale: 1.01 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <X className="h-3 w-3 text-destructive/60" />
              </div>
              <span className="text-muted-foreground/70 line-through text-sm truncate">{item.old}</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-coral/10 flex items-center justify-center shrink-0">
              <ArrowRight className="h-3 w-3 text-coral" />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-5 h-5 rounded-full bg-signal-green/15 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-signal-green" />
              </div>
              <span className="text-foreground font-semibold text-sm truncate">{item.new}</span>
            </div>
          </motion.div>
        </RevealText>
      ))}
    </div>
  );
});
