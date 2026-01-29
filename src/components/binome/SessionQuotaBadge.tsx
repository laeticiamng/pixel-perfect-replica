import { Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface SessionQuotaBadgeProps {
  sessionsCreated: number;
  sessionsLimit: number;
  isPremium: boolean;
  canCreate: boolean;
  className?: string;
  showUpgrade?: boolean;
}

export function SessionQuotaBadge({
  sessionsCreated,
  sessionsLimit,
  isPremium,
  canCreate,
  className,
  showUpgrade = true,
}: SessionQuotaBadgeProps) {
  const isUnlimited = sessionsLimit === -1;
  const remaining = isUnlimited ? Infinity : Math.max(0, sessionsLimit - sessionsCreated);
  const percentage = isUnlimited ? 0 : (sessionsCreated / sessionsLimit) * 100;
  const isNearLimit = !isUnlimited && remaining <= 1;
  const isAtLimit = !isUnlimited && remaining === 0;

  if (isPremium) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30",
        className
      )}>
        <Crown className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-500">Premium</span>
        <span className="text-xs text-muted-foreground">• Illimité</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
            isAtLimit 
              ? "bg-destructive/20 text-destructive" 
              : isNearLimit 
                ? "bg-amber-500/20 text-amber-500"
                : "bg-muted text-foreground"
          )}>
            <span>{sessionsCreated}</span>
            <span className="text-muted-foreground">/</span>
            <span>{sessionsLimit}</span>
            <span className="text-xs text-muted-foreground ml-1">ce mois</span>
          </div>
        </div>
        
        {showUpgrade && !isPremium && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-coral hover:text-coral hover:bg-coral/10 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Passer Premium
          </Button>
        )}
      </div>
      
      <Progress 
        value={percentage} 
        className={cn(
          "h-1.5",
          isAtLimit && "[&>div]:bg-destructive",
          isNearLimit && !isAtLimit && "[&>div]:bg-amber-500"
        )}
      />
      
      {isAtLimit && (
        <p className="text-xs text-destructive">
          Tu as atteint ta limite mensuelle. Passe Premium pour créer plus de créneaux !
        </p>
      )}
      
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-amber-500">
          Plus qu'un créneau disponible ce mois-ci
        </p>
      )}
    </div>
  );
}
