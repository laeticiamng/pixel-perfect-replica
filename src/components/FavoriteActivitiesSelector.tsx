import { useState, useEffect } from 'react';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';

const MAX_FAVORITES = 6;

interface FavoriteActivitiesSelectorProps {
  value: ActivityType[];
  onChange: (activities: ActivityType[]) => void;
  className?: string;
}

export function FavoriteActivitiesSelector({ 
  value, 
  onChange, 
  className 
}: FavoriteActivitiesSelectorProps) {
  const toggleActivity = (activity: ActivityType) => {
    if (value.includes(activity)) {
      onChange(value.filter(a => a !== activity));
    } else if (value.length < MAX_FAVORITES) {
      onChange([...value, activity]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Activités favorites
        </label>
        <span className={cn(
          "text-xs font-medium",
          value.length >= MAX_FAVORITES - 1 ? "text-signal-yellow" : "text-muted-foreground",
          value.length >= MAX_FAVORITES && "text-signal-red"
        )}>
          {value.length}/{MAX_FAVORITES}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {ACTIVITIES.map((activity) => {
          const isSelected = value.includes(activity.id);
          const isDisabled = !isSelected && value.length >= MAX_FAVORITES;
          
          return (
            <button
              key={activity.id}
              type="button"
              onClick={() => toggleActivity(activity.id)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                isSelected 
                  ? "bg-coral text-primary-foreground glow-coral" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              aria-pressed={isSelected}
              aria-label={`${activity.label} ${isSelected ? 'sélectionné' : ''}`}
            >
              <span>{activity.emoji}</span>
              <span>{activity.label}</span>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Choisis jusqu'à {MAX_FAVORITES} activités qui te correspondent le mieux
      </p>
    </div>
  );
}
