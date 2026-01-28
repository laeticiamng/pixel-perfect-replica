import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { logger } from '@/lib/logger';

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
  const { position } = useLocationStore();
  const [mySignal, setMySignal] = useState<ActiveSignal | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch my current signal
  const fetchMySignal = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('active_signals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching signal:', error);
      return;
    }

    setMySignal(data);
  }, [user]);

  // Activate signal
  const activateSignal = async (activity: ActivityType, signalType: SignalType = 'green') => {
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
      // Insert new
      const { data, error } = await supabase
        .from('active_signals')
        .insert({
          user_id: user.id,
          signal_type: signalType,
          activity: activity,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy || null,
        })
        .select()
        .single();

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

  // Fetch nearby users with signals
  const fetchNearbyUsers = useCallback(async (maxDistance: number = 200) => {
    if (!user || !position) return;

    // Get all active signals except current user
    const { data: signals, error } = await supabase
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

    if (error) {
      console.error('Error fetching nearby signals:', error);
      return;
    }

    if (!signals || signals.length === 0) {
      setNearbyUsers([]);
      return;
    }

    // Get profiles for these users
    const userIds = signals.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name')
      .in('id', userIds);

    const { data: statsData } = await supabase
      .from('user_stats')
      .select('user_id, rating')
      .in('user_id', userIds);

    // Calculate distances and combine data
    const nearby: NearbyUser[] = signals
      .map(signal => {
        const profile = profiles?.find(p => p.id === signal.user_id);
        const stats = statsData?.find(s => s.user_id === signal.user_id);
        
        const distance = calculateDistance(
          position.latitude,
          position.longitude,
          Number(signal.latitude),
          Number(signal.longitude)
        );

        return {
          id: signal.user_id,
          firstName: profile?.first_name || 'Anonyme',
          signal: signal.signal_type as SignalType,
          activity: signal.activity as ActivityType,
          distance,
          activeSince: new Date(signal.started_at),
          rating: stats?.rating ? Number(stats.rating) : 5.0,
          position: {
            latitude: Number(signal.latitude),
            longitude: Number(signal.longitude),
          },
        };
      })
      .filter(u => u.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    setNearbyUsers(nearby);
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

  return {
    mySignal,
    nearbyUsers,
    isLoading,
    isActive: !!mySignal,
    activity: mySignal?.activity as ActivityType | null,
    activateSignal,
    deactivateSignal,
    updatePosition,
    fetchNearbyUsers,
    fetchMySignal,
  };
}
