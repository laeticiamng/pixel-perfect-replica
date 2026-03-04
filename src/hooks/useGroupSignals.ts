import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { ActivityType } from '@/types/signal';
import { logger } from '@/lib/logger';

export interface GroupSignal {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  activity: ActivityType;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  location_description: string | null;
  max_participants: number;
  current_members: number;
  started_at: string;
  expires_at: string;
  status: string;
  member_names: string[];
  is_member: boolean;
}

interface CreateGroupSignalParams {
  activity: ActivityType;
  title: string;
  description?: string;
  maxParticipants: number;
  locationDescription?: string;
}

export function useGroupSignals() {
  const { user } = useAuth();
  const { position } = useLocationStore();
  const [groupSignals, setGroupSignals] = useState<GroupSignal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myGroupSignal, setMyGroupSignal] = useState<GroupSignal | null>(null);

  const fetchGroupSignals = useCallback(async (maxDistance = 1000) => {
    if (!user || !position) return;

    try {
      const { data, error } = await supabase.rpc('get_nearby_group_signals', {
        user_lat: position.latitude,
        user_lon: position.longitude,
        max_distance_meters: maxDistance,
      });

      if (error) throw error;

      const signals = (data as unknown as GroupSignal[]) || [];
      setGroupSignals(signals);
      setMyGroupSignal(signals.find(s => s.creator_id === user.id) || null);
    } catch (err) {
      logger.api.error('group_signals', 'fetch', String(err));
    }
  }, [user, position]);

  const createGroupSignal = async (params: CreateGroupSignalParams) => {
    if (!user || !position) return { error: new Error('Missing user or position') };

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_signals')
        .insert({
          creator_id: user.id,
          activity: params.activity,
          title: params.title,
          description: params.description || null,
          latitude: position.latitude,
          longitude: position.longitude,
          location_description: params.locationDescription || null,
          max_participants: params.maxParticipants,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchGroupSignals();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroupSignal = async (groupSignalId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('join_group_signal', {
        p_group_signal_id: groupSignalId,
      });
      if (error) throw error;
      await fetchGroupSignals();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const leaveGroupSignal = async (groupSignalId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('leave_group_signal', {
        p_group_signal_id: groupSignalId,
      });
      if (error) throw error;
      await fetchGroupSignals();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const endGroupSignal = async (groupSignalId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('group_signals')
        .update({ status: 'ended' })
        .eq('id', groupSignalId)
        .eq('creator_id', user.id);
      if (error) throw error;
      await fetchGroupSignals();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!user || !position) return;

    fetchGroupSignals();

    const channel = supabase
      .channel('group-signals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_signal_members' }, () => {
        fetchGroupSignals();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, position?.latitude, position?.longitude, fetchGroupSignals]);

  return {
    groupSignals,
    myGroupSignal,
    isLoading,
    createGroupSignal,
    joinGroupSignal,
    leaveGroupSignal,
    endGroupSignal,
    fetchGroupSignals,
  };
}
