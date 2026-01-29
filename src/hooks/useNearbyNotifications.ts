import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ACTIVITIES } from '@/types/signal';
import toast from 'react-hot-toast';

interface UseNearbyNotificationsProps {
  isActive: boolean;
  onNewUserNearby?: (user: { firstName: string; activity: string; distance: number }) => void;
}

/**
 * Hook that listens to realtime changes in active_signals
 * and notifies the user when a new person arrives nearby.
 * Works like Uber's "searching for drivers" system.
 */
export function useNearbyNotifications({ isActive, onNewUserNearby }: UseNearbyNotificationsProps) {
  const { user } = useAuth();
  const { position } = useLocationStore();
  const { settings } = useUserSettings();
  const knownUserIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Haversine distance calculation
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }, []);

  // Handle new signal
  const handleNewSignal = useCallback(async (payload: any) => {
    if (!user || !position || !isActive) return;

    const newSignal = payload.new;
    
    // Ignore own signal
    if (newSignal.user_id === user.id) return;
    
    // Already known user (just updating position)
    if (knownUserIdsRef.current.has(newSignal.user_id)) return;

    // Calculate distance
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      Number(newSignal.latitude),
      Number(newSignal.longitude)
    );

    // Only notify if within visibility range
    if (distance > settings.visibility_distance) return;

    // Check if user has ghost mode enabled
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('ghost_mode')
      .eq('user_id', newSignal.user_id)
      .maybeSingle();

    if (userSettings?.ghost_mode) return;

    // Get user profile
    const { data: profiles } = await supabase
      .rpc('get_public_profiles', { profile_ids: [newSignal.user_id] });

    const profile = profiles?.[0];
    const firstName = profile?.first_name || 'Quelqu\'un';
    const activity = ACTIVITIES.find(a => a.id === newSignal.activity);

    // Add to known users
    knownUserIdsRef.current.add(newSignal.user_id);

    // Trigger vibration if enabled
    if (settings.proximity_vibration && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Show notification
    toast(
      `${firstName} vient d'arriver ! ${activity?.emoji || '📍'}`,
      {
        icon: '🆕',
        duration: 5000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '2px solid hsl(var(--coral))',
        },
      }
    );

    // Callback
    onNewUserNearby?.({ 
      firstName, 
      activity: newSignal.activity, 
      distance 
    });
  }, [user, position, isActive, settings, calculateDistance, onNewUserNearby]);

  // Initialize known users from current nearby users
  const initializeKnownUsers = useCallback((nearbyUserIds: string[]) => {
    knownUserIdsRef.current = new Set(nearbyUserIds);
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!isActive || !user) {
      // Cleanup when not active
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Create realtime subscription
    const channel = supabase
      .channel('nearby-signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_signals',
        },
        handleNewSignal
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_signals',
        },
        (payload) => {
          // Also handle updates in case someone re-activates their signal
          if (!knownUserIdsRef.current.has(payload.new.user_id)) {
            handleNewSignal(payload);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isActive, user, handleNewSignal]);

  // Clear known users when deactivating
  useEffect(() => {
    if (!isActive) {
      knownUserIdsRef.current.clear();
    }
  }, [isActive]);

  return {
    initializeKnownUsers,
  };
}
