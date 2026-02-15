import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { logger } from '@/lib/logger';
import { generateMockUsers } from '@/utils/mockData';
import { useTranslation } from '@/lib/i18n';

type SignalType = 'green' | 'yellow' | 'red';
type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';

interface ActiveSignal {
  id: string;
  user_id: string;
  signal_type: SignalType;
  activity: ActivityType;
  latitude: number;
  longitude: number;
  started_at: string;
  expires_at: string;
}

interface NearbyUser {
  id: string;
  firstName: string;
  signal: SignalType;
  activity: ActivityType;
  distance?: number;
  activeSince: Date;
  rating: number;
  position: { latitude: number; longitude: number };
}

export function useActiveSignal() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { position } = useLocationStore();
  const [mySignal, setMySignal] = useState<ActiveSignal | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fetch my current signal
  const fetchMySignal = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('active_signals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      logger.api.error('active_signals', 'select', String(error));
      return;
    }

    setMySignal(data);
  }, [user]);

  // Activate signal (with rate limiting: max 10 new signals per hour)
  const activateSignal = async (activity: ActivityType, signalType: SignalType = 'green', locationDescription?: string) => {
    if (!user || !position) return { error: new Error('Missing user or position') };

    setIsLoading(true);

    // First try to update existing signal
    const { data: existingData, error: existingError } = await supabase
      .from('active_signals')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from('active_signals')
        .update({
          signal_type: signalType,
          activity: activity,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy || null,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          location_description: locationDescription || null,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      setIsLoading(false);
      if (!error && data) {
        setMySignal(data);
        logger.action.signalActivated(user.id, activity);
      }
      return { data, error };
    } else {
      // Check rate limit before creating a new signal (max 10/hour)
      const { data: rateLimitOk } = await supabase
        .rpc('check_signal_rate_limit', { p_user_id: user.id });

      if (rateLimitOk === false) {
        setIsLoading(false);
        return { data: null, error: new Error('Rate limit exceeded: max 10 signals per hour') };
      }

      // Insert new signal
      const { data, error } = await supabase
        .from('active_signals')
        .insert({
          user_id: user.id,
          signal_type: signalType,
          activity: activity,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy || null,
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          location_description: locationDescription || null,
        })
        .select()
        .single();

      // Record signal creation for rate limiting
      if (!error && data) {
        await supabase.from('signal_rate_limits').insert({ user_id: user.id });
      }

      setIsLoading(false);
      if (!error && data) {
        setMySignal(data);
        logger.action.signalActivated(user.id, activity);
      }
      return { data, error };
    }
  };

  // Deactivate signal
  const deactivateSignal = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);

    const { error } = await supabase
      .from('active_signals')
      .delete()
      .eq('user_id', user.id);

    setIsLoading(false);
    if (!error) {
      setMySignal(null);
      logger.action.signalDeactivated(user.id);
    }
    return { error };
  };

  // Update signal position
  const updatePosition = async () => {
    if (!user || !position || !mySignal) return;

    await supabase
      .from('active_signals')
      .update({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy || null,
      })
      .eq('user_id', user.id);
  };

  // Extend signal expiration by 2 hours
  const extendSignal = async () => {
    if (!user || !mySignal) return { error: new Error('No active signal') };

    const newExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('active_signals')
      .update({ expires_at: newExpiry })
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setMySignal(data);
    }
    return { data, error };
  };


  // Update active signal state (green/yellow/red)
  const updateSignalState = async (signalType: SignalType) => {
    if (!user || !mySignal) return { error: new Error('No active signal') };

    const { data, error } = await supabase
      .from('active_signals')
      .update({ signal_type: signalType })
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setMySignal(data);
    }

    return { data, error };
  };

  // Fetch nearby users with signals (respects ghost mode)
  const fetchNearbyUsers = useCallback(async (maxDistance: number = 200) => {
    if (!user || !position) return;

    try {
      // Use get_nearby_signals RPC (secure, respects ghost mode)
      const { data: signals, error: rpcError } = await supabase
        .rpc('get_nearby_signals', {
          user_lat: position.latitude,
          user_lon: position.longitude,
          max_distance_meters: maxDistance
        });

      if (!rpcError && signals && signals.length > 0) {
        // Map RPC results to NearbyUser format
        const nearby: NearbyUser[] = signals.map((signal) => {
          const distance = calculateDistance(
            position.latitude,
            position.longitude,
            Number(signal.latitude),
            Number(signal.longitude)
          );

          return {
            id: signal.user_id,
            firstName: signal.first_name || t('eventsExtra.anonymous'),
            signal: signal.signal_type as SignalType,
            activity: signal.activity as ActivityType,
            distance,
            activeSince: new Date(signal.started_at),
            rating: signal.rating ? Number(signal.rating) : 5.0,
            position: {
              latitude: Number(signal.latitude),
              longitude: Number(signal.longitude),
            },
          };
        }).filter((u: NearbyUser) => u.distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance);

        if (nearby.length > 0) {
          setIsDemoMode(false);
          setNearbyUsers(nearby);
          return;
        }
      }

      // Fallback if RPC returns nothing - use direct query
      const { data: fallbackSignals, error: fallbackError } = await supabase
        .from('active_signals')
        .select(`
          id,
          user_id,
          signal_type,
          activity,
          latitude,
          longitude,
          started_at
        `)
        .neq('user_id', user.id)
        .gte('expires_at', new Date().toISOString());

      if (fallbackError) {
        logger.api.error('active_signals', 'select-nearby', fallbackError.message);
        return;
      }

      if (!fallbackSignals || fallbackSignals.length === 0) {
        setNearbyUsers([]);
        // Show demo users if no real users
        const mockUsers = generateMockUsers(position.latitude, position.longitude, 8);
        const mocksWithDistance = mockUsers.map(u => ({
          ...u,
          distance: calculateDistance(position.latitude, position.longitude, u.position.latitude, u.position.longitude),
        })).filter(u => u.distance <= maxDistance).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setNearbyUsers(mocksWithDistance);
        setIsDemoMode(true);
        return;
      }

      // Get profiles using secure RPC (avoids RLS issues on user_settings/user_stats)
      const userIds = fallbackSignals.map(s => s.user_id);
      
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_ids: userIds });

      // Calculate distances and combine data
      const nearbyFiltered: NearbyUser[] = fallbackSignals
        .map(signal => {
          const profile = profiles?.find(p => p.id === signal.user_id);
          
          const distance = calculateDistance(
            position.latitude,
            position.longitude,
            Number(signal.latitude),
            Number(signal.longitude)
          );

          return {
            id: signal.user_id,
            firstName: profile?.first_name || t('eventsExtra.anonymous'),
            signal: signal.signal_type as SignalType,
            activity: signal.activity as ActivityType,
            distance,
            activeSince: new Date(signal.started_at),
            rating: 5.0, // Default - can't read other users' stats due to RLS
            position: {
              latitude: Number(signal.latitude),
              longitude: Number(signal.longitude),
            },
          };
        })
        .filter(u => u.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);

      // If no real users found, add demo users so the map isn't empty
      if (nearbyFiltered.length === 0) {
        const mockUsers = generateMockUsers(position.latitude, position.longitude, 8);
        const mocksWithDistance = mockUsers.map(u => ({
          ...u,
          distance: calculateDistance(position.latitude, position.longitude, u.position.latitude, u.position.longitude),
        })).filter(u => u.distance <= maxDistance).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setNearbyUsers(mocksWithDistance);
        setIsDemoMode(true);
        return;
      }

      setIsDemoMode(false);
      setNearbyUsers(nearbyFiltered);
    } catch (err) {
      logger.api.error('active_signals', 'fetchNearbyUsers', String(err));
    }
  }, [user, position]);

  // Haversine distance calculation
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchMySignal();
    }
  }, [isAuthenticated, fetchMySignal]);

  // Update position when it changes — only fires on actual coordinate changes
  useEffect(() => {
    if (mySignal && position) {
      updatePosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.latitude, position?.longitude]);

  // Setup realtime subscription for nearby signals
  useEffect(() => {
    if (!user || !position) return;

    // Initial fetch
    fetchNearbyUsers(200);

    const channel = supabase
      .channel('active-signals-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'active_signals',
        },
        () => {
          logger.api.request('active_signals', 'realtime-insert');
          fetchNearbyUsers(200);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_signals',
        },
        (payload) => {
          // Only refetch if it's not my own signal update
          if (payload.new && (payload.new as { user_id: string }).user_id !== user.id) {
            logger.api.request('active_signals', 'realtime-update');
            fetchNearbyUsers(200);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'active_signals',
        },
        () => {
          logger.api.request('active_signals', 'realtime-delete');
          fetchNearbyUsers(200);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.api.success('active_signals', 'realtime-subscribe');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fetchNearbyUsers]);

  return {
    mySignal,
    nearbyUsers,
    isLoading,
    isDemoMode,
    isActive: !!mySignal,
    activity: mySignal?.activity as ActivityType | null,
    activateSignal,
    deactivateSignal,
    updatePosition,
    extendSignal,
    updateSignalState,
    fetchNearbyUsers,
    fetchMySignal,
    signalType: mySignal?.signal_type as SignalType | null,
  };
}
