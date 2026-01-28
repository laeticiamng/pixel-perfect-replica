import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reason: string;
  description: string | null;
  created_at: string;
}

export function useReports() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Create a new report
  const createReport = async (
    reason: string,
    description?: string,
    reportedUserId?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    setIsLoading(true);

    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        reason,
        description: description || null,
      })
      .select()
      .single();

    setIsLoading(false);
    return { data: data as Report | null, error };
  };

  // Get my reports
  const getMyReports = async () => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: false });

    return { data: data as Report[] | null, error };
  };

  return {
    createReport,
    getMyReports,
    isLoading,
  };
}
