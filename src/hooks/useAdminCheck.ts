import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export function useAdminCheck() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .rpc('has_role', { _user_id: user.id, _role: 'admin' });
        
        setIsAdmin(data === true);
      } catch (error) {
        logger.api.error('profiles', 'admin-check', String(error));
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, isLoading };
}
