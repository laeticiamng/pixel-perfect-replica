import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface PremiumNudgeProps {
  className?: string;
}

export function PremiumNudge({ className }: PremiumNudgeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => 
    sessionStorage.getItem('premium_nudge_dismissed') === 'true'
  );

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('premium_nudge_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative p-4 rounded-xl bg-gradient-to-r from-coral/10 to-coral-light/10 border border-coral/20 ${className}`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label={t('close')}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="p-2 rounded-lg bg-coral/20 shrink-0">
            <Crown className="h-5 w-5 text-coral" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {t('premiumNudge.title')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('premiumNudge.description')}
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/premium?from=nudge')}
              className="mt-2 h-7 text-xs bg-coral hover:bg-coral/90"
            >
              {t('premiumNudge.cta')}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
