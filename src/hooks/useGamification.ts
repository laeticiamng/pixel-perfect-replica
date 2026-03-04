import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ── Achievement definitions ──
export interface AchievementDef {
  key: string;
  icon: string;
  titleKey: string;
  descKey: string;
  threshold?: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_interaction', icon: '👋', titleKey: 'gamification.achFirstMeet', descKey: 'gamification.achFirstMeetDesc' },
  { key: 'met_10', icon: '🤝', titleKey: 'gamification.achMet10', descKey: 'gamification.achMet10Desc', threshold: 10 },
  { key: 'met_50', icon: '🌟', titleKey: 'gamification.achMet50', descKey: 'gamification.achMet50Desc', threshold: 50 },
  { key: 'streak_3', icon: '🔥', titleKey: 'gamification.achStreak3', descKey: 'gamification.achStreak3Desc', threshold: 3 },
  { key: 'streak_5', icon: '⚡', titleKey: 'gamification.achStreak5', descKey: 'gamification.achStreak5Desc', threshold: 5 },
  { key: 'streak_7', icon: '💎', titleKey: 'gamification.achStreak7', descKey: 'gamification.achStreak7Desc', threshold: 7 },
  { key: 'first_event', icon: '🎉', titleKey: 'gamification.achFirstEvent', descKey: 'gamification.achFirstEventDesc' },
  { key: 'first_session', icon: '📅', titleKey: 'gamification.achFirstSession', descKey: 'gamification.achFirstSessionDesc' },
  { key: 'sessions_10', icon: '🏆', titleKey: 'gamification.achSessions10', descKey: 'gamification.achSessions10Desc', threshold: 10 },
  { key: 'hours_10', icon: '⏰', titleKey: 'gamification.achHours10', descKey: 'gamification.achHours10Desc', threshold: 10 },
];

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  week_activity: boolean[];
  total_active_days: number;
}

export interface LeaderboardEntry {
  user_id: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
  interactions: number;
  current_streak: number;
  sessions_completed: number;
  score: number;
}

export function useGamification() {
  const { user, stats } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Fetch streak + achievements
  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const [streakRes, achRes] = await Promise.all([
      supabase.from('user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_achievements').select('achievement_key').eq('user_id', user.id),
    ]);

    if (streakRes.data) {
      const d = streakRes.data as any;
      setStreak({
        current_streak: d.current_streak,
        longest_streak: d.longest_streak,
        last_active_date: d.last_active_date,
        week_activity: Array.isArray(d.week_activity) ? d.week_activity : [false, false, false, false, false, false, false],
        total_active_days: d.total_active_days,
      });
    }

    if (achRes.data) {
      setUnlockedKeys(new Set((achRes.data as any[]).map((a: any) => a.achievement_key)));
    }

    setIsLoading(false);
  }, [user]);

  // Record activity & check achievements
  const recordActivity = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase.rpc('record_daily_activity', { p_user_id: user.id });
    if (data) {
      const result = data as any;
      setStreak(prev => prev ? {
        ...prev,
        current_streak: result.current_streak,
        longest_streak: result.longest_streak,
      } : null);

      // Check for new achievements
      await checkAndUnlockAchievements(result.current_streak);
    }
  }, [user, stats]);

  const checkAndUnlockAchievements = useCallback(async (currentStreak: number) => {
    if (!user || !stats) return;

    const toUnlock: string[] = [];
    const interactions = stats.interactions || 0;
    const hoursActive = stats.hours_active || 0;

    if (interactions >= 1 && !unlockedKeys.has('first_interaction')) toUnlock.push('first_interaction');
    if (interactions >= 10 && !unlockedKeys.has('met_10')) toUnlock.push('met_10');
    if (interactions >= 50 && !unlockedKeys.has('met_50')) toUnlock.push('met_50');
    if (currentStreak >= 3 && !unlockedKeys.has('streak_3')) toUnlock.push('streak_3');
    if (currentStreak >= 5 && !unlockedKeys.has('streak_5')) toUnlock.push('streak_5');
    if (currentStreak >= 7 && !unlockedKeys.has('streak_7')) toUnlock.push('streak_7');
    if (hoursActive >= 10 && !unlockedKeys.has('hours_10')) toUnlock.push('hours_10');

    // Check event participation
    if (!unlockedKeys.has('first_event')) {
      const { count } = await supabase.from('event_participants').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      if (count && count > 0) toUnlock.push('first_event');
    }

    // Check session participation
    if (!unlockedKeys.has('first_session') || !unlockedKeys.has('sessions_10')) {
      const { count } = await supabase.from('session_participants').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      if (count && count > 0 && !unlockedKeys.has('first_session')) toUnlock.push('first_session');
      if (count && count >= 10 && !unlockedKeys.has('sessions_10')) toUnlock.push('sessions_10');
    }

    if (toUnlock.length > 0) {
      const inserts = toUnlock.map(key => ({ user_id: user.id, achievement_key: key }));
      await supabase.from('user_achievements').insert(inserts);
      setUnlockedKeys(prev => {
        const next = new Set(prev);
        toUnlock.forEach(k => next.add(k));
        return next;
      });
    }
  }, [user, stats, unlockedKeys]);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async (university?: string) => {
    setLeaderboardLoading(true);
    const params: any = { p_limit: 20 };
    if (university) params.p_university = university;

    const { data } = await supabase.rpc('get_campus_leaderboard', params);
    if (data) {
      setLeaderboard(data as unknown as LeaderboardEntry[]);
    }
    setLeaderboardLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-record activity on mount (once per session)
  useEffect(() => {
    if (user) {
      recordActivity();
    }
  }, [user?.id]);

  return {
    streak,
    unlockedKeys,
    achievements: ACHIEVEMENTS,
    leaderboard,
    isLoading,
    leaderboardLoading,
    recordActivity,
    fetchLeaderboard,
    refetch: fetchData,
  };
}
