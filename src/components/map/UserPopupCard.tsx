import { X, Star, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface UserPopupCardProps {
  user: {
    id: string;
    user_id: string;
    firstName: string;
    signal: 'green' | 'yellow' | 'red';
    activity: string;
    distance?: number;
    avatar_url?: string;
    rating?: number;
    activeSince?: Date;
  };
  onClose: () => void;
  onContact: (userId: string) => void;
  className?: string;
}

export function UserPopupCard({
  user,
  onClose,
  onContact,
  className,
}: UserPopupCardProps) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const activity = ACTIVITIES.find(a => a.id === user.activity);
  
  const getSignalLabel = (signal: string) => {
    switch (signal) {
      case 'green': return t('userPopup.open');
      case 'yellow': return t('userPopup.conditional');
      default: return t('userPopup.busy');
    }
  };
  
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'green': return 'bg-signal-green/20 text-signal-green border-signal-green/30';
      case 'yellow': return 'bg-signal-yellow/20 text-signal-yellow border-signal-yellow/30';
      default: return 'bg-signal-red/20 text-signal-red border-signal-red/30';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return t('userPopup.unknownDistance');
    if (meters < 100) return t('userPopup.veryClose', { meters: Math.round(meters) });
    if (meters < 500) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className={cn(
      "glass-strong rounded-2xl p-4 min-w-[280px] max-w-[320px] shadow-xl border border-border/50 animate-scale-in",
      className
    )}>
      {/* Header with close button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {user.firstName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Signal indicator */}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white",
              user.signal === 'green' ? 'bg-signal-green' : user.signal === 'yellow' ? 'bg-signal-yellow' : 'bg-signal-red'
            )} />
          </div>

          {/* Name and status */}
          <div>
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {user.firstName}
            </h3>
            <Badge 
              variant="outline" 
              className={cn("text-xs mt-1 border", getSignalColor(user.signal))}
            >
              {getSignalLabel(user.signal)}
            </Badge>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label={t('close')}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Activity and details */}
      <div className="space-y-2 mb-4">
        {/* Activity */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">{activity?.emoji || '✨'}</span>
          <span className="text-foreground font-medium">{t(activity?.labelKey || 'activities.other')}</span>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-coral" />
          <span>{formatDistance(user.distance)}</span>
        </div>

        {/* Rating if available */}
        {user.rating !== undefined && user.rating > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span>{user.rating.toFixed(1)} / 5</span>
          </div>
        )}

        {/* Active since */}
        {user.activeSince && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(user.activeSince, { addSuffix: true, locale: dateLocale })}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      <Button
        onClick={() => onContact(user.user_id)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        size="lg"
      >
        <User className="h-4 w-4 mr-2" />
        {t('userPopup.viewProfile')}
      </Button>
    </div>
  );
}
