import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentLocale } from '@/lib/i18n/translations';

interface ExportData {
  profile: any;
  settings: any;
  stats: any;
  interactions: any[];
  feedback: any[];
  emergencyContacts: any[];
  blocks: any[];
  reports: any[];
  sessions: any[];
  reliability: any;
  badges: any[];
  exportedAt: string;
  dataRetentionInfo: string;
}

export function useGdprExport() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const exportMyData = async (): Promise<{ data: ExportData | null; error: Error | null }> => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    setIsExporting(true);

    try {
      // Fetch all user data in parallel
      const [
        { data: profile },
        { data: settings },
        { data: stats },
        { data: interactions },
        { data: feedback },
        { data: emergencyContacts },
        { data: blocks },
        { data: reports },
        { data: sessions },
        { data: reliability },
        { data: badges }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        supabase.from('interactions').select('*').eq('user_id', user.id),
        supabase.from('app_feedback').select('*').eq('user_id', user.id),
        supabase.from('emergency_contacts').select('*').eq('user_id', user.id),
        supabase.from('user_blocks').select('blocked_id, created_at, reason').eq('blocker_id', user.id),
        supabase.from('reports').select('reason, description, created_at').eq('reporter_id', user.id),
        supabase.from('scheduled_sessions').select('*').eq('creator_id', user.id),
        supabase.from('user_reliability').select('*').eq('user_id', user.id).single(),
        supabase.from('verification_badges').select('badge_type, verified_at').eq('user_id', user.id)
      ]);

      const exportData: ExportData = {
        profile: profile ? {
          first_name: profile.first_name,
          email: profile.email,
          university: profile.university,
          bio: profile.bio,
          favorite_activities: profile.favorite_activities,
          is_premium: profile.is_premium,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        } : null,
        settings: settings ? {
          ghost_mode: settings.ghost_mode,
          visibility_distance: settings.visibility_distance,
          push_notifications: settings.push_notifications,
          sound_notifications: settings.sound_notifications,
          proximity_vibration: settings.proximity_vibration,
          language_preference: settings.language_preference
        } : null,
        stats: stats ? {
          interactions: stats.interactions,
          hours_active: stats.hours_active,
          rating: stats.rating,
          total_ratings: stats.total_ratings
        } : null,
        interactions: (interactions || []).map(i => ({
          activity: i.activity,
          created_at: i.created_at,
          feedback: i.feedback,
          icebreaker: i.icebreaker
          // Location data excluded for privacy
        })),
        feedback: (feedback || []).map(f => ({
          rating: f.rating,
          message: f.message,
          created_at: f.created_at
        })),
        emergencyContacts: (emergencyContacts || []).map(c => ({
          name: c.name,
          phone: c.phone,
          created_at: c.created_at
        })),
        blocks: (blocks || []).map(b => ({
          blocked_id: b.blocked_id,
          reason: b.reason,
          created_at: b.created_at
        })),
        reports: (reports || []).map(r => ({
          reason: r.reason,
          description: r.description,
          created_at: r.created_at
        })),
        sessions: (sessions || []).map(s => ({
          activity: s.activity,
          city: s.city,
          location_name: s.location_name,
          scheduled_date: s.scheduled_date,
          start_time: s.start_time,
          duration_minutes: s.duration_minutes,
          status: s.status,
          created_at: s.created_at
        })),
        reliability: reliability ? {
          reliability_score: reliability.reliability_score,
          sessions_created: reliability.sessions_created,
          sessions_joined: reliability.sessions_joined,
          sessions_completed: reliability.sessions_completed,
          positive_feedback_count: reliability.positive_feedback_count,
          total_feedback_count: reliability.total_feedback_count
        } : null,
        badges: (badges || []).map(b => ({
          badge_type: b.badge_type,
          verified_at: b.verified_at
        })),
        exportedAt: new Date().toISOString(),
        dataRetentionInfo: getCurrentLocale() === 'fr' 
          ? 'Les données de localisation sont automatiquement supprimées après 30 jours. Les signaux actifs expirent après 2 heures.'
          : 'Location data is automatically deleted after 30 days. Active signals expire after 2 hours.'
      };

      setIsExporting(false);
      return { data: exportData, error: null };
    } catch (err) {
      setIsExporting(false);
      return { data: null, error: err as Error };
    }
  };

  const downloadExport = async () => {
    const { data, error } = await exportMyData();
    
    if (error || !data) {
      return { error: error || new Error('Export failed') };
    }

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nearvity-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { error: null };
  };

  return {
    exportMyData,
    downloadExport,
    isExporting
  };
}
