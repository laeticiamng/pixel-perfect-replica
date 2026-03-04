import { useState, useEffect } from 'react';
import { CalendarDays, Users, Clock, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow, isWithinInterval } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';

export interface MapEvent {
  id: string;
  name: string;
  description: string | null;
  location_name: string;
  latitude: number;
  longitude: number;
  starts_at: string;
  ends_at: string;
  max_participants: number;
  organizer_id: string;
  is_active: boolean;
}

interface EventMapMarkerProps {
  event: MapEvent;
  isHappeningNow: boolean;
  onClick: () => void;
}

export function EventMapMarker({ event, isHappeningNow, onClick }: EventMapMarkerProps) {
  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer transform transition-transform hover:scale-110 active:scale-95"
      aria-label={`Event: ${event.name}`}
    >
      {/* Happening now pulse */}
      {isHappeningNow && (
        <>
          <div className="absolute -inset-2 rounded-full bg-signal-green/30 animate-ping" />
          <div className="absolute -inset-1 rounded-full bg-signal-green/20 animate-pulse" />
        </>
      )}
      {/* Marker */}
      <div className={cn(
        "relative w-11 h-11 rounded-xl flex items-center justify-center border-3 border-white shadow-lg",
        isHappeningNow
          ? "bg-gradient-to-br from-signal-green to-signal-green/80"
          : "bg-gradient-to-br from-accent to-accent/80"
      )}>
        <CalendarDays className="h-5 w-5 text-white" />
      </div>
      {/* Badge */}
      {isHappeningNow && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-signal-green border-2 border-white shadow flex items-center justify-center">
          <Zap className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

interface EventPopupCardProps {
  event: MapEvent;
  isHappeningNow: boolean;
  isJoined: boolean;
  participantCount: number;
  onJoin: () => void;
  onLeave: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}

export function EventPopupCard({
  event, isHappeningNow, isJoined, participantCount, onJoin, onLeave, onViewDetails, onClose,
}: EventPopupCardProps) {
  const { t, locale } = useTranslation();
  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;
  const isFull = participantCount >= event.max_participants;

  return (
    <div className="glass-strong rounded-xl p-4 shadow-xl min-w-[260px] max-w-[300px] space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isHappeningNow && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-signal-green/20 text-signal-green text-[10px] font-bold uppercase tracking-wider">
                <Zap className="h-3 w-3" />
                {t('mapEvents.happeningNow')}
              </span>
            )}
          </div>
          <h3 className="font-bold text-foreground text-sm mt-1 truncate">{event.name}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs p-1">✕</button>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{event.location_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {isHappeningNow
              ? t('mapEvents.endsIn', { time: formatDistanceToNow(new Date(event.ends_at), { locale: dateFnsLocale }) })
              : t('mapEvents.startsIn', { time: formatDistanceToNow(new Date(event.starts_at), { addSuffix: true, locale: dateFnsLocale }) })
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span className={cn(isFull && "text-destructive font-medium")}>
            {participantCount}/{event.max_participants} {t('mapEvents.participants')}
          </span>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 rounded-lg text-xs"
        >
          {t('mapEvents.viewDetails')}
        </Button>
        {isJoined ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onLeave}
            className="flex-1 rounded-lg text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {t('mapEvents.leave')}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onJoin}
            disabled={isFull}
            className="flex-1 rounded-lg text-xs bg-coral hover:bg-coral-dark text-white"
          >
            {isFull ? t('mapEvents.full') : t('mapEvents.join')}
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper to check if event is happening now
export function isEventHappeningNow(event: MapEvent): boolean {
  const now = new Date();
  return isWithinInterval(now, {
    start: new Date(event.starts_at),
    end: new Date(event.ends_at),
  });
}
