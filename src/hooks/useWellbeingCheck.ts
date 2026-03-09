import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const WELLBEING_DISMISSED_KEY = 'nearvity_wellbeing_dismissed';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useWellbeingCheck() {
  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkIfDue = async () => {
      // Check localStorage for recent dismissal
      const dismissed = localStorage.getItem(WELLBEING_DISMISSED_KEY);
      if (dismissed && Date.now() - Number(dismissed) < WEEK_MS) return;

      // Check DB for last check
      const { data } = await supabase
        .from('wellbeing_checks')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const lastCheck = new Date(data[0].created_at).getTime();
        if (Date.now() - lastCheck < WEEK_MS) return;
      }

      // Show after a delay so it doesn't interrupt immediately
      setTimeout(() => setShouldShow(true), 10000);
    };

    checkIfDue();
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(WELLBEING_DISMISSED_KEY, String(Date.now()));
    setShouldShow(false);
  };

  return { shouldShow, dismiss };
}
