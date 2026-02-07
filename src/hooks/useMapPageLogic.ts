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
import { useTranslation } from '@/lib/i18n';

export function useMapPageLogic() {
  const { t } = useTranslation();
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

  // Track active time using RPC (direct UPDATE blocked by RLS)
  useEffect(() => {
    if (isActive && user) {
      activeTimeRef.current = setInterval(async () => {
        await supabase.rpc('add_hours_active', {
          p_user_id: user.id,
          p_hours: 1 / 60,
        });
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
        toast.success(t('mapToasts.mapUpdated'));
      }, 500);
    }
  }, [position, fetchNearbyUsers, settings.visibility_distance, t]);

  const handleSignalToggle = useCallback(() => {
    if (isActive) {
      deactivateSignal();
      toast.success(t('mapToasts.signalDeactivated'));
    } else {
      setShowActivityModal(true);
    }
  }, [isActive, deactivateSignal, t]);

  const handleActivityConfirm = useCallback(async () => {
    if (selectedActivity) {
      setIsActivating(true);
      const { error } = await activateSignal(selectedActivity, 'green', locationDescription);
      setIsActivating(false);
      
      if (error) {
        toast.error(t('errors.activationError'));
      } else {
        setShowActivityModal(false);
        setLocationDescription('');
        toast.success(t('mapToasts.signalActivated'));
      }
    }
  }, [selectedActivity, activateSignal, locationDescription, t]);

  const handleSignalExpired = useCallback(() => {
    toast(t('mapToasts.signalExpired'));
  }, [t]);

  const handleExtendSignal = useCallback(async () => {
    const { error } = await extendSignal();
    if (error) {
      toast.error(t('errors.extensionError'));
    } else {
      toast.success(t('mapToasts.signalExtended'));
    }
  }, [extendSignal, t]);

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
      toast(t('mapToasts.getCLoser'), { icon: '👀' });
    } else {
      if (settings.proximity_vibration && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
      navigate(`/reveal/${userId}`);
    }
  }, [isDemoMode, settings.visibility_distance, settings.proximity_vibration, navigate, t]);

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
