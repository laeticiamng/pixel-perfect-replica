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
      "flex items-center gap-1.5 p-1.5 rounded-xl bg-muted/60 border border-border/60 shadow-sm",
      className
    )}>
      <Globe className="h-4 w-4 text-muted-foreground ml-1" />
      <button
        onClick={() => setLocale('en')}
        className={cn(
          "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
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
          "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
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
