import { cn } from '@/lib/utils';

interface SwipeIndicatorProps {
  currentIndex: number;
  totalRoutes: number;
  className?: string;
}

export function SwipeIndicator({ currentIndex, totalRoutes, className }: SwipeIndicatorProps) {
  if (currentIndex < 0) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalRoutes }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === currentIndex
              ? "w-6 bg-coral"
              : "w-1.5 bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
