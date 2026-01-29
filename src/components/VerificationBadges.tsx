import { useVerificationBadges, BadgeType } from '@/hooks/useVerificationBadges';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VerificationBadgesProps {
  userId: string;
  className?: string;
  showLabels?: boolean;
}

export function VerificationBadges({ userId, className, showLabels = false }: VerificationBadgesProps) {
  const { badges, getBadgeInfo, isLoading } = useVerificationBadges(userId);

  if (isLoading || badges.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {badges.map((badge) => {
        const info = getBadgeInfo(badge.badge_type as BadgeType);
        
        return (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <span 
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  "bg-signal-green/20 text-signal-green border border-signal-green/30",
                  "cursor-help transition-all hover:scale-105"
                )}
                aria-label={info.description}
              >
                <span>{info.emoji}</span>
                {showLabels && <span>{info.label}</span>}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{info.label}</p>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
