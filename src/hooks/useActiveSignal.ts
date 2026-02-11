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

  // Fetch my current signal (graceful on Supabase errors)
  const fetchMySignal = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_signals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[useActiveSignal] Error fetching my signal:', error.message);
        return;
      }

      setMySignal(data);
    } catch (err) {
      console.warn('[useActiveSignal] fetchMySignal failed:', err);
    }
  }, [user]);

  // Create a local-only signal (used when Supabase is unreachable)
  const createLocalSignal = (activity: ActivityType, signalType: SignalType = 'green'): ActiveSignal => ({
    id: `local-${Date.now()}`,
    user_id: user!.id,
    signal_type: signalType,
    activity,
    latitude: position!.latitude,
    longitude: position!.longitude,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });

  // Activate signal (with rate limiting: max 10 new signals per hour)
  // Falls back to local-only signal if Supabase tables are unreachable
  const activateSignal = async (activity: ActivityType, signalType: SignalType = 'green', locationDescription?: string) => {
    if (!user || !position) return { error: new Error('Missing user or position') };

    setIsLoading(true);

    try {
      // First try to update existing signal
      const { data: existingData } = await supabase
        .from('active_signals')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingData) {
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
        } else if (error) {
          // Update failed — fall back to local signal
          const local = createLocalSignal(activity, signalType);
          setMySignal(local);
          loadDemoUsers();
        }
        return { data, error };
      } else {
        // Check rate limit (non-critical, skip on error)
        const { data: rateLimitOk } = await supabase
          .rpc('check_signal_rate_limit', { p_user_id: user.id })
          .catch(() => ({ data: true }));

        if (rateLimitOk === false) {
          setIsLoading(false);
          return { data: null, error: new Error('Rate limit exceeded: max 10 signals per hour') };
        }

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

        if (!error && data) {
          await supabase.from('signal_rate_limits').insert({ user_id: user.id }).catch(() => {});
          setMySignal(data);
          logger.action.signalActivated(user.id, activity);
        } else if (error) {
          // Insert failed — fall back to local signal
          const local = createLocalSignal(activity, signalType);
          setMySignal(local);
          loadDemoUsers();
        }

        setIsLoading(false);
        return { data, error };
      }
    } catch (err) {
      // Supabase completely unreachable — local-only signal
      console.warn('[useActiveSignal] Supabase unreachable, using local signal');
      const local = createLocalSignal(activity, signalType);
      setMySignal(local);
      loadDemoUsers();
      setIsLoading(false);
      return { data: local, error: null };
    }
  };

  // Load demo users around current position
  const loadDemoUsers = () => {
    if (!position) return;
    const mockUsers = generateMockUsers(position.latitude, position.longitude, 8);
    const mocksWithDistance = mockUsers.map(u => ({
      ...u,
      distance: calculateDistance(position.latitude, position.longitude, u.position.latitude, u.position.longitude),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setNearbyUsers(mocksWithDistance);
    setIsDemoMode(true);
  };

  // Deactivate signal (handles both real and local signals)
  const deactivateSignal = async () => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);

    // Local signal — just clear state
    if (mySignal?.id.startsWith('local-')) {
      setMySignal(null);
      setNearbyUsers([]);
      setIsDemoMode(false);
      setIsLoading(false);
      return { error: null };
    }

    try {
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
    } catch {
      // Supabase unreachable — just clear local state
      setMySignal(null);
      setIsLoading(false);
      return { error: null };
    }
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

    // Local signal — update in place
    if (mySignal.id.startsWith('local-')) {
      setMySignal({ ...mySignal, expires_at: newExpiry });
      return { data: { ...mySignal, expires_at: newExpiry }, error: null };
    }

    try {
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
    } catch {
      setMySignal({ ...mySignal, expires_at: newExpiry });
      return { data: { ...mySignal, expires_at: newExpiry }, error: null };
    }
  };

  // Update active signal state (green/yellow/red) — 1-tap cycle
  const updateSignalState = async (signalType: SignalType) => {
    if (!user || !mySignal) return { error: new Error('No active signal') };

    // Local signal — update in place
    if (mySignal.id.startsWith('local-')) {
      const updated = { ...mySignal, signal_type: signalType };
      setMySignal(updated);
      return { data: updated, error: null };
    }

    try {
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
    } catch {
      const updated = { ...mySignal, signal_type: signalType };
      setMySignal(updated);
      return { data: updated, error: null };
    }
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
        console.warn('[useActiveSignal] Fallback query error:', fallbackError.message);
        // Table doesn't exist or query failed — show demo users
        loadDemoUsers();
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
      console.warn('[useActiveSignal] fetchNearbyUsers failed:', err);
      // Any unhandled error — show demo users rather than empty state
      loadDemoUsers();
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

  // Update position when it changes
  useEffect(() => {
    if (mySignal && position) {
      updatePosition();
    }
  }, [position]);

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
          console.log('[Realtime] New signal activated nearby');
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
            console.log('[Realtime] Signal updated nearby');
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
          console.log('[Realtime] Signal deactivated nearby');
          fetchNearbyUsers(200);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Connected to active_signals');
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
