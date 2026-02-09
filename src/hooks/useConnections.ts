import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type ActivityType = Database["public"]["Enums"]["activity_type"];
type ConnectionStatus = Database["public"]["Enums"]["connection_status"];

interface Connection {
  id: string;
  user_a: string;
  user_b: string;
  signal_id: string | null;
  activity: ActivityType;
  status: ConnectionStatus;
  initiated_by: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConnections((data as Connection[]) || []);
    } catch (error) {
      console.error('[useConnections] Error fetching connections:', error);
    }
  }, [user]);

  const getPendingRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .eq('status', 'pending')
        .neq('initiated_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests((data as Connection[]) || []);
    } catch (error) {
      console.error('[useConnections] Error fetching pending requests:', error);
    }
  }, [user]);

  const refreshConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([getMyConnections(), getPendingRequests()]);
    } finally {
      setIsLoading(false);
    }
  }, [getMyConnections, getPendingRequests]);

  const requestConnection = useCallback(
    async (targetUserId: string, signalId: string | null, activity: ActivityType) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      // Enforce canonical ordering: user_a < user_b
      const [userA, userB] =
        user.id < targetUserId
          ? [user.id, targetUserId]
          : [targetUserId, user.id];

      try {
        const { data, error } = await supabase
          .from('connections')
          .insert({
            user_a: userA,
            user_b: userB,
            signal_id: signalId,
            activity,
            status: 'pending' as ConnectionStatus,
            initiated_by: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as Connection };
      } catch (error) {
        console.error('[useConnections] Error requesting connection:', error);
        return { success: false, error };
      }
    },
    [user]
  );

  const acceptConnection = useCallback(
    async (connectionId: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      try {
        const { data, error } = await supabase
          .from('connections')
          .update({
            status: 'accepted' as ConnectionStatus,
            accepted_at: new Date().toISOString(),
          })
          .eq('id', connectionId)
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as Connection };
      } catch (error) {
        console.error('[useConnections] Error accepting connection:', error);
        return { success: false, error };
      }
    },
    [user]
  );

  const declineConnection = useCallback(
    async (connectionId: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };

      try {
        const { data, error } = await supabase
          .from('connections')
          .update({
            status: 'declined' as ConnectionStatus,
          })
          .eq('id', connectionId)
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: data as Connection };
      } catch (error) {
        console.error('[useConnections] Error declining connection:', error);
        return { success: false, error };
      }
    },
    [user]
  );

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!user) {
      setConnections([]);
      setPendingRequests([]);
      setIsLoading(false);
      return;
    }

    refreshConnections();

    // Subscribe to all changes on the connections table where the current user
    // is either user_a or user_b. Supabase Realtime filter only supports a
    // single equality filter per subscription, so we create two channels.
    const channelA = supabase
      .channel(`connections-user-a-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_a=eq.${user.id}`,
        },
        () => {
          refreshConnections();
        }
      )
      .subscribe();

    const channelB = supabase
      .channel(`connections-user-b-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `user_b=eq.${user.id}`,
        },
        () => {
          refreshConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelA);
      supabase.removeChannel(channelB);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    connections,
    pendingRequests,
    isLoading,
    requestConnection,
    acceptConnection,
    declineConnection,
    refreshConnections,
  };
}
