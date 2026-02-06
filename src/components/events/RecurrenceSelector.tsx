import { Button } from '@/components/ui/button';
import { Repeat, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export type RecurrenceType = 'none' | 'weekly' | 'monthly';

interface RecurrenceSelectorProps {
  value: RecurrenceType;
  onChange: (value: RecurrenceType) => void;
  occurrences: number;
  onOccurrencesChange: (value: number) => void;
  className?: string;
}

export function RecurrenceSelector({ value, onChange, occurrences, onOccurrencesChange, className }: RecurrenceSelectorProps) {
  const { t } = useTranslation();

  const recurrenceOptions: { value: RecurrenceType; label: string; icon: React.ElementType }[] = [
    { value: 'none', label: t('recurrence.oneTime'), icon: CalendarDays },
    { value: 'weekly', label: t('recurrence.weekly'), icon: Repeat },
    { value: 'monthly', label: t('recurrence.monthly'), icon: CalendarRange },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('recurrence.label')}</label>
        <div className="flex gap-2">
          {recurrenceOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(option.value)}
                className={cn('flex-1 gap-2', isSelected && 'bg-coral hover:bg-coral-dark')}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {value !== 'none' && (
        <div className="space-y-2 animate-slide-up">
          <label className="text-sm font-medium">{t('recurrence.occurrencesLabel')}</label>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOccurrencesChange(Math.max(2, occurrences - 1))} className="h-8 w-8 p-0">-</Button>
            <span className="text-lg font-semibold w-8 text-center">{occurrences}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => onOccurrencesChange(Math.min(12, occurrences + 1))} className="h-8 w-8 p-0">+</Button>
            <span className="text-sm text-muted-foreground ml-2">
              {value === 'weekly' ? t('recurrence.weeks') : t('recurrence.months')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('recurrence.eventsCreated').replace('{count}', String(occurrences))}
          </p>
        </div>
      )}
    </div>
  );
}
