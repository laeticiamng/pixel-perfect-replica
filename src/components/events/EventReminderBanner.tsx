import { Bell, Clock } from 'lucide-react';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Event } from '@/hooks/useEvents';

interface EventReminderBannerProps {
  event: Event;
  className?: string;
}

export function EventReminderBanner({ event, className }: EventReminderBannerProps) {
  const now = new Date();
  const startDate = new Date(event.starts_at);
  const minutesUntilStart = differenceInMinutes(startDate, now);
  const hoursUntilStart = differenceInHours(startDate, now);
  
  // Don't show if event has started or is more than 24h away
  if (minutesUntilStart < 0 || hoursUntilStart > 24) {
    return null;
  }
  
  // Determine urgency level
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let message = '';
  
  if (minutesUntilStart <= 15) {
    urgency = 'high';
    message = `Commence dans ${minutesUntilStart} min !`;
  } else if (minutesUntilStart <= 60) {
    urgency = 'medium';
    message = `Commence dans ${minutesUntilStart} min`;
  } else {
    urgency = 'low';
    message = `Commence dans ${hoursUntilStart}h`;
  }
  
  const urgencyStyles = {
    low: 'bg-muted border-border text-muted-foreground',
    medium: 'bg-signal-yellow/20 border-signal-yellow/30 text-signal-yellow',
    high: 'bg-coral/20 border-coral/30 text-coral animate-pulse',
  };
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border',
        urgencyStyles[urgency],
        className
      )}
    >
      <div className={cn(
        'p-2 rounded-lg',
        urgency === 'high' ? 'bg-coral/20' : urgency === 'medium' ? 'bg-signal-yellow/20' : 'bg-muted'
      )}>
        {urgency === 'high' ? (
          <Bell className="h-4 w-4 animate-bounce" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{event.name}</p>
        <p className="text-xs opacity-80">
          {message} • {format(startDate, 'HH:mm', { locale: fr })}
        </p>
      </div>
      
      {urgency === 'high' && (
        <span className="text-xs font-bold uppercase tracking-wider">
          Bientôt !
        </span>
      )}
    </div>
  );
}

interface UpcomingEventsReminderProps {
  events: Event[];
  participatingEventIds: string[];
  className?: string;
}

export function UpcomingEventsReminder({ 
  events, 
  participatingEventIds, 
  className 
}: UpcomingEventsReminderProps) {
  const now = new Date();
  
  // Filter to events user is participating in and starting within 24h
  const upcomingEvents = events
    .filter(event => {
      const startDate = new Date(event.starts_at);
      const hoursUntilStart = differenceInHours(startDate, now);
      return (
        participatingEventIds.includes(event.id) &&
        hoursUntilStart >= 0 &&
        hoursUntilStart <= 24
      );
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  
  if (upcomingEvents.length === 0) {
    return null;
  }
  
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Bell className="h-3 w-3" />
        Rappels
      </h3>
      {upcomingEvents.map(event => (
        <EventReminderBanner key={event.id} event={event} />
      ))}
    </div>
  );
}
