import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface IcebreakerCardProps {
  icebreaker: string;
  onRefresh?: () => void;
}

export function IcebreakerCard({ icebreaker, onRefresh }: IcebreakerCardProps) {
  return (
    <div className="glass rounded-xl p-4 border-2 border-coral/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-coral font-medium mb-2 uppercase tracking-wide">
            💬 Icebreaker suggéré
          </p>
          <p className="text-foreground text-lg font-medium leading-relaxed">
            "{icebreaker}"
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className={cn(
              'p-2 rounded-lg transition-all duration-300',
              'bg-coral/10 hover:bg-coral/20 text-coral',
              'hover:rotate-180'
            )}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
