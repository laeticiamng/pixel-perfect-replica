import { useVerificationBadges, BadgeType } from '@/hooks/useVerificationBadges';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface VerificationBadgesProps {
  userId: string;
  className?: string;
  showLabels?: boolean;
}

export function VerificationBadges({ userId, className, showLabels = false }: VerificationBadgesProps) {
  const { badges, getBadgeInfo, isLoading } = useVerificationBadges(userId);
  const { t } = useTranslation();

  if (isLoading || badges.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {badges.map((badge) => {
        const info = getBadgeInfo(badge.badge_type as BadgeType);
        const label = t(info.labelKey);
        const description = t(info.descriptionKey);
        
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <span 
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  "bg-signal-green/20 text-signal-green border border-signal-green/30",
                  "cursor-help transition-all hover:scale-105"
                )}
                aria-label={description}
              >
                <span>{info.emoji}</span>
                {showLabels && <span>{label}</span>}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
