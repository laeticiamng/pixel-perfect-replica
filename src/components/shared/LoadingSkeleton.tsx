import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'stats' | 'chart' | 'page';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant, count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'card') {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-3", className)}>
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className={cn("grid grid-cols-2 gap-4", className)}>
        {items.map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn("glass rounded-xl p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  // Page skeleton
  return (
    <div className={cn("space-y-6 px-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 py-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      {/* Content */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
