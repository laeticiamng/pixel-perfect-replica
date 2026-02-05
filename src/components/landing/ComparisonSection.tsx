import { forwardRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';

export const ComparisonSection = forwardRef<HTMLDivElement>(function ComparisonSection(_props, ref) {
  const { t } = useTranslation();
  
  const comparisons = [
    { old: t('landing.imHere'), new: t('landing.imOpenToInteract') },
    { old: t('landing.passiveProfiles'), new: t('landing.activeIntentions') },
    { old: t('landing.hopeForMatch'), new: t('landing.mutualConsent') },
    { old: t('landing.awkwardApproach'), new: t('landing.naturalApproach') },
  ];
  
  return (
    <div ref={ref} className="space-y-4">
      {comparisons.map((item, i) => (
        <RevealText key={i} delay={i * 0.1}>
          <div className="flex items-center gap-4 p-4 rounded-2xl glass">
            <span className="text-muted-foreground line-through text-sm flex-1">{item.old}</span>
            <ArrowRight className="h-4 w-4 text-coral flex-shrink-0" />
            <span className="text-foreground font-semibold text-sm flex-1">{item.new}</span>
          </div>
        </RevealText>
      ))}
    </div>
  );
});
