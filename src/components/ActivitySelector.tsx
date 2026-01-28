import { ActivityType, ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';

interface ActivitySelectorProps {
  selectedActivity: ActivityType | null;
  onSelect: (activity: ActivityType) => void;
}

export function ActivitySelector({ selectedActivity, onSelect }: ActivitySelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIVITIES.map((activity) => (
        <button
          key={activity.id}
          onClick={() => onSelect(activity.id)}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300',
            'border-2 hover:scale-105 active:scale-95',
            selectedActivity === activity.id
              ? 'bg-coral/20 border-coral glow-coral'
              : 'bg-deep-blue-light/50 border-transparent hover:border-gray-500'
          )}
        >
          <span className="text-2xl">{activity.emoji}</span>
          <span className={cn(
            'text-sm font-medium',
            selectedActivity === activity.id ? 'text-coral' : 'text-gray-300'
          )}>
            {activity.label}
          </span>
        </button>
      ))}
    </div>
  );
}
