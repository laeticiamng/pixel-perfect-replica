import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// The `connections` table does not exist in the current database schema.
// This hook provides a stub implementation until the table is created.

type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';
type ConnectionStatus = 'pending' | 'accepted' | 'declined';

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
  const [isLoading, setIsLoading] = useState(false);

  const refreshConnections = useCallback(async () => {
    // No-op: connections table not yet created
    setIsLoading(false);
  }, []);

  const requestConnection = useCallback(
    async (_targetUserId: string, _signalId: string | null, _activity: ActivityType) => {
      if (!user) return { success: false, error: 'Not authenticated' };
      console.warn('[useConnections] connections table not yet created');
      return { success: false, error: 'Feature not yet available' };
    },
    [user]
  );

  const acceptConnection = useCallback(
    async (_connectionId: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };
      return { success: false, error: 'Feature not yet available' };
    },
    [user]
  );

  const declineConnection = useCallback(
    async (_connectionId: string) => {
      if (!user) return { success: false, error: 'Not authenticated' };
      return { success: false, error: 'Feature not yet available' };
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      setConnections([]);
      setPendingRequests([]);
    }
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
