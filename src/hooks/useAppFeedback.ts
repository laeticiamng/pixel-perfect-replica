import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeDbText } from '@/lib/sanitize';
import { logger } from '@/lib/logger';

export function useAppFeedback() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const submitFeedback = async (rating: number, message?: string) => {
    if (!user) {
      logger.api.error('app_feedback', 'INSERT', 'User not authenticated');
      return { error: new Error('Not authenticated') };
    }

    if (rating < 1 || rating > 5) {
      return { error: new Error('Rating must be between 1 and 5') };
    }

    setIsLoading(true);

    // Sanitize the message
    const sanitizedMessage = message ? sanitizeDbText(message, 500) : null;

    const { data, error } = await supabase
      .from('app_feedback')
      .insert({
        user_id: user.id,
        rating,
        message: sanitizedMessage,
      })
      .select()
      .single();

    setIsLoading(false);

    if (error) {
      logger.api.error('app_feedback', 'INSERT', error.message);
      return { error };
    }

    logger.action.feedbackGiven(user.id, data.id, rating >= 4);
    return { data, error: null };
  };

  return {
    submitFeedback,
    isLoading,
  };
}
