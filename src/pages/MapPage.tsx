import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Radio, RefreshCw, Info, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import { PageLayout } from '@/components/PageLayout';
import { 
  ActivitySelector, 
  ActivityFilter, 
  ExpirationTimer, 
  LocationDescriptionInput, 
  SearchingIndicator,
  InteractiveMap
} from '@/components/map';
import { EmergencyButton } from '@/components/safety';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useActiveSignal } from '@/hooks/useActiveSignal';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNearbyNotifications } from '@/hooks/useNearbyNotifications';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { ActivityType, ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { supabase } from '@/integrations/supabase/client';

// Skeleton component for nearby users on radar
const NearbyUserSkeleton = ({ index, total }: { index: number; total: number }) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = 30 + (index * 5);
  const x = 50 + radius * Math.cos(angle);
  const y = 50 + radius * Math.sin(angle);
  
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
  );
};

export default function MapPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { position, startWatching, lastUpdated } = useLocationStore();
  const { settings } = useUserSettings();
  const { currentRouteIndex, totalRoutes } = useSwipeNavigation();
  const { 
    isActive, 
    mySignal,
    activity: myActivity, 
    nearbyUsers, 
    isDemoMode,
    activateSignal, 
    deactivateSignal,
    extendSignal,
    fetchNearbyUsers,
  } = useActiveSignal();

  // Setup realtime notifications for new nearby users
  const { initializeKnownUsers } = useNearbyNotifications({
    isActive,
    onNewUserNearby: useCallback((user) => {
      // Refresh the list when new user arrives
      if (position) {
        fetchNearbyUsers(settings.visibility_distance);
      }
    }, [position, fetchNearbyUsers, settings.visibility_distance]),
  });
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activityFilters, setActivityFilters] = useState<ActivityType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [locationDescription, setLocationDescription] = useState('');
  const activeTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Initialize known users when nearby list changes
  useEffect(() => {
    if (isActive && nearbyUsers.length > 0) {
      initializeKnownUsers(nearbyUsers.map(u => u.id));
    }
  }, [isActive, nearbyUsers, initializeKnownUsers]);

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
      const { error } = await activateSignal(selectedActivity, 'green', locationDescription);
      setIsActivating(false);
      
      if (error) {
        toast.error('Erreur lors de l\'activation');
      } else {
        setShowActivityModal(false);
        setLocationDescription('');
        toast.success('Signal activé !');
      }
    }
  };

  const handleSignalExpired = () => {
    toast('Ton signal a expiré !', { icon: '⏰' });
  };

  const handleExtendSignal = async () => {
    const { error } = await extendSignal();
    if (error) {
      toast.error('Erreur lors de la prolongation');
    } else {
      toast.success('Signal prolongé de 2h !');
    }
  };

  const handleEmergencyTrigger = (position: GeolocationPosition | null) => {
    // Log emergency trigger for analytics
    console.log('Emergency triggered at:', position?.coords);
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
    <PageLayout className="pb-28" animate={false}>
      <div className="max-w-2xl mx-auto w-full min-h-[100dvh] flex flex-col">
        {/* Header */}
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
                {/* Expiration Timer */}
                {isActive && mySignal?.expires_at && (
                  <ExpirationTimer 
                    expiresAt={mySignal.expires_at} 
                    onExpire={handleSignalExpired}
                    onExtend={handleExtendSignal}
                    canExtend={true}
                    className="mt-1"
                  />
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isActive && myActivity && (
                <button
                  onClick={handleChangeActivity}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deep-blue-light/80 text-sm hover:bg-deep-blue-light transition-colors"
                >
                  <span>{currentActivityData?.emoji}</span>
                  <span className="text-muted-foreground">{currentActivityData?.label}</span>
                </button>
              )}
              
              <button
                onClick={handleManualRefresh}
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
        
        {/* Filters & Open signals count */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
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
              <span className="text-signal-green font-bold">{openUsersCount}</span> {openUsersCount === 1 ? 'personne ouverte' : 'personnes ouvertes'}
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded-full bg-signal-yellow/20 text-signal-yellow text-xs font-medium border border-signal-yellow/30">
                  Démo
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            aria-label={showLegend ? "Masquer la légende" : "Afficher la légende"}
            aria-expanded={showLegend}
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
              Distance: {settings.visibility_distance}m • Rafraîchissement: 30s
            </p>
          </div>
        )}
      </header>

      {/* Searching Indicator - shows when active but no one nearby */}
      {isActive && (
        <div className="px-6 mb-4">
          <SearchingIndicator 
            isSearching={isActive} 
            nearbyCount={filteredNearbyUsers.length}
          />
        </div>
      )}

      {/* Interactive Map */}
      <div className="flex-1 px-4 sm:px-6" style={{ minHeight: '400px', height: '50vh' }}>
        <InteractiveMap
          nearbyUsers={filteredNearbyUsers.map(u => ({
            id: u.id,
            user_id: u.id,
            firstName: u.firstName,
            signal: u.signal,
            activity: u.activity,
            latitude: u.position?.latitude || 0,
            longitude: u.position?.longitude || 0,
            distance: u.distance,
            avatar_url: undefined,
            rating: u.rating,
            activeSince: u.activeSince,
          }))}
          isActive={isActive}
          myActivity={myActivity}
          onUserClick={handleUserClick}
          visibilityDistance={settings.visibility_distance}
          className="w-full h-full"
          userInitial={profile?.first_name?.charAt(0).toUpperCase() || '?'}
          activityFilters={activityFilters}
          onActivityFilterToggle={toggleActivityFilter}
        />
      </div>

      {/* Signal Button */}
      <div className="px-6 mb-4">
        <button
          onClick={handleSignalToggle}
          aria-label={isActive ? "Désactiver ton signal" : "Activer ton signal"}
          className={cn(
            'w-full h-20 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-medium',
            'font-bold text-lg',
            isActive
              ? 'bg-gradient-to-r from-signal-green/20 to-signal-green/10 border-2 border-signal-green text-signal-green glow-green'
              : 'bg-gradient-to-r from-coral/20 to-coral/10 border-2 border-coral text-coral animate-glow-pulse hover:scale-[1.02]'
          )}
        >
          <Radio className="h-6 w-6" />
          {isActive ? 'Tap pour désactiver' : 'Tap pour activer ton signal'}
        </button>
        
        {lastUpdated && (
          <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
            Dernière mise à jour : il y a {getTimeSinceUpdate()}
          </p>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-[500px] glass-strong rounded-t-3xl p-6 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Tu es ouvert·e à...</h2>
                <p className="text-sm text-muted-foreground">Signale que tu veux faire ça avec quelqu'un</p>
              </div>
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

            {/* Location Description */}
            <div className="mt-4">
              <LocationDescriptionInput
                value={locationDescription}
                onChange={setLocationDescription}
                placeholder="Où es-tu ? (optionnel)"
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActivityModal(false);
                  setLocationDescription('');
                }}
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

      {/* Emergency Button - Fixed position */}
      <div className="fixed bottom-32 right-4 z-40">
        <EmergencyButton onTrigger={handleEmergencyTrigger} />
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <SwipeIndicator currentIndex={currentRouteIndex} totalRoutes={totalRoutes} />
      </div>

      <BottomNav />
      </div>
    </PageLayout>
  );
}
