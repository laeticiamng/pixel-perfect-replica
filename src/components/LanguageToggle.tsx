import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { locale, setLocale, isEnglish } = useTranslation();

  const toggleContent = (
    <div className={cn(
      "flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50",
      className
    )}>
      <button
        onClick={() => setLocale('en')}
        className={cn(
          "px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
          isEnglish
            ? "bg-coral text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label="English"
      >
        EN
      </button>
      <button
        onClick={() => setLocale('fr')}
        className={cn(
          "px-2 py-1 rounded-md text-xs font-medium transition-all duration-200",
          !isEnglish
            ? "bg-coral text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label="Français"
      >
        FR
      </button>
    </div>
  );

  if (compact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={() => setLocale(isEnglish ? 'fr' : 'en')}
            className={cn(
              "p-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
              className
            )}
            aria-label={isEnglish ? "Switch to French" : "Switch to English"}
          >
            <Globe className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isEnglish ? "Français" : "English"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return toggleContent;
}
