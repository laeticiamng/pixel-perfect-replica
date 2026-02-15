import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';

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

// Typed interfaces for Supabase responses (fixes PF-01: no more `any`)
interface ProfileRecord {
  id: string;
  first_name?: string;
  avatar_url?: string | null;
}

interface ReliabilityRecord {
  user_id: string;
  reliability_score: number;
}

interface SessionRow {
  id: string;
  creator_id: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  activity: string;
  city: string;
  location_name?: string | null;
  note?: string | null;
  max_participants: number;
  current_participants?: number;
  created_at: string;
  status?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function useBinomeSessions() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [mySessions, setMySessions] = useState<ScheduledSession[]>([]);
  const [myParticipations, setMyParticipations] = useState<ScheduledSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available sessions with filters (city required for RPC, fallback for no city)
  const fetchSessions = useCallback(async (filters: SessionFilters) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let rows: SessionRow[] = [];

      if (filters.city) {
        const { data, error: rpcError } = await supabase.rpc('get_available_sessions', {
          p_city: filters.city,
          p_activity: filters.activity || undefined,
          p_date: filters.date || undefined,
          p_duration: filters.duration || undefined,
        });

        if (rpcError) throw rpcError;
        rows = (data || []).map(d => ({ ...d, created_at: '', status: 'open' })) as SessionRow[];
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
        rows = (data || []) as SessionRow[];
      }

      const creatorIds = Array.from(new Set(rows.map((s) => s.creator_id)));
      const [{ data: profiles }, { data: reliability }] = await Promise.all([
        creatorIds.length > 0
          ? supabase.rpc('get_public_profiles', { profile_ids: creatorIds })
          : Promise.resolve({ data: [] as ProfileRecord[] }),
        creatorIds.length > 0
          ? supabase.from('user_reliability').select('user_id, reliability_score').in('user_id', creatorIds)
          : Promise.resolve({ data: [] as ReliabilityRecord[] }),
      ]);

      const typedProfiles = (profiles || []) as ProfileRecord[];
      const typedReliability = (reliability || []) as ReliabilityRecord[];

      const formatted: ScheduledSession[] = rows.map((s) => {
        const profile = typedProfiles.find((p) => p.id === s.creator_id);
        const rel = typedReliability.find((r) => r.user_id === s.creator_id);

        return {
          id: s.id,
          creator_id: s.creator_id,
          creator_name: profile?.first_name || undefined,
          creator_avatar: profile?.avatar_url || undefined,
          creator_reliability: rel?.reliability_score,
          scheduled_date: s.scheduled_date,
          start_time: s.start_time,
          duration_minutes: s.duration_minutes as DurationOption,
          activity: s.activity as ActivityType,
          city: s.city,
          location_name: s.location_name || undefined,
          note: s.note || undefined,
          max_participants: Number(s.max_participants),
          current_participants: Number(s.current_participants || 0),
          status: 'open' as SessionStatus,
          created_at: s.created_at,
        };
      });

      setSessions(formatted);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('binome.loadError');
      setError(message);
      console.error('[useBinomeSessions] fetchSessions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

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

      const sessions: ScheduledSession[] = (data || []).map((row) => ({
        id: row.id,
        creator_id: row.creator_id,
        scheduled_date: row.scheduled_date,
        start_time: row.start_time,
        duration_minutes: row.duration_minutes as DurationOption,
        activity: row.activity as ActivityType,
        city: row.city,
        location_name: row.location_name || undefined,
        latitude: row.latitude ? Number(row.latitude) : undefined,
        longitude: row.longitude ? Number(row.longitude) : undefined,
        note: row.note || undefined,
        max_participants: row.max_participants,
        status: row.status as SessionStatus,
        created_at: row.created_at,
      }));
      setMySessions(sessions);
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

        const sessions: ScheduledSession[] = (sessionsData || []).map((row) => ({
          id: row.id,
          creator_id: row.creator_id,
          scheduled_date: row.scheduled_date,
          start_time: row.start_time,
          duration_minutes: row.duration_minutes as DurationOption,
          activity: row.activity as ActivityType,
          city: row.city,
          location_name: row.location_name || undefined,
          latitude: row.latitude ? Number(row.latitude) : undefined,
          longitude: row.longitude ? Number(row.longitude) : undefined,
          note: row.note || undefined,
          max_participants: row.max_participants,
          status: row.status as SessionStatus,
          created_at: row.created_at,
        }));
        setMyParticipations(sessions);
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
      toast.error(t('binome.mustBeConnected'));
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

      toast.success(t('binome.slotCreated'));
      await fetchMySessions();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : t('binome.cancelError');
      toast.error(message);
      console.error('[useBinomeSessions] createSession error:', err);
      return false;
    }
  };

  // Join a session
  const joinSession = async (sessionId: string): Promise<boolean> => {
    if (!user) {
      toast.error(t('binome.mustBeConnected'));
      return false;
    }

    try {
      const { data, error: rpcError } = await supabase.rpc('join_session', {
        p_session_id: sessionId
      });

      if (rpcError) throw rpcError;
      if (!data) throw new Error(t('binome.joinError'));

      toast.success(t('binome.joinedSession'));
      await fetchMyParticipations();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : t('binome.joinError');
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
      if (!data) throw new Error(t('binome.leaveError'));

      toast.success(t('binome.leftSession'));
      await fetchMyParticipations();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : t('binome.leaveError');
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

      toast.success(t('binome.sessionCancelled'));
      await fetchMySessions();
      return true;
    } catch (err) {
      toast.error(t('binome.cancelError'));
      return false;
    }
  };

  // Load my sessions on mount (removed unnecessary fetchSessions with empty city)
  useEffect(() => {
    if (user) {
      fetchMySessions();
      fetchMyParticipations();
    }
  }, [user, fetchMySessions, fetchMyParticipations]);

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
