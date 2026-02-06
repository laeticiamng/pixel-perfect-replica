import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

export type EventCategory = 
  | 'social'
  | 'academic'
  | 'sport'
  | 'culture'
  | 'party'
  | 'professional'
  | 'other';

interface EventCategoryBadgeProps {
  category: EventCategory;
  size?: 'sm' | 'md';
  className?: string;
}

const categoryConfig: Record<EventCategory, { emoji: string; color: string }> = {
  social: { emoji: '🤝', color: 'bg-signal-green/20 text-signal-green border-signal-green/30' },
  academic: { emoji: '📚', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  sport: { emoji: '🏃', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  culture: { emoji: '🎭', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  party: { emoji: '🎉', color: 'bg-coral/20 text-coral border-coral/30' },
  professional: { emoji: '💼', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  other: { emoji: '✨', color: 'bg-muted text-muted-foreground border-border' },
};

export function EventCategoryBadge({ category, size = 'md', className }: EventCategoryBadgeProps) {
  const { t } = useTranslation();
  const config = categoryConfig[category] || categoryConfig.other;
  const label = t(`eventCategories.${category}` as any);
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{label}</span>
    </span>
  );
}

export function EventCategorySelector({
  value,
  onChange,
}: {
  value: EventCategory | null;
  onChange: (category: EventCategory) => void;
}) {
  const { t } = useTranslation();
  const categories: EventCategory[] = ['social', 'academic', 'sport', 'culture', 'party', 'professional', 'other'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const config = categoryConfig[cat];
        const label = t(`eventCategories.${cat}` as any);
        const isSelected = value === cat;
        
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all',
              isSelected
                ? 'ring-2 ring-coral ring-offset-2 ring-offset-background ' + config.color
                : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
            )}
          >
            <span>{config.emoji}</span>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
