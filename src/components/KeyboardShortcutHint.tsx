import { Search } from 'lucide-react';
import { useShortcutHint } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface KeyboardShortcutHintProps {
  className?: string;
  onClick?: () => void;
}

export function KeyboardShortcutHint({ className, onClick }: KeyboardShortcutHintProps) {
  const { cmdKey } = useShortcutHint();
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-muted/50 hover:bg-muted border border-border/50",
        "text-muted-foreground hover:text-foreground",
        "transition-all duration-200 text-sm",
        className
      )}
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{t('search')}</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background/80 border border-border text-xs font-mono">
        {cmdKey}K
      </kbd>
    </button>
  );
}
