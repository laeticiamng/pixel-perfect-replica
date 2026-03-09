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
    const fetchAttendees = async () => {
      // Single RPC call with reasonable limit — use length as count
      const { data, error } = await supabase
        .rpc('get_event_attendees_public', { p_event_id: eventId, p_limit: 200 });

      if (error) {
        console.warn('[EventAttendeesPreview] RPC error:', error.message);
        return;
      }

      if (data && data.length > 0) {
        setAttendees(data.slice(0, 3).map((a: any) => ({ first_name: a.first_name, avatar_url: a.avatar_url })));
        setCount(data.length);
      }
    };
    fetchAttendees();
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
