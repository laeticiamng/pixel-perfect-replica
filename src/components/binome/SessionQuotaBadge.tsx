import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface SessionQuotaBadgeProps {
  sessionsCreated: number;
  sessionsLimit: number;
  isPremium: boolean;
  canCreate: boolean;
  className?: string;
  showUpgrade?: boolean;
}

export function SessionQuotaBadge({
  sessionsCreated, sessionsLimit, isPremium, canCreate, className, showUpgrade = true,
}: SessionQuotaBadgeProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isUnlimited = sessionsLimit === -1;
  const remaining = isUnlimited ? Infinity : Math.max(0, sessionsLimit - sessionsCreated);
  const percentage = isUnlimited ? 0 : (sessionsCreated / sessionsLimit) * 100;
  const isNearLimit = !isUnlimited && remaining <= 1;
  const isAtLimit = !isUnlimited && remaining === 0;

  if (isPremium) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30", className)}>
        <Crown className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-500">{t('sessionQuota.premium')}</span>
        <span className="text-xs text-muted-foreground">• {t('sessionQuota.unlimited')}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
            isAtLimit ? "bg-destructive/20 text-destructive" : isNearLimit ? "bg-amber-500/20 text-amber-500" : "bg-muted text-foreground"
          )}>
            <span>{sessionsCreated}</span>
            <span className="text-muted-foreground">/</span>
            <span>{sessionsLimit}</span>
            <span className="text-xs text-muted-foreground ml-1">{t('sessionQuota.thisMonth')}</span>
          </div>
        </div>
        {showUpgrade && !isPremium && (
          <Button variant="ghost" size="sm" className="h-7 text-xs text-coral hover:text-coral hover:bg-coral/10 gap-1" onClick={() => navigate('/premium')}>
            <Sparkles className="h-3 w-3" />
            {t('sessionQuota.goPremium')}
          </Button>
        )}
      </div>
      <Progress value={percentage} className={cn("h-1.5", isAtLimit && "[&>div]:bg-destructive", isNearLimit && !isAtLimit && "[&>div]:bg-amber-500")} />
      {isAtLimit && <p className="text-xs text-destructive">{t('sessionQuota.limitReached')}</p>}
      {isNearLimit && !isAtLimit && <p className="text-xs text-amber-500">{t('sessionQuota.oneLeft')}</p>}
    </div>
  );
}
