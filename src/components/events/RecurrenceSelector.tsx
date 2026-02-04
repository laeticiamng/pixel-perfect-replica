import { Button } from '@/components/ui/button';
import { Repeat, CalendarDays, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RecurrenceType = 'none' | 'weekly' | 'monthly';

interface RecurrenceSelectorProps {
  value: RecurrenceType;
  onChange: (value: RecurrenceType) => void;
  occurrences: number;
  onOccurrencesChange: (value: number) => void;
  className?: string;
}

const recurrenceOptions: { value: RecurrenceType; label: { en: string; fr: string }; icon: React.ElementType }[] = [
  { value: 'none', label: { en: 'One-time', fr: 'Unique' }, icon: CalendarDays },
  { value: 'weekly', label: { en: 'Weekly', fr: 'Hebdomadaire' }, icon: Repeat },
  { value: 'monthly', label: { en: 'Monthly', fr: 'Mensuel' }, icon: CalendarRange },
];

export function RecurrenceSelector({
  value,
  onChange,
  occurrences,
  onOccurrencesChange,
  className,
}: RecurrenceSelectorProps) {
  // Detect language from localStorage or default to 'fr'
  const locale = (typeof window !== 'undefined' && localStorage.getItem('language')) || 'fr';
  const isFr = locale === 'fr';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {isFr ? 'Récurrence' : 'Recurrence'}
        </label>
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
                className={cn(
                  'flex-1 gap-2',
                  isSelected && 'bg-coral hover:bg-coral-dark'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{isFr ? option.label.fr : option.label.en}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {value !== 'none' && (
        <div className="space-y-2 animate-slide-up">
          <label className="text-sm font-medium">
            {isFr ? "Nombre d'occurrences" : 'Number of occurrences'}
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOccurrencesChange(Math.max(2, occurrences - 1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="text-lg font-semibold w-8 text-center">{occurrences}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOccurrencesChange(Math.min(12, occurrences + 1))}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
            <span className="text-sm text-muted-foreground ml-2">
              {value === 'weekly'
                ? isFr
                  ? 'semaines'
                  : 'weeks'
                : isFr
                ? 'mois'
                : 'months'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {isFr
              ? `${occurrences} événements seront créés (max 12)`
              : `${occurrences} events will be created (max 12)`}
          </p>
        </div>
      )}
    </div>
  );
}
