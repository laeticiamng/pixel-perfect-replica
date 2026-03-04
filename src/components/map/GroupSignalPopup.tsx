import { Users, Clock, MapPin, MessageCircle, LogIn, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ACTIVITIES } from '@/types/signal';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import type { GroupSignal } from '@/hooks/useGroupSignals';

interface GroupSignalPopupProps {
  group: GroupSignal;
  onClose: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
  isLoading?: boolean;
}

export function GroupSignalPopup({ group, onClose, onJoin, onLeave, onOpenChat, isLoading }: GroupSignalPopupProps) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;
  const activity = ACTIVITIES.find(a => a.id === group.activity);
  const isFull = group.current_members >= group.max_participants;

  return (
    <div className="w-72 bg-card border border-border rounded-2xl shadow-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center text-lg shrink-0">
            {activity?.emoji || '✨'}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground truncate">{group.title || t('groupSignal.untitled')}</h3>
            <p className="text-xs text-muted-foreground">{t('groupSignal.by')} {group.creator_name}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
      )}

      {/* Info row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <span className={isFull ? 'text-destructive font-bold' : 'text-foreground font-semibold'}>
            {group.current_members}/{group.max_participants}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(group.expires_at), { addSuffix: true, locale: dateLocale })}
        </span>
        {group.location_description && (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {group.location_description}
          </span>
        )}
      </div>

      {/* Members preview */}
      {group.member_names.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {group.member_names.map((name, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {name}
            </Badge>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {group.is_member ? (
          <>
            <Button
              size="sm"
              onClick={onOpenChat}
              className="flex-1 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('groupSignal.chat')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onLeave}
              disabled={isLoading}
              className="rounded-xl"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={onJoin}
            disabled={isFull || isLoading}
            className="w-full bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            <LogIn className="h-4 w-4 mr-1" />
            {isFull ? t('groupSignal.full') : t('groupSignal.join')}
          </Button>
        )}
      </div>
    </div>
  );
}
