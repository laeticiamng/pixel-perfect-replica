import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Attendee {
  first_name: string;
  avatar_url: string | null;
}

interface EventAttendeesPreviewProps {
  eventId: string;
  className?: string;
}

export function EventAttendeesPreview({ eventId, className }: EventAttendeesPreviewProps) {
  const { t } = useTranslation();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      // Get count
      const { count: total } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      
      setCount(total || 0);

      if (total && total > 0) {
        // Get first 3 participant profiles
        const { data: participants } = await supabase
          .from('event_participants')
          .select('user_id')
          .eq('event_id', eventId)
          .limit(3);

        if (participants) {
          const ids = participants.map(p => p.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('first_name, avatar_url')
            .in('id', ids);
          
          setAttendees(profiles || []);
        }
      }
    };
    fetch();
  }, [eventId]);

  if (count === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-2">
        {attendees.slice(0, 3).map((a, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full border-2 border-background overflow-hidden bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center"
          >
            {a.avatar_url ? (
              <img src={a.avatar_url} alt={a.first_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary-foreground">
                {a.first_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {count === 1
          ? `1 ${t('wellbeing.going') || 'going'}`
          : `${count} ${t('wellbeing.going') || 'going'}`}
      </span>
    </div>
  );
}
