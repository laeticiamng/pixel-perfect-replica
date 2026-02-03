import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

export function TypingIndicator({ userName, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground italic">
          {userName} est en train d'écrire...
        </span>
      )}
    </div>
  );
}
