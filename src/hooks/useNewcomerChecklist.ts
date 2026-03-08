import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ChecklistTask {
  key: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
}

const DEFAULT_TASKS = [
  'register_university',
  'find_grocery_store',
  'open_bank_account',
  'find_gym',
  'get_transport_pass',
];

export function useNewcomerChecklist() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChecklist = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    const { data } = await supabase
      .from('newcomer_checklist')
      .select('*')
      .eq('user_id', user.id);

    const completedMap = new Map(
      (data || []).map((item: any) => [item.task_key, item])
    );

    const merged = DEFAULT_TASKS.map((key) => {
      const saved = completedMap.get(key) as any;
      return {
        key,
        icon: getTaskIcon(key),
        completed: saved?.completed ?? false,
        completedAt: saved?.completed_at,
        locationName: saved?.location_name,
        locationLat: saved?.location_lat,
        locationLng: saved?.location_lng,
        notes: saved?.notes,
      };
    });

    setTasks(merged);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const toggleTask = async (taskKey: string, location?: { name: string; lat: number; lng: number }) => {
    if (!user) return;

    const task = tasks.find((t) => t.key === taskKey);
    if (!task) return;

    const newCompleted = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.key === taskKey
          ? { ...t, completed: newCompleted, completedAt: newCompleted ? new Date().toISOString() : undefined }
          : t
      )
    );

    const { error } = await supabase
      .from('newcomer_checklist')
      .upsert(
        {
          user_id: user.id,
          task_key: taskKey,
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
          location_name: location?.name || null,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
        },
        { onConflict: 'user_id,task_key' }
      );

    if (error) {
      // Revert
      setTasks((prev) =>
        prev.map((t) =>
          t.key === taskKey ? { ...t, completed: !newCompleted } : t
        )
      );
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return { tasks, isLoading, toggleTask, completedCount, totalCount: tasks.length, progress, refetch: fetchChecklist };
}

function getTaskIcon(key: string): string {
  switch (key) {
    case 'register_university': return '🎓';
    case 'find_grocery_store': return '🛒';
    case 'open_bank_account': return '🏦';
    case 'find_gym': return '💪';
    case 'get_transport_pass': return '🚌';
    default: return '📋';
  }
}
