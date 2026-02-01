import { cn } from '@/lib/utils';
import { RefreshCw, Info, Filter } from 'lucide-react';
import { ActivityFilter } from '@/components/radar';
import { ExpirationTimer } from '@/components/radar';
import { ActivityType, ACTIVITIES } from '@/types/signal';

interface MapHeaderProps {
  isActive: boolean;
  mySignal?: { expires_at: string } | null;
  myActivity: ActivityType | null;
  openUsersCount: number;
  isDemoMode: boolean;
  isRefreshing: boolean;
  showLegend: boolean;
  showFilters: boolean;
  activityFilters: ActivityType[];
  onRefresh: () => void;
  onToggleLegend: () => void;
  onToggleFilters: () => void;
  onChangeActivity: () => void;
  onSignalExpired: () => void;
  onExtendSignal: () => void;
  onToggleActivityFilter: (activity: ActivityType) => void;
  onClearFilters: () => void;
}

export function MapHeader({
  isActive,
  mySignal,
  myActivity,
  openUsersCount,
  isDemoMode,
  isRefreshing,
  showLegend,
  showFilters,
  activityFilters,
  onRefresh,
  onToggleLegend,
  onToggleFilters,
  onChangeActivity,
  onSignalExpired,
  onExtendSignal,
  onToggleActivityFilter,
  onClearFilters,
}: MapHeaderProps) {
  const currentActivityData = ACTIVITIES.find(a => a.id === myActivity);

  return (
    <header className="safe-top px-6 py-4">
      <div className="glass-strong rounded-2xl p-4 shadow-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                'w-3.5 h-3.5 rounded-full',
                isActive ? 'bg-signal-green glow-green animate-pulse-signal' : 'bg-signal-red'
              )} />
              {isActive && <div className="absolute inset-0 rounded-full bg-signal-green/30 animate-ripple" />}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">
                {isActive ? 'Tu es visible' : 'Signal désactivé'}
              </span>
              {isActive && mySignal?.expires_at && (
                <ExpirationTimer 
                  expiresAt={mySignal.expires_at} 
                  onExpire={onSignalExpired}
                  onExtend={onExtendSignal}
                  canExtend={true}
                  className="mt-1"
                />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isActive && myActivity && (
              <button
                onClick={onChangeActivity}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-blue-light/80 text-sm hover:bg-deep-blue-light transition-colors"
              >
                <span>{currentActivityData?.emoji}</span>
                <span className="text-muted-foreground">{currentActivityData?.label}</span>
              </button>
            )}
            
            <button
              onClick={onRefresh}
              aria-label="Rafraîchir la carte"
              className={cn(
                "p-2.5 rounded-xl bg-deep-blue-light/80 text-muted-foreground hover:text-foreground hover:bg-deep-blue-light transition-all",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mini legend + Open signals count */}
      <div className="mt-3 px-1">
        <div className="flex items-center gap-4 mb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-signal-green" />
            <span className="text-muted-foreground">Ouvert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-signal-yellow" />
            <span className="text-muted-foreground">Conditionnel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-coral" />
            <span className="text-muted-foreground">Toi</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFilters}
              aria-label={showFilters ? "Masquer les filtres" : "Afficher les filtres d'activité"}
              aria-expanded={showFilters}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters || activityFilters.length > 0
                  ? "bg-coral text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="h-4 w-4" />
            </button>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <span className="text-signal-green font-bold">{openUsersCount}</span> 
              {openUsersCount === 1 ? 'personne ouverte' : 'personnes ouvertes'}
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-full bg-signal-yellow/20 text-signal-yellow text-xs font-medium border border-signal-yellow/30">
                  Démo
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onToggleLegend}
            aria-label={showLegend ? "Masquer la légende" : "Afficher la légende"}
            aria-expanded={showLegend}
            className="text-muted-foreground hover:text-foreground"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Activity Filters */}
      {showFilters && (
        <div className="mt-3 animate-slide-up">
          <ActivityFilter
            selectedActivities={activityFilters}
            onToggle={onToggleActivityFilter}
            onClear={onClearFilters}
          />
        </div>
      )}
      
      {/* Legend */}
      {showLegend && (
        <MapLegend visibilityDistance={200} />
      )}
    </header>
  );
}

function MapLegend({ visibilityDistance }: { visibilityDistance: number }) {
  return (
    <div className="mt-3 glass rounded-xl p-4 animate-slide-up">
      <p className="text-xs font-bold text-coral uppercase tracking-wider mb-3">
        💚 Tout le monde ici est ouvert à l'interaction
      </p>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-signal-green shadow-sm" />
          <span className="text-foreground font-medium">Ouvert</span>
          <span className="text-muted-foreground">= "Je veux faire ça avec quelqu'un"</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-signal-yellow shadow-sm" />
          <span className="text-foreground font-medium">Conditionnel</span>
          <span className="text-muted-foreground">= "Dépend du contexte"</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-coral shadow-sm" />
          <span className="text-foreground font-medium">Toi</span>
          <span className="text-muted-foreground">= Ta position</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 font-medium">
        Distance: {visibilityDistance}m • Rafraîchissement: 30s
      </p>
    </div>
  );
}
