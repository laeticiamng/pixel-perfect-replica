import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useActiveSignal } from '@/hooks/useActiveSignal';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useNearbyNotifications } from '@/hooks/useNearbyNotifications';
import { ActivityType } from '@/types/signal';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export function useMapPageLogic() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { position, startWatching, lastUpdated } = useLocationStore();
  const { settings } = useUserSettings();
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

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activityFilters, setActivityFilters] = useState<ActivityType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [locationDescription, setLocationDescription] = useState('');
  const activeTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Setup realtime notifications for new nearby users
  const { initializeKnownUsers } = useNearbyNotifications({
    isActive,
    onNewUserNearby: useCallback((user) => {
      if (position) {
        fetchNearbyUsers(settings.visibility_distance);
      }
    }, [position, fetchNearbyUsers, settings.visibility_distance]),
  });

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

  const handleSignalToggle = useCallback(() => {
    if (isActive) {
      deactivateSignal();
      toast.success('Signal désactivé');
    } else {
      setShowActivityModal(true);
    }
  }, [isActive, deactivateSignal]);

  const handleActivityConfirm = useCallback(async () => {
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
  }, [selectedActivity, activateSignal, locationDescription]);

  const handleSignalExpired = useCallback(() => {
    toast('Ton signal a expiré !', { icon: '⏰' });
  }, []);

  const handleExtendSignal = useCallback(async () => {
    const { error } = await extendSignal();
    if (error) {
      toast.error('Erreur lors de la prolongation');
    } else {
      toast.success('Signal prolongé de 2h !');
    }
  }, [extendSignal]);

  const handleEmergencyTrigger = useCallback((pos: GeolocationPosition | null) => {
    console.log('Emergency triggered at:', pos?.coords);
  }, []);

  const handleChangeActivity = useCallback(() => {
    setSelectedActivity(myActivity);
    setShowActivityModal(true);
  }, [myActivity]);

  const handleUserClick = useCallback((userId: string, distance?: number) => {
    const maxRevealDistance = isDemoMode ? Infinity : settings.visibility_distance;
    
    if (distance && distance > maxRevealDistance) {
      toast('Rapproche-toi pour voir qui c\'est !', { icon: '👀' });
    } else {
      if (settings.proximity_vibration && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
      navigate(`/reveal/${userId}`);
    }
  }, [isDemoMode, settings.visibility_distance, settings.proximity_vibration, navigate]);

  const toggleActivityFilter = useCallback((activity: ActivityType) => {
    setActivityFilters(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  }, []);

  const clearActivityFilters = useCallback(() => {
    setActivityFilters([]);
  }, []);

  const getTimeSinceUpdate = useCallback(() => {
    if (!lastUpdated) return null;
    const seconds = Math.round((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}min`;
  }, [lastUpdated]);

  // Computed values
  const filteredNearbyUsers = activityFilters.length > 0
    ? nearbyUsers.filter(u => activityFilters.includes(u.activity))
    : nearbyUsers;

  const openUsersCount = filteredNearbyUsers.filter(
    u => u.signal === 'green' || u.signal === 'yellow'
  ).length;

  return {
    // State
    profile,
    position,
    settings,
    isActive,
    mySignal,
    myActivity,
    nearbyUsers,
    isDemoMode,
    showActivityModal,
    setShowActivityModal,
    selectedActivity,
    setSelectedActivity,
    showLegend,
    setShowLegend,
    isRefreshing,
    isActivating,
    activityFilters,
    showFilters,
    setShowFilters,
    locationDescription,
    setLocationDescription,
    lastUpdated,
    
    // Computed
    filteredNearbyUsers,
    openUsersCount,
    
    // Handlers
    handleManualRefresh,
    handleSignalToggle,
    handleActivityConfirm,
    handleSignalExpired,
    handleExtendSignal,
    handleEmergencyTrigger,
    handleChangeActivity,
    handleUserClick,
    toggleActivityFilter,
    clearActivityFilters,
    getTimeSinceUpdate,
  };
}
