/**
 * Typed interfaces for Supabase RPC and query results.
 * Use these instead of `as unknown as X` casts.
 */

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

export interface CommunityStats {
  active_users_now: number;
  sessions_this_month: number;
  completed_sessions: number;
}

export interface AlertPreferences {
  id?: string;
  user_id: string;
  email: string;
  alert_new_user: boolean;
  alert_high_reports: boolean;
  alert_error_spike: boolean;
}

export interface AlertLog {
  id: string;
  alert_type: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  metadata: Record<string, unknown>;
}

export interface RealtimeMessagePayload {
  id: string;
  interaction_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface NearbyUser {
  id: string;
  user_id: string;
  firstName: string;
  signal: 'green' | 'yellow' | 'red';
  activity: string;
  latitude: number;
  longitude: number;
  distance?: number;
  avatar_url?: string;
  rating?: number;
  activeSince?: Date;
}

/**
 * Helper to safely extract PushManager from a ServiceWorkerRegistration.
 * Browsers type this inconsistently.
 */
export function getPushManager(registration: ServiceWorkerRegistration): PushManager {
  return (registration as unknown as { pushManager: PushManager }).pushManager;
}
