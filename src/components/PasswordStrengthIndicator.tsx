import { cn } from '@/lib/utils';
import { getPasswordStrength } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);
  
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
        Force : {strength.label}
      </p>
    </div>
  );
}
