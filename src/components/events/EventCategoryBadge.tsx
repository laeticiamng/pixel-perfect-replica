import { cn } from '@/lib/utils';

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

const categoryConfig: Record<EventCategory, { label: string; emoji: string; color: string }> = {
  social: { label: 'Social', emoji: '🤝', color: 'bg-signal-green/20 text-signal-green border-signal-green/30' },
  academic: { label: 'Académique', emoji: '📚', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  sport: { label: 'Sport', emoji: '🏃', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  culture: { label: 'Culture', emoji: '🎭', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  party: { label: 'Soirée', emoji: '🎉', color: 'bg-coral/20 text-coral border-coral/30' },
  professional: { label: 'Pro', emoji: '💼', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  other: { label: 'Autre', emoji: '✨', color: 'bg-muted text-muted-foreground border-border' },
};

export function EventCategoryBadge({ category, size = 'md', className }: EventCategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.other;
  
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
      <span>{config.label}</span>
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
  const categories: EventCategory[] = ['social', 'academic', 'sport', 'culture', 'party', 'professional', 'other'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const config = categoryConfig[cat];
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
            <span className="text-sm font-medium">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
