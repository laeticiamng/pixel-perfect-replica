import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Lightweight hook that only tracks total unread message count
 * for navigation badges. Uses RPC for efficiency.
 */
export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .rpc('get_total_unread_messages', { p_user_id: user.id });
    
    if (!error && data !== null) {
      setUnreadCount(Number(data));
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Refresh on new messages via realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // Only increment if message is from someone else
          const msg = payload.new as any;
          if (msg.sender_id !== user.id) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { unreadCount, refetch: fetchCount };
}
