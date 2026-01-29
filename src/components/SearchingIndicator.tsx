import { Loader2, Users, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchingIndicatorProps {
  isSearching: boolean;
  nearbyCount: number;
  className?: string;
}

/**
 * Uber-style "searching" indicator that shows when
 * the user is active and waiting for others to appear.
 */
export function SearchingIndicator({ isSearching, nearbyCount, className }: SearchingIndicatorProps) {
  if (!isSearching) return null;

  return (
    <div className={cn(
      "glass-strong rounded-2xl p-4 animate-fade-in",
      className
    )}>
      <div className="flex items-center gap-4">
        {/* Animated searching icon */}
        <div className="relative">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            nearbyCount === 0 
              ? "bg-coral/20 border-2 border-coral border-dashed animate-spin-slow" 
              : "bg-signal-green/20 border-2 border-signal-green"
          )}>
            {nearbyCount === 0 ? (
              <Wifi className="h-5 w-5 text-coral animate-pulse" />
            ) : (
              <Users className="h-5 w-5 text-signal-green" />
            )}
          </div>
          {nearbyCount === 0 && (
            <div className="absolute inset-0 rounded-full border-2 border-coral/30 animate-ping" />
          )}
        </div>

        {/* Status text */}
        <div className="flex-1">
          {nearbyCount === 0 ? (
            <>
              <p className="font-semibold text-foreground flex items-center gap-2">
                Recherche en cours
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-coral animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Tu seras notifié dès qu'une personne arrive
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                {nearbyCount} personne{nearbyCount > 1 ? 's' : ''} à proximité
              </p>
              <p className="text-sm text-muted-foreground">
                Explore le radar pour les découvrir !
              </p>
            </>
          )}
        </div>
      </div>

      {/* Scanning effect bar */}
      {nearbyCount === 0 && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-transparent via-coral to-transparent animate-scan"
            style={{ width: '30%' }}
          />
        </div>
      )}
    </div>
  );
}
