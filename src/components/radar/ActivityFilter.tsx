import { ACTIVITIES, ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ActivityFilterProps {
  selectedActivities: ActivityType[];
  onToggle: (activity: ActivityType) => void;
  onClear: () => void;
}

export function ActivityFilter({ selectedActivities, onToggle, onClear }: ActivityFilterProps) {
  const hasFilters = selectedActivities.length > 0;
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={onClear}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
          !hasFilters 
            ? 'bg-coral text-primary-foreground' 
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
      >
        {t('all')}
      </button>
      
      {ACTIVITIES.map((activity) => {
        const isSelected = selectedActivities.includes(activity.id);
        return (
          <button
            key={activity.id}
            onClick={() => onToggle(activity.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
              isSelected 
                ? 'bg-coral text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <span>{activity.emoji}</span>
            <span>{t(activity.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
