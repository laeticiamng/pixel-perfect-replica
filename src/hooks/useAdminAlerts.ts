import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from './useAdminCheck';

interface AlertPreferences {
  id?: string;
  user_id: string;
  email: string;
  alert_new_user: boolean;
  alert_high_reports: boolean;
  alert_error_spike: boolean;
}

interface AlertLog {
  id: string;
  alert_type: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  metadata: Record<string, unknown>;
}

export function useAdminAlerts() {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user || !isAdmin) return;

    const { data, error } = await supabase
      .from('admin_alert_preferences' as any)
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching alert preferences:', error);
      return;
    }

    setPreferences(data as unknown as AlertPreferences | null);
    setIsLoading(false);
  }, [user, isAdmin]);

  // Create or update preferences
  const savePreferences = async (prefs: Partial<AlertPreferences>) => {
    if (!user || !isAdmin) return { error: new Error('Not authorized') };

    const payload = {
      user_id: user.id,
      email: prefs.email || user.email,
      alert_new_user: prefs.alert_new_user ?? true,
      alert_high_reports: prefs.alert_high_reports ?? true,
      alert_error_spike: prefs.alert_error_spike ?? true,
    };

    const { data, error } = await supabase
      .from('admin_alert_preferences' as any)
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (!error && data) {
      setPreferences(data as unknown as AlertPreferences);
    }

    return { data, error };
  };

  // Fetch alert logs
  const fetchAlertLogs = useCallback(async (limit = 50) => {
    if (!isAdmin) return;

    const { data, error } = await supabase
      .from('alert_logs' as any)
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching alert logs:', error);
      return;
    }

    setAlertLogs((data || []) as unknown as AlertLog[]);
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchPreferences();
      fetchAlertLogs();
    }
  }, [isAdmin, fetchPreferences, fetchAlertLogs]);

  return {
    preferences,
    alertLogs,
    isLoading,
    savePreferences,
    fetchPreferences,
    fetchAlertLogs,
  };
}
