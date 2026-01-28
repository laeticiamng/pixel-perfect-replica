import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { SignalMarker } from '@/components/SignalMarker';
import { ActivitySelector } from '@/components/ActivitySelector';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import { useSignalStore } from '@/stores/signalStore';
import { ActivityType, ACTIVITIES } from '@/types/signal';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MapPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { position, startWatching, lastUpdated } = useLocationStore();
  const { 
    isActive, 
    myActivity, 
    nearbyUsers, 
    activateSignal, 
    deactivateSignal,
    refreshNearbyUsers,
    setActivity 
  } = useSignalStore();
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  useEffect(() => {
    startWatching();
  }, [startWatching]);

  useEffect(() => {
    if (position) {
      refreshNearbyUsers(position.latitude, position.longitude);
    }
  }, [position, refreshNearbyUsers]);

  const handleSignalToggle = () => {
    if (isActive) {
      deactivateSignal();
      toast.success('Signal désactivé');
    } else {
      setShowActivityModal(true);
    }
  };

  const handleActivityConfirm = () => {
    if (selectedActivity) {
      activateSignal(selectedActivity);
      setShowActivityModal(false);
      toast.success('Signal activé !');
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
      navigate(`/reveal/${userId}`);
    }
  };

  const openUsersCount = nearbyUsers.filter(u => u.signal === 'green' || u.signal === 'yellow').length;
  const currentActivityData = ACTIVITIES.find(a => a.id === myActivity);

  // Calculate positions for radar display
  const getRadarPosition = (index: number, total: number, distance?: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const maxRadius = 38; // percentage from center
    const minRadius = 15;
    
    // Map distance to radius (closer = larger radius)
    const normalizedDistance = distance ? Math.min(distance / 300, 1) : 0.5;
    const radius = minRadius + (maxRadius - minRadius) * normalizedDistance;
    
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    
    return { x, y };
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
          
          {isActive && myActivity && (
            <button
              onClick={handleChangeActivity}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-light text-sm"
            >
              <span>{currentActivityData?.emoji}</span>
              <span className="text-muted-foreground">{currentActivityData?.label}</span>
            </button>
          )}
        </div>
        
        {/* Open signals count */}
        <div className="mt-3 text-center">
          <p className="text-muted-foreground text-sm">
            <span className="text-coral font-bold">{openUsersCount}</span> personnes ouvertes autour de toi
          </p>
        </div>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center',
              isActive ? 'bg-coral glow-coral animate-pulse-signal' : 'bg-muted'
            )}>
              <span className="text-xs font-bold text-primary-foreground">
                {user?.firstName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
          </div>

          {/* Nearby users */}
          {nearbyUsers.map((nearbyUser, index) => {
            const pos = getRadarPosition(index, nearbyUsers.length, nearbyUser.distance);
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
            Dernière mise à jour : il y a {Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s
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
                disabled={!selectedActivity}
                className="flex-1 h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
