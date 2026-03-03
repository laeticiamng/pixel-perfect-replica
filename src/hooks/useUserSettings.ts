import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface UserSettings {
  ghost_mode: boolean;
  visibility_distance: number;
  push_notifications: boolean;
  sound_notifications: boolean;
  proximity_vibration: boolean;
}

const defaultSettings: UserSettings = {
  ghost_mode: false,
  visibility_distance: 200,
  push_notifications: true,
  sound_notifications: true,
  proximity_vibration: true,
};

const SETTINGS_CACHE_TTL = 60_000; // 60s dedup window

export function useUserSettings() {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const lastFetchedAt = useRef<number>(0);
  const fetchInFlight = useRef(false);

  // Fetch settings with dedup
  const fetchSettings = useCallback(async (force = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    if (!force && (fetchInFlight.current || now - lastFetchedAt.current < SETTINGS_CACHE_TTL)) {
      setIsLoading(false);
      return;
    }

    fetchInFlight.current = true;

    const { data, error } = await supabase
      .from('user_settings')
      .select('ghost_mode, visibility_distance, push_notifications, sound_notifications, proximity_vibration')
      .eq('user_id', user.id)
      .maybeSingle();

    fetchInFlight.current = false;
    lastFetchedAt.current = Date.now();

    if (error) {
      logger.api.error('user_settings', 'fetch', String(error));
      setIsLoading(false);
      return;
    }

    if (data) {
      setSettings(data);
    }
    setIsLoading(false);
  }, [user]);

  // Update settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!error && data) {
      setSettings(prev => ({ ...prev, ...updates }));
      lastFetchedAt.current = Date.now(); // refresh cache timestamp
    }

    return { data, error };
  };

  // Convenience methods
  const setGhostMode = (value: boolean) => updateSettings({ ghost_mode: value });
  const setVisibilityDistance = (value: number) => updateSettings({ visibility_distance: value });
  const setPushNotifications = (value: boolean) => updateSettings({ push_notifications: value });
  const setSoundNotifications = (value: boolean) => updateSettings({ sound_notifications: value });
  const setProximityVibration = (value: boolean) => updateSettings({ proximity_vibration: value });

  const resetSettings = async () => {
    return updateSettings(defaultSettings);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  return {
    settings,
    isLoading,
    updateSettings,
    setGhostMode,
    setVisibilityDistance,
    setPushNotifications,
    setSoundNotifications,
    setProximityVibration,
    resetSettings,
    fetchSettings: () => fetchSettings(true),
  };
}
