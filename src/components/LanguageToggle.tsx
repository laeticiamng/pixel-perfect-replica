import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export function LanguageToggle({ compact = false, className }: LanguageToggleProps) {
  const { locale, setLocale, toggleLocale } = useTranslation();

  const toggleContent = (
    <div className={cn(
      "flex items-center gap-1.5 p-1.5 rounded-xl bg-muted/60 border border-border/60 shadow-sm",
      className
    )}>
      <Globe className="h-4 w-4 text-muted-foreground ml-1" />
      {(['en', 'fr', 'de'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200",
            locale === lang
              ? "bg-coral text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-label={lang === 'en' ? 'English' : lang === 'fr' ? 'Français' : 'Deutsch'}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (compact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={toggleLocale}
            className={cn(
              "p-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
              className
            )}
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {locale === 'en' ? 'Français' : locale === 'fr' ? 'Deutsch' : 'English'}
        </TooltipContent>
      </Tooltip>
    );
  }

  return toggleContent;
}
