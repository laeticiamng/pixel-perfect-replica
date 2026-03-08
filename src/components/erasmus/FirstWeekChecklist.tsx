import { Check, MapPin, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNewcomerChecklist } from '@/hooks/useNewcomerChecklist';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface FirstWeekChecklistProps {
  city: string;
}

const TASK_SEARCH_QUERIES: Record<string, string> = {
  register_university: 'university registration office',
  find_grocery_store: 'supermarket grocery store',
  open_bank_account: 'bank branch student account',
  find_gym: 'gym fitness center student',
  get_transport_pass: 'public transport pass office',
};

export function FirstWeekChecklist({ city }: FirstWeekChecklistProps) {
  const { tasks, isLoading, toggleTask, completedCount, totalCount, progress } = useNewcomerChecklist();
  const { t } = useTranslation();

  const openInMaps = (taskKey: string) => {
    const query = TASK_SEARCH_QUERIES[taskKey] || taskKey;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query + ' ' + city)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-full rounded-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          📋 {t('erasmus.firstWeekChecklist')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount}/{totalCount} {t('erasmus.tasksCompleted')}
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      {progress === 100 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 rounded-xl bg-signal-green/10 border border-signal-green/30 text-center"
        >
          <span className="text-2xl mb-1 block">🎉</span>
          <p className="font-semibold text-signal-green">{t('erasmus.allDone')}</p>
          <p className="text-xs text-muted-foreground">{t('erasmus.allDoneDesc')}</p>
        </motion.div>
      )}

      <div className="space-y-2">
        {tasks.map((task, i) => (
          <motion.div
            key={task.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group',
              task.completed
                ? 'bg-signal-green/5 border-signal-green/20'
                : 'bg-card border-border hover:border-coral/30'
            )}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.key)}
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all',
                task.completed
                  ? 'bg-signal-green border-signal-green text-white'
                  : 'border-border hover:border-coral group-hover:border-coral'
              )}
            >
              {task.completed && <Check className="h-4 w-4" />}
            </button>

            {/* Icon + Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{task.icon}</span>
                <span
                  className={cn(
                    'font-medium text-sm',
                    task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}
                >
                  {t(`erasmus.task_${task.key}`)}
                </span>
              </div>
              {task.locationName && (
                <p className="text-xs text-muted-foreground ml-8 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {task.locationName}
                </p>
              )}
            </div>

            {/* Map link */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openInMaps(task.key);
              }}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-coral transition-colors"
              title={t('erasmus.findOnMap')}
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
