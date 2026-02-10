import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import { ACTIVITIES, ActivityType, NearbyUser, ACTIVITY_CONFIG } from '@/types/signal';
import { generateMockUsers } from '@/utils/mockData';
import { getDistanceBetweenPoints } from '@/utils/distance';
import { useNavigate } from 'react-router-dom';

type SignalMode = 'dispo' | 'conditionnel' | 'occupe';

export default function RadarPage() {
  const navigate = useNavigate();
  const [signalMode, setSignalMode] = useState<SignalMode>('occupe');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [userPosition] = useState({ latitude: 48.8566, longitude: 2.3522 });

  // Generate mock users on mount
  useEffect(() => {
    const users = generateMockUsers(userPosition.latitude, userPosition.longitude, 18);
    const withDistance = users.map(u => ({
      ...u,
      distance: getDistanceBetweenPoints(
        { latitude: userPosition.latitude, longitude: userPosition.longitude },
        u.position
      ),
    }));
    withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setNearbyUsers(withDistance);
  }, [userPosition]);

  const handleSignalChange = useCallback((mode: SignalMode) => {
    if (mode === 'conditionnel') {
      setShowActivityDrawer(true);
    } else {
      setSelectedActivity(null);
    }
    setSignalMode(mode);
  }, []);

  const handleActivitySelect = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setShowActivityDrawer(false);
  };

  const getSignalColor = (signal: string) => {
    if (signal === 'green') return 'bg-green-500';
    if (signal === 'yellow') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const getSignalGlow = (signal: string) => {
    if (signal === 'green') return 'shadow-[0_0_12px_rgba(34,197,94,0.6)]';
    if (signal === 'yellow') return 'shadow-[0_0_12px_rgba(249,115,22,0.6)]';
    return '';
  };

  return (
    <PageLayout className="pb-28" animate={false}>
      <div className="max-w-[430px] mx-auto w-full h-[100dvh] flex flex-col">
        {/* Signal Switch - Sticky top */}
        <div className="sticky top-0 z-30 safe-top px-4 pt-4 pb-2 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card/80 border border-white/10 shadow-medium">
            <button
              onClick={() => handleSignalChange('dispo')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                signalMode === 'dispo'
                  ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mr-1.5">🟢</span> Dispo
            </button>
            <button
              onClick={() => handleSignalChange('conditionnel')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                signalMode === 'conditionnel'
                  ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mr-1.5">🟠</span> Conditionnel
            </button>
            <button
              onClick={() => handleSignalChange('occupe')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                signalMode === 'occupe'
                  ? 'bg-gray-600 text-white shadow-[0_0_20px_rgba(107,114,128,0.4)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="mr-1.5">⚫</span> Occupé
            </button>
          </div>

          {/* Active activity tag */}
          {signalMode === 'conditionnel' && selectedActivity && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-sm font-medium">
                <span>{ACTIVITY_CONFIG[selectedActivity]?.emoji}</span>
                <span>{ACTIVITY_CONFIG[selectedActivity]?.label}</span>
                <button onClick={() => setShowActivityDrawer(true)} className="ml-1 opacity-60 hover:opacity-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Radar Map Area */}
        <div className="flex-1 min-h-0 px-4 py-2 relative">
          {/* Radar visualization */}
          <div className="relative w-full h-full rounded-2xl bg-card/50 border border-white/5 overflow-hidden">
            {/* Radar circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="absolute rounded-full border border-violet/10"
                  style={{
                    width: `${i * 22}%`,
                    height: `${i * 22}%`,
                  }}
                />
              ))}
              {/* Radar sweep */}
              <div className="absolute w-full h-full animate-radar-sweep" style={{ animationDuration: '4s' }}>
                <div
                  className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                  style={{
                    background: 'linear-gradient(90deg, hsl(263 83% 58% / 0.5) 0%, transparent 100%)',
                  }}
                />
              </div>
              {/* Center dot (you) */}
              <div className="relative z-10">
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 border-white',
                  signalMode === 'dispo' ? 'bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.6)]' :
                  signalMode === 'conditionnel' ? 'bg-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.6)]' :
                  'bg-gray-500'
                )} />
                {signalMode !== 'occupe' && (
                  <div className={cn(
                    'absolute inset-0 rounded-full animate-ripple',
                    signalMode === 'dispo' ? 'bg-green-500/30' : 'bg-orange-500/30'
                  )} />
                )}
              </div>
            </div>

            {/* User markers */}
            {nearbyUsers.map((user, i) => {
              if (user.signal === 'red') return null; // Grey/occupé users are dimmed
              const angle = (i / nearbyUsers.length) * 2 * Math.PI;
              const maxRadius = 42;
              const distanceFraction = Math.min((user.distance || 200) / 500, 1);
              const radius = distanceFraction * maxRadius;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              return (
                <motion.button
                  key={user.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => user.signal !== 'red' && setSelectedUser(user)}
                  className={cn(
                    'absolute z-10 flex items-center justify-center transition-transform hover:scale-125',
                    user.signal === 'red' && 'opacity-30 cursor-not-allowed'
                  )}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="relative">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/20',
                      getSignalColor(user.signal),
                      user.signal !== 'red' && getSignalGlow(user.signal),
                    )}>
                      {user.firstName.charAt(0)}
                    </div>
                    {user.signal !== 'red' && (
                      <div className={cn(
                        'absolute inset-0 rounded-full animate-pulse-signal',
                        user.signal === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'
                      )} />
                    )}
                  </div>
                </motion.button>
              );
            })}

            {/* Grey users shown dimmed */}
            {nearbyUsers.filter(u => u.signal === 'red').map((user, i) => {
              const angle = ((i + nearbyUsers.filter(u => u.signal !== 'red').length) / nearbyUsers.length) * 2 * Math.PI;
              const distanceFraction = Math.min((user.distance || 300) / 500, 1);
              const radius = distanceFraction * 42;
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);

              return (
                <div
                  key={user.id}
                  className="absolute z-5 opacity-30"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-400 text-xs font-bold border border-gray-700">
                    {user.firstName.charAt(0)}
                  </div>
                </div>
              );
            })}

            {/* Distance labels */}
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/60 font-medium">
              <MapPin className="h-3 w-3 inline mr-1" />
              Rayon : 500m
            </div>
            <div className="absolute bottom-4 right-4 text-xs font-medium">
              <span className="text-green-400">{nearbyUsers.filter(u => u.signal === 'green').length}</span>
              <span className="text-muted-foreground/40 mx-1">|</span>
              <span className="text-orange-400">{nearbyUsers.filter(u => u.signal === 'yellow').length}</span>
              <span className="text-muted-foreground/40 mx-1">|</span>
              <span className="text-gray-500">{nearbyUsers.filter(u => u.signal === 'red').length}</span>
            </div>
          </div>
        </div>

        {/* User mini-fiche popup */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-28 left-4 right-4 z-40 max-w-[430px] mx-auto"
            >
              <div className="glass-strong rounded-2xl p-5 shadow-strong">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg',
                      getSignalColor(selectedUser.signal),
                      getSignalGlow(selectedUser.signal),
                    )}>
                      {selectedUser.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">{selectedUser.firstName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.university || 'Étudiant·e'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span>{ACTIVITY_CONFIG[selectedUser.activity]?.emoji}</span>
                    <span className="text-foreground font-medium">
                      {ACTIVITY_CONFIG[selectedUser.activity]?.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    ~{Math.round(selectedUser.distance || 0)}m
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedUser(null);
                    navigate('/app/session', { state: { partner: selectedUser } });
                  }}
                  className="w-full py-3 rounded-xl bg-violet text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_0_20px_hsl(263_83%_58%/0.3)]"
                >
                  Proposer une session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Drawer */}
        <AnimatePresence>
          {showActivityDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowActivityDrawer(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto"
              >
                <div className="glass-strong rounded-t-3xl p-6 pb-10">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-5" />
                  <h2 className="text-xl font-bold text-foreground mb-2">Que veux-tu faire ?</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    Choisis une activité pour que les autres sachent ce que tu proposes
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => handleActivitySelect(act.id)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200',
                          selectedActivity === act.id
                            ? 'bg-violet/15 border-violet text-foreground'
                            : 'bg-card/50 border-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground'
                        )}
                      >
                        <span className="text-2xl">{act.emoji}</span>
                        <span className="font-medium text-sm">{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </PageLayout>
  );
}
