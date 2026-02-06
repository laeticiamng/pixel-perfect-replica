import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/validation';
import { useTranslation } from '@/lib/i18n';
import { AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);
  const { t } = useTranslation();
  
  if (!password) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              level <= strength.score ? strength.color : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn(
        'text-xs font-medium',
        strength.score <= 2 && 'text-signal-red',
        strength.score > 2 && strength.score <= 4 && 'text-signal-yellow',
        strength.score > 4 && 'text-signal-green',
      )}>
        {t('auth.strength')} : {strength.label}
      </p>
      {/* Server validation note */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground/80">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>{t('auth.serverMayReject')}</span>
      </div>
    </div>
  );
}
