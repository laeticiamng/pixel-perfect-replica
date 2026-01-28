import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Radio, RefreshCw, Info, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { SignalMarker } from '@/components/SignalMarker';
import { ActivitySelector } from '@/components/ActivitySelector';
import { ActivityFilter } from '@/components/ActivityFilter';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useActiveSignal } from '@/hooks/useActiveSignal';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ActivityType, ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/integrations/supabase/client';

export default function MapPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { position, startWatching, lastUpdated } = useLocationStore();
  const { settings } = useUserSettings();
  const { 
    isActive, 
    activity: myActivity, 
    nearbyUsers, 
    activateSignal, 
    deactivateSignal,
    fetchNearbyUsers,
  } = useActiveSignal();
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activityFilters, setActivityFilters] = useState<ActivityType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const activeTimeRef = useRef<NodeJS.Timeout | null>(null);

  // Start location watching
  useEffect(() => {
    startWatching();
  }, [startWatching]);

  // Refresh nearby users when position changes
  useEffect(() => {
    if (position) {
      fetchNearbyUsers(settings.visibility_distance);
    }
  }, [position, fetchNearbyUsers, settings.visibility_distance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (position && isActive) {
      const interval = setInterval(() => {
        fetchNearbyUsers(settings.visibility_distance);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [position, isActive, fetchNearbyUsers, settings.visibility_distance]);

  // Track active time
  useEffect(() => {
    if (isActive && user) {
      activeTimeRef.current = setInterval(async () => {
        // Add 1 minute of active time
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('hours_active')
          .eq('user_id', user.id)
          .single();
        
        if (currentStats) {
          await supabase
            .from('user_stats')
            .update({ hours_active: Number(currentStats.hours_active) + (1/60) })
            .eq('user_id', user.id);
        }
      }, 60000);
    } else if (activeTimeRef.current) {
      clearInterval(activeTimeRef.current);
    }
    return () => {
      if (activeTimeRef.current) clearInterval(activeTimeRef.current);
    };
  }, [isActive, user]);

  const handleManualRefresh = useCallback(() => {
    if (position) {
      setIsRefreshing(true);
      fetchNearbyUsers(settings.visibility_distance);
      setTimeout(() => {
        setIsRefreshing(false);
        toast.success('Carte mise à jour !');
      }, 500);
    }
  }, [position, fetchNearbyUsers, settings.visibility_distance]);

  const handleSignalToggle = () => {
    if (isActive) {
      deactivateSignal();
      toast.success('Signal désactivé');
    } else {
      setShowActivityModal(true);
    }
  };

  const handleActivityConfirm = async () => {
    if (selectedActivity) {
      setIsActivating(true);
      const { error } = await activateSignal(selectedActivity);
      setIsActivating(false);
      
      if (error) {
        toast.error('Erreur lors de l\'activation');
      } else {
        setShowActivityModal(false);
        toast.success('Signal activé !');
      }
    }
  };

  const handleChangeActivity = () => {
    setSelectedActivity(myActivity);
    setShowActivityModal(true);
  };

  const handleUserClick = (userId: string, distance?: number) => {
    if (distance && distance > 50) {
      toast('Rapproche-toi pour voir qui c\'est !', { icon: '👀' });
    } else {
      // Vibrate when close enough
      if (settings.proximity_vibration && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
      navigate(`/reveal/${userId}`);
    }
  };

  const toggleActivityFilter = (activity: ActivityType) => {
    setActivityFilters(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const clearActivityFilters = () => {
    setActivityFilters([]);
  };

  // Filter nearby users by activity
  const filteredNearbyUsers = activityFilters.length > 0
    ? nearbyUsers.filter(u => activityFilters.includes(u.activity))
    : nearbyUsers;

  const openUsersCount = filteredNearbyUsers.filter(u => u.signal === 'green' || u.signal === 'yellow').length;
  const currentActivityData = ACTIVITIES.find(a => a.id === myActivity);

  // Calculate positions for radar display
  const getRadarPosition = (index: number, total: number, distance?: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const maxRadius = 38;
    const minRadius = 15;
    
    const normalizedDistance = distance ? Math.min(distance / settings.visibility_distance, 1) : 0.5;
    const radius = minRadius + (maxRadius - minRadius) * normalizedDistance;
    
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    
    return { x, y };
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return null;
    const seconds = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-radial flex flex-col pb-28">
      {/* Header */}
      <header className="safe-top px-6 py-4">
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-3 h-3 rounded-full',
              isActive ? 'bg-signal-green glow-green animate-pulse-signal' : 'bg-signal-red'
            )} />
            <span className="font-medium text-foreground">
              {isActive ? 'Tu es visible' : 'Signal désactivé'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isActive && myActivity && (
              <button
                onClick={handleChangeActivity}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-light text-sm"
              >
                <span>{currentActivityData?.emoji}</span>
                <span className="text-muted-foreground">{currentActivityData?.label}</span>
              </button>
            )}
            
            <button
              onClick={handleManualRefresh}
              className={cn(
                "p-2 rounded-lg bg-deep-blue-light text-muted-foreground hover:text-foreground transition-all",
                isRefreshing && "animate-spin"
              )}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Filters & Open signals count */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showFilters || activityFilters.length > 0
                  ? "bg-coral text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="h-4 w-4" />
            </button>
            <p className="text-muted-foreground text-sm">
              <span className="text-coral font-bold">{openUsersCount}</span> personnes ouvertes
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
        
        {/* Activity Filters */}
        {showFilters && (
          <div className="mt-3 animate-slide-up">
            <ActivityFilter
              selectedActivities={activityFilters}
              onToggle={toggleActivityFilter}
              onClear={clearActivityFilters}
            />
          </div>
        )}
        
        {/* Legend */}
        {showLegend && (
          <div className="mt-3 glass rounded-xl p-4 animate-slide-up">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Légende
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-signal-green" />
                <span className="text-muted-foreground">Ouvert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-signal-yellow" />
                <span className="text-muted-foreground">Conditionnel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-coral" />
                <span className="text-muted-foreground">Toi</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Distance: {settings.visibility_distance}m • Rafraîchissement: 30s
            </p>
          </div>
        )}
      </header>

      {/* Radar Map */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative w-full max-w-sm aspect-square">
          {/* Radar circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full border border-muted/20" />
            <div className="absolute w-3/4 h-3/4 rounded-full border border-muted/20" />
            <div className="absolute w-1/2 h-1/2 rounded-full border border-muted/20" />
            <div className="absolute w-1/4 h-1/4 rounded-full border border-muted/30" />
          </div>
          
          {/* Distance labels */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute top-1 text-[10px] text-muted-foreground">
              {settings.visibility_distance}m
            </span>
            <span className="absolute top-1/4 text-[10px] text-muted-foreground">
              {Math.round(settings.visibility_distance * 0.75)}m
            </span>
          </div>
          
          {/* Radar sweep effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-full animate-radar-sweep origin-center">
              <div 
                className="absolute top-1/2 left-1/2 w-1/2 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--coral) / 0.5), transparent)',
                  transformOrigin: 'left center',
                }}
              />
            </div>
          </div>
          
          {/* Center point (user) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isActive ? 'bg-coral glow-coral animate-pulse-signal' : 'bg-muted'
            )}>
              <span className="text-sm font-bold text-primary-foreground">
                {profile?.first_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            {/* Ripple effect */}
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
            )}
          </div>

          {/* Nearby users */}
          {filteredNearbyUsers.map((nearbyUser, index) => {
            const pos = getRadarPosition(index, filteredNearbyUsers.length, nearbyUser.distance);
            const isClose = nearbyUser.distance && nearbyUser.distance < 50;
            
            return (
              <div
                key={nearbyUser.id}
                className="absolute transition-all duration-500"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <SignalMarker
                  signal={nearbyUser.signal}
                  activity={nearbyUser.activity}
                  distance={nearbyUser.distance}
                  firstName={nearbyUser.firstName}
                  isClose={isClose}
                  onClick={() => handleUserClick(nearbyUser.id, nearbyUser.distance)}
                  size="sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Signal Button */}
      <div className="px-6 mb-4">
        <button
          onClick={handleSignalToggle}
          className={cn(
            'w-full h-20 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300',
            'font-semibold text-lg',
            isActive
              ? 'bg-signal-green/20 border-2 border-signal-green text-signal-green glow-green'
              : 'bg-coral/20 border-2 border-coral text-coral glow-coral hover:scale-[1.02]'
          )}
        >
          <Radio className="h-6 w-6" />
          {isActive ? 'Tap pour désactiver' : 'Tap pour activer ton signal'}
        </button>
        
        {lastUpdated && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Dernière mise à jour : il y a {getTimeSinceUpdate()}
          </p>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[500px] glass-strong rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Tu fais quoi ?</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            <ActivitySelector
              selectedActivity={selectedActivity}
              onSelect={setSelectedActivity}
            />
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowActivityModal(false)}
                className="flex-1 h-12 rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleActivityConfirm}
                disabled={!selectedActivity || isActivating}
                className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
              >
                {isActivating ? 'Activation...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
