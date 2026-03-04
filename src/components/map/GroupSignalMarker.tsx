import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACTIVITIES } from '@/types/signal';
import type { GroupSignal } from '@/hooks/useGroupSignals';

interface GroupSignalMarkerProps {
  group: GroupSignal;
  onClick: () => void;
}

export function GroupSignalMarker({ group, onClick }: GroupSignalMarkerProps) {
  const activity = ACTIVITIES.find(a => a.id === group.activity);
  const isFull = group.current_members >= group.max_participants;

  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer transform transition-transform hover:scale-110 active:scale-95"
      aria-label={`Group: ${group.title}`}
    >
      {/* Glow */}
      <div className="absolute -inset-2 rounded-2xl bg-coral/30 blur-md animate-pulse" />

      {/* Main marker */}
      <div className={cn(
        'relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-3 border-white shadow-lg',
        isFull ? 'bg-muted' : 'bg-gradient-to-br from-coral to-coral-dark'
      )}>
        <span className="text-lg">{activity?.emoji || '✨'}</span>
        <div className="flex items-center gap-0.5 text-[10px] font-bold text-white">
          <Users className="h-2.5 w-2.5" />
          <span>{group.current_members}/{group.max_participants}</span>
        </div>
      </div>

      {/* Title badge */}
      {group.title && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background/95 border border-border text-[10px] font-semibold text-foreground shadow whitespace-nowrap max-w-[100px] truncate">
          {group.title}
        </div>
      )}
    </button>
  );
}
