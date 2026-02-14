import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ACTIVITIES } from '@/types/signal';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { calculateDistance } from '@/utils/distance';

interface CompatibleSignal {
  userId: string;
  firstName: string;
  activity: string;
  distance: number;
}

interface UseSignalMatchingProps {
  isActive: boolean;
  myActivity: string | null;
  onMatch?: (match: CompatibleSignal) => void;
}

/**
 * Hook that detects when a nearby user activates a signal
 * with a compatible activity and notifies the current user.
 * Implements the "matching notification" system.
 */
export function useSignalMatching({ isActive, myActivity, onMatch }: UseSignalMatchingProps) {
  const { user } = useAuth();
  const { position } = useLocationStore();
  const { settings } = useUserSettings();
  const { t } = useTranslation();
  const notifiedMatchesRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const isCompatibleActivity = useCallback((theirActivity: string, mine: string | null): boolean => {
    if (!mine) return false;
    // Same activity is always compatible
    if (theirActivity === mine) return true;
    // Define compatible activity pairs
    const compatiblePairs: Record<string, string[]> = {
      studying: ['working'],
      working: ['studying'],
      eating: ['talking'],
      talking: ['eating'],
      sport: ['sport'],
      other: ['other'],
    };
    return compatiblePairs[mine]?.includes(theirActivity) ?? false;
  }, []);

  const handleSignalChange = useCallback(async (payload: any) => {
    if (!user || !position || !isActive || !myActivity) return;

    const signal = payload.new;
    if (signal.user_id === user.id) return;

    // Already notified about this match
    const matchKey = `${signal.user_id}:${signal.activity}`;
    if (notifiedMatchesRef.current.has(matchKey)) return;

    // Check activity compatibility
    if (!isCompatibleActivity(signal.activity, myActivity)) return;

    // Check distance
    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      Number(signal.latitude),
      Number(signal.longitude)
    );

    if (distance > settings.visibility_distance) return;

    // Check ghost mode
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('ghost_mode')
      .eq('user_id', signal.user_id)
      .maybeSingle();

    if (userSettings?.ghost_mode) return;

    // Check blocks
    const { data: blocked } = await supabase
      .rpc('is_user_blocked', { p_user_id: user.id, p_target_id: signal.user_id });

    if (blocked) return;

    // Get profile
    const { data: profiles } = await supabase
      .rpc('get_public_profiles', { profile_ids: [signal.user_id] });

    const profile = profiles?.[0];
    const firstName = profile?.first_name || 'Quelqu\'un';
    const activityData = ACTIVITIES.find(a => a.id === signal.activity);

    notifiedMatchesRef.current.add(matchKey);

    // Vibrate
    if (settings.proximity_vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Show match toast
    const activityLabel = activityData?.emoji || '';
    toast(
      `${activityLabel} ${firstName} ${t('matching.compatibleNearby')} (${distance}m)`,
      {
        icon: '✨',
        duration: 8000,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '2px solid hsl(var(--signal-green))',
        },
      }
    );

    // Native notification
    if (settings.push_notifications && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(t('matching.matchFound'), {
          body: `${firstName} ${t('matching.compatibleNearby')} - ${activityData?.label || signal.activity}`,
          icon: '/pwa-192x192.png',
          tag: 'signal-match',
        });
      } catch {
        // Native notification not available
      }
    }

    onMatch?.({ userId: signal.user_id, firstName, activity: signal.activity, distance });
  }, [user, position, isActive, myActivity, settings, isCompatibleActivity, onMatch, t]);

  useEffect(() => {
    if (!isActive || !user || !myActivity) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase
      .channel('signal-matching')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'active_signals' }, handleSignalChange)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'active_signals' }, handleSignalChange)
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isActive, user, myActivity, handleSignalChange]);

  // Clear matches on deactivation
  useEffect(() => {
    if (!isActive) {
      notifiedMatchesRef.current.clear();
    }
  }, [isActive]);

  return { clearMatches: () => notifiedMatchesRef.current.clear() };
}
