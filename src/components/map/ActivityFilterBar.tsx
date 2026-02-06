import { cn } from '@/lib/utils';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { useTranslation } from '@/lib/i18n';

interface ActivityFilterBarProps {
  selectedActivities: ActivityType[];
  onToggle: (activity: ActivityType) => void;
  className?: string;
}

export function ActivityFilterBar({
  selectedActivities,
  onToggle,
  className,
}: ActivityFilterBarProps) {
  const { t } = useTranslation();
  const isAllSelected = selectedActivities.length === 0;

  return (
    <div className={cn(
      "flex items-center gap-1.5 p-1.5 rounded-xl bg-background/90 backdrop-blur-md border border-border/50 shadow-lg",
      className
    )}>
      {/* All button */}
      <button
        onClick={() => {
          // Clear all filters
          selectedActivities.forEach(a => onToggle(a));
        }}
        className={cn(
          "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
          isAllSelected
            ? "bg-coral text-white shadow-sm"
            : "text-muted-foreground hover:bg-muted"
        )}
      >
        {t('activityFilter.all')}
      </button>

      <div className="w-px h-5 bg-border" />

      {/* Activity toggles */}
      {ACTIVITIES.map((activity) => {
        const isSelected = selectedActivities.includes(activity.id);
        
        return (
          <button
            key={activity.id}
            onClick={() => onToggle(activity.id)}
            aria-label={t('activityFilter.filterBy', { activity: t(activity.labelKey) })}
            aria-pressed={isSelected}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all",
              isSelected
                ? "bg-coral text-white shadow-sm scale-110"
                : "bg-muted/50 hover:bg-muted text-foreground"
            )}
          >
            {activity.emoji}
          </button>
        );
      })}
    </div>
  );
}
