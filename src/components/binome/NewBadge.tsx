import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  const { user } = useAuth();
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const checkUserSessions = async () => {
      if (!user) {
        setShowBadge(false);
        return;
      }

      try {
        // Check if user has created any sessions
        const { data, error } = await supabase
          .from('scheduled_sessions')
          .select('id')
          .eq('creator_id', user.id)
          .limit(1);

        if (error) {
          logger.api.error('scheduled_sessions', 'check-new', String(error));
          return;
        }

        // Show badge if no sessions created yet
        setShowBadge(!data || data.length === 0);
      } catch (err) {
        logger.api.error('scheduled_sessions', 'check-new', String(err));
      }
    };

    checkUserSessions();
  }, [user]);

  if (!showBadge) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-coral rounded-full shadow-sm ${className}`}
      >
        New
      </motion.span>
    </AnimatePresence>
  );
}

// Hook to check if user should see the badge
export function useShowNewBadge() {
  const { user } = useAuth();
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const checkUserSessions = async () => {
      if (!user) {
        setShowBadge(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('scheduled_sessions')
          .select('id')
          .eq('creator_id', user.id)
          .limit(1);

        if (error) {
          logger.api.error('scheduled_sessions', 'check-new', String(error));
          return;
        }

        setShowBadge(!data || data.length === 0);
      } catch (err) {
        logger.api.error('scheduled_sessions', 'check-new', String(err));
      }
    };

    checkUserSessions();
  }, [user]);

  return showBadge;
}
