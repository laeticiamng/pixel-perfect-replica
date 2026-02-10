import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { translations, getCurrentLocale } from '@/lib/i18n/translations';

export type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';
export type SessionStatus = 'open' | 'full' | 'cancelled' | 'completed';
export type DurationOption = 45 | 90 | 180;

export interface ScheduledSession {
  id: string;
  creator_id: string;
  creator_name?: string;
  creator_avatar?: string;
  creator_reliability?: number;
  scheduled_date: string;
  start_time: string;
  duration_minutes: DurationOption;
  activity: ActivityType;
  city: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  max_participants: number;
  current_participants?: number;
  status: SessionStatus;
  created_at: string;
}

export interface CreateSessionInput {
  scheduled_date: string;
  start_time: string;
  duration_minutes: DurationOption;
  activity: ActivityType;
  city: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  max_participants?: number;
}

export interface SessionFilters {
  city: string;
  activity?: ActivityType;
  date?: string;
  duration?: DurationOption;
}

export function useBinomeSessions() {
  const { user } = useAuth();
  
  const t = (key: string) => {
    const locale = getCurrentLocale();
    const keys = key.split('.');
    let obj: any = translations;
    for (const k of keys) {
      obj = obj?.[k];
    }
    return obj?.[locale] || obj?.en || key;
  };
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);

  const [mySessions, setMySessions] = useState<ScheduledSession[]>([]);
  const [myParticipations, setMyParticipations] = useState<ScheduledSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available sessions with filters (city optional)
  const fetchSessions = useCallback(async (filters: SessionFilters) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let rows: Array<Record<string, unknown>> = [];

      if (filters.city) {
        const { data, error: rpcError } = await supabase.rpc('get_available_sessions', {
          p_city: filters.city,
          p_activity: filters.activity || null,
          p_date: filters.date || null,
          p_duration: filters.duration || null,
        });

        if (rpcError) throw rpcError;
        rows = (data || []) as Array<Record<string, unknown>>;
      } else {
        const nowIso = new Date().toISOString();
        const { data, error: queryError } = await supabase
          .from('scheduled_sessions')
          .select('id, creator_id, scheduled_date, start_time, duration_minutes, activity, city, location_name, note, max_participants, created_at')
          .eq('status', 'open')
          .neq('creator_id', user.id)
          .gte('scheduled_date', nowIso.slice(0, 10))
          .order('scheduled_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(40);

        if (queryError) throw queryError;
        rows = (data || []) as Array<Record<string, unknown>>;
      }

      const creatorIds = Array.from(new Set(rows.map((s) => String(s.creator_id))));
      const [{ data: profiles }, { data: reliability }] = await Promise.all([
        creatorIds.length > 0
          ? supabase.rpc('get_public_profiles', { profile_ids: creatorIds })
          : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
        creatorIds.length > 0
          ? supabase.from('user_reliability').select('user_id, reliability_score').in('user_id', creatorIds)
          : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      ]);

      const formatted: ScheduledSession[] = rows.map((s) => {
        const profile = profiles?.find((p: Record<string, unknown>) => p.id === s.creator_id);
        const rel = reliability?.find((r: Record<string, unknown>) => r.user_id === s.creator_id);

        return {
          id: String(s.id),
          creator_id: String(s.creator_id),
          creator_name: (profile?.first_name as string | undefined) || undefined,
          creator_avatar: (profile?.avatar_url as string | undefined) || undefined,
          creator_reliability: rel?.reliability_score as number | undefined,
          scheduled_date: String(s.scheduled_date),
          start_time: String(s.start_time),
          duration_minutes: s.duration_minutes as DurationOption,
          activity: s.activity as ActivityType,
          city: String(s.city),
          location_name: (s.location_name as string | undefined) || undefined,
          note: (s.note as string | undefined) || undefined,
          max_participants: Number(s.max_participants),
          current_participants: Number((s.current_participants as number | undefined) || 0),
          status: 'open' as SessionStatus,
          created_at: String(s.created_at),
        };
      });

      setSessions(formatted);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Loading error';
      setError(message);
      console.error('[useBinomeSessions] fetchSessions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch my created sessions
  const fetchMySessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error: queryError } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('creator_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (queryError) throw queryError;
      setMySessions(data as ScheduledSession[]);
    } catch (err) {
      console.error('[useBinomeSessions] fetchMySessions error:', err);
    }
  }, [user]);

  // Fetch sessions I joined
  const fetchMyParticipations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: participations, error: pError } = await supabase
        .from('session_participants')
        .select('session_id')
        .eq('user_id', user.id);

      if (pError) throw pError;

      if (participations && participations.length > 0) {
        const sessionIds = participations.map(p => p.session_id);
        
        const { data: sessionsData, error: sError } = await supabase
          .from('scheduled_sessions')
          .select('*')
          .in('id', sessionIds)
          .order('scheduled_date', { ascending: true });

        if (sError) throw sError;
        setMyParticipations(sessionsData as ScheduledSession[]);
      } else {
        setMyParticipations([]);
      }
    } catch (err) {
      console.error('[useBinomeSessions] fetchMyParticipations error:', err);
    }
  }, [user]);

  // Create a new session
  const createSession = async (input: CreateSessionInput): Promise<boolean> => {
    if (!user) {
      toast.error(t('binomeToasts.mustBeLoggedIn'));
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('scheduled_sessions')
        .insert({
          creator_id: user.id,
          scheduled_date: input.scheduled_date,
          start_time: input.start_time,
          duration_minutes: input.duration_minutes,
          activity: input.activity,
          city: input.city,
          location_name: input.location_name || null,
          latitude: input.latitude || null,
          longitude: input.longitude || null,
          note: input.note || null,
          max_participants: input.max_participants || 3
        });

      if (insertError) throw insertError;

      // Update user reliability via secure RPC (increments instead of replacing)
      await supabase.rpc('increment_reliability_sessions_created', { p_user_id: user.id });

      toast.success(t('binomeToasts.sessionCreated'));
      await fetchMySessions();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Creation error';
      toast.error(message);
      console.error('[useBinomeSessions] createSession error:', err);
      return false;
    }
  };

  // Join a session
  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!user) {
      toast.error(t('binomeToasts.mustBeLoggedIn'));
      return false;
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('join_session', {
        p_session_id: sessionId
      });

      if (rpcError) throw rpcError;
      if (!data) throw new Error(t('binomeToasts.joinError'));

      toast.success(t('binomeToasts.joinedSession'));
      await fetchMyParticipations();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      toast.error(message);
      console.error('[useBinomeSessions] joinSession error:', err);
      return false;
    }
  };

  // Leave a session
  const leaveSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error: rpcError } = await supabase.rpc('leave_session', {
        p_session_id: sessionId
      });

      if (rpcError) throw rpcError;
      if (!data) throw new Error(t('binomeToasts.leaveError'));

      toast.success(t('binomeToasts.leftSession'));
      await fetchMyParticipations();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      toast.error(message);
      return false;
    }
  };

  // Cancel a session (creator only)
  const cancelSession = async (sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: updateError } = await supabase
        .from('scheduled_sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId)
        .eq('creator_id', user.id);

      if (updateError) throw updateError;

      toast.success(t('binomeToasts.sessionCancelled'));
      await fetchMySessions();
      return true;
    } catch (err) {
      toast.error(t('binomeToasts.cancelError'));
      return false;
    }
  };

  // Load my sessions on mount
  useEffect(() => {
    if (user) {
      fetchMySessions();
      fetchMyParticipations();
      fetchSessions({ city: '' });
    }
  }, [user, fetchMySessions, fetchMyParticipations, fetchSessions]);

  return {
    sessions,
    mySessions,
    myParticipations,
    isLoading,
    error,
    fetchSessions,
    fetchMySessions,
    fetchMyParticipations,
    createSession,
    joinSession,
    leaveSession,
    cancelSession
  };
}
