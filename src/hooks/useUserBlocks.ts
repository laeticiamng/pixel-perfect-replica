import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';


interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  reason: string | null;
}

export function useUserBlocks() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<UserBlock[]>([]);

  // Block a user
  const blockUser = async (blockedId: string, reason?: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    if (user.id === blockedId) return { error: new Error('Cannot block yourself') };

    setIsLoading(true);

    const { data, error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: blockedId,
        reason: reason || null,
      })
      .select()
      .single();

    setIsLoading(false);

    if (!error && data) {
      setBlocks(prev => [...prev, data]);
      console.log('[ACTION] User blocked:', blockedId);
    }

    return { data, error };
  };

  // Unblock a user
  const unblockUser = async (blockedId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);

    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', blockedId);

    setIsLoading(false);

    if (!error) {
      setBlocks(prev => prev.filter(b => b.blocked_id !== blockedId));
      console.log('[ACTION] User unblocked:', blockedId);
    }

    return { error };
  };

  // Check if a user is blocked
  const isBlocked = useCallback((userId: string) => {
    return blocks.some(b => b.blocked_id === userId);
  }, [blocks]);

  // Fetch all blocked users
  const fetchBlocks = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBlocks(data);
    }
  }, [user]);

  return {
    blocks,
    isLoading,
    blockUser,
    unblockUser,
    isBlocked,
    fetchBlocks,
  };
}
