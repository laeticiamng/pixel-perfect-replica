import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  starts_at: string;
  ends_at: string;
  qr_code_secret?: string; // Only visible to organizers
  max_participants: number;
  is_active: boolean;
  created_at: string;
}

interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  checked_in: boolean;
  checked_in_at: string | null;
}

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all active events using secure function (excludes qr_code_secret)
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    
    const { data } = await supabase.rpc('get_events_public');

    // Sort by starts_at ascending
    const sortedEvents = (data || []).sort((a: Event, b: Event) => 
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );

    setEvents(sortedEvents);
    setIsLoading(false);
  }, []);

  // Fetch events I organize
  const fetchMyEvents = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', user.id)
      .order('starts_at', { ascending: false });

    setMyEvents(data || []);
  }, [user]);

  // Fetch events I've joined
  const fetchJoinedEvents = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('event_participants')
      .select('*')
      .eq('user_id', user.id);

    setJoinedEvents(data || []);
  }, [user]);

  useEffect(() => {
    fetchEvents();
    fetchMyEvents();
    fetchJoinedEvents();
  }, [fetchEvents, fetchMyEvents, fetchJoinedEvents]);

  // Create a new event
  const createEvent = async (eventData: {
    name: string;
    description?: string;
    location_name: string;
    latitude: number;
    longitude: number;
    starts_at: Date;
    ends_at: Date;
    max_participants?: number;
  }) => {
    if (!user) return { error: new Error('Non connecté') };

    const { data, error } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        name: eventData.name,
        description: eventData.description || null,
        location_name: eventData.location_name,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        starts_at: eventData.starts_at.toISOString(),
        ends_at: eventData.ends_at.toISOString(),
        max_participants: eventData.max_participants || 100,
      })
      .select()
      .single();

    if (!error) {
      await fetchMyEvents();
    }

    return { data, error };
  };

  // Join an event
  const joinEvent = async (eventId: string) => {
    if (!user) return { error: new Error('Non connecté') };

    const { data, error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error) {
      await fetchJoinedEvents();
    }

    return { data, error };
  };

  // Leave an event
  const leaveEvent = async (eventId: string) => {
    if (!user) return { error: new Error('Non connecté') };

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchJoinedEvents();
    }

    return { error };
  };

  // Check in to event via QR code (uses secure RPC - never exposes qr_code_secret)
  const checkInToEvent = async (eventId: string, qrSecret: string) => {
    if (!user) return { error: new Error('Non connecté') };

    const { data: success, error } = await supabase
      .rpc('check_in_event_by_qr', { p_event_id: eventId, p_qr_secret: qrSecret });

    if (error) return { error };
    if (!success) return { error: new Error('QR code invalide') };

    await fetchJoinedEvents();
    return { error: null };
  };

  // Check if user is participating in an event
  const isParticipating = (eventId: string): boolean => {
    return joinedEvents.some(p => p.event_id === eventId);
  };

  // Check if user is the organizer
  const isOrganizer = (eventId: string): boolean => {
    return myEvents.some(e => e.id === eventId);
  };

  // Get participant count for event
  const getParticipantCount = async (eventId: string): Promise<number> => {
    const { count } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    return count || 0;
  };

  return {
    events,
    myEvents,
    joinedEvents,
    isLoading,
    createEvent,
    joinEvent,
    leaveEvent,
    checkInToEvent,
    isParticipating,
    isOrganizer,
    getParticipantCount,
    refetch: fetchEvents,
  };
}
