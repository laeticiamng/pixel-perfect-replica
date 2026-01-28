import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExportData {
  profile: any;
  settings: any;
  stats: any;
  interactions: any[];
  feedback: any[];
  exportedAt: string;
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
        { data: feedback }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
        supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
        supabase.from('interactions').select('*').eq('user_id', user.id),
        supabase.from('app_feedback').select('*').eq('user_id', user.id)
      ]);

      const exportData: ExportData = {
        profile: profile ? {
          first_name: profile.first_name,
          email: profile.email,
          university: profile.university,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        } : null,
        settings: settings ? {
          ghost_mode: settings.ghost_mode,
          visibility_distance: settings.visibility_distance,
          push_notifications: settings.push_notifications,
          sound_notifications: settings.sound_notifications,
          proximity_vibration: settings.proximity_vibration
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
          feedback: i.feedback
          // Location data excluded for privacy
        })),
        feedback: (feedback || []).map(f => ({
          rating: f.rating,
          message: f.message,
          created_at: f.created_at
        })),
        exportedAt: new Date().toISOString()
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
    a.download = `signal-data-export-${new Date().toISOString().split('T')[0]}.json`;
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
