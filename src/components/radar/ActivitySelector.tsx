import { forwardRef } from 'react';
import { ActivityType, ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';

interface ActivitySelectorProps {
  selectedActivity: ActivityType | null;
  onSelect: (activity: ActivityType) => void;
}

export const ActivitySelector = forwardRef<HTMLDivElement, ActivitySelectorProps>(
  function ActivitySelector({ selectedActivity, onSelect }, ref) {
    return (
      <div ref={ref} className="grid grid-cols-3 gap-3">
        {ACTIVITIES.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onSelect(activity.id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300',
              'border-2 hover:scale-105 active:scale-95',
              selectedActivity === activity.id
                ? 'bg-coral/20 border-coral glow-coral'
                : 'bg-deep-blue-light/50 border-transparent hover:border-muted'
            )}
          >
            <span className="text-2xl">{activity.emoji}</span>
            <span className={cn(
              'text-sm font-medium',
              selectedActivity === activity.id ? 'text-coral' : 'text-muted-foreground'
            )}>
              {activity.label}
            </span>
          </button>
        ))}
      </div>
    );
  }
);
