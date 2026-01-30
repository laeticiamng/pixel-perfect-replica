import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

export function ThemeToggle({ className, showLabels = true, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Clair' },
    { value: 'dark' as const, icon: Moon, label: 'Sombre' },
    { value: 'system' as const, icon: Monitor, label: 'Système' },
  ];

  // Compact mode: only show icons with current selection highlighted
  if (compact) {
    return (
      <div className={cn('flex gap-1 p-1 rounded-xl bg-muted/50', className)}>
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <Tooltip key={option.value} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-coral text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {option.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
              'text-sm font-medium whitespace-nowrap',
              isActive
                ? 'bg-coral text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {showLabels && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
