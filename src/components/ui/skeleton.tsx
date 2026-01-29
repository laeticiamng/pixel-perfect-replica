import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Specific skeleton components for SIGNAL app
function ProfileCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-12" />
      </div>
      <div className="h-48 flex items-end gap-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg" 
            style={{ height: `${Math.random() * 60 + 40}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, ProfileCardSkeleton, StatCardSkeleton, ListItemSkeleton, ChartSkeleton };
