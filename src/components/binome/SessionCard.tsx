import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Book, Laptop, Utensils, Dumbbell, MessageCircle, Star,
  MapPin, Clock, Users, Calendar, Shield
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ScheduledSession, ActivityType } from '@/hooks/useBinomeSessions';

interface SessionCardProps {
  session: ScheduledSession;
  onJoin?: (sessionId: string) => void;
  onLeave?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  isJoined?: boolean;
  isOwner?: boolean;
  isLoading?: boolean;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  studying: <Book className="h-4 w-4" />,
  working: <Laptop className="h-4 w-4" />,
  eating: <Utensils className="h-4 w-4" />,
  sport: <Dumbbell className="h-4 w-4" />,
  talking: <MessageCircle className="h-4 w-4" />,
  other: <Star className="h-4 w-4" />
};

const activityLabels: Record<ActivityType, string> = {
  studying: 'Réviser',
  working: 'Bosser',
  eating: 'Manger',
  sport: 'Sport',
  talking: 'Parler',
  other: 'Autre'
};

const activityColors: Record<ActivityType, string> = {
  studying: 'bg-blue-500/20 text-blue-400',
  working: 'bg-purple-500/20 text-purple-400',
  eating: 'bg-orange-500/20 text-orange-400',
  sport: 'bg-green-500/20 text-green-400',
  talking: 'bg-pink-500/20 text-pink-400',
  other: 'bg-gray-500/20 text-gray-400'
};

const durationLabels: Record<number, string> = {
  45: '45 min',
  90: '1h30',
  180: '3h'
};

export function SessionCard({
  session,
  onJoin,
  onLeave,
  onCancel,
  isJoined = false,
  isOwner = false,
  isLoading = false
}: SessionCardProps) {
  const sessionDate = new Date(session.scheduled_date);
  const formattedDate = format(sessionDate, 'EEEE d MMMM', { locale: fr });
  const isFull = (session.current_participants || 0) >= session.max_participants;

  return (
    <Card className="glass border-0 overflow-hidden">
      <CardContent className="p-4">
        {/* Header with creator info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-coral/30">
              <AvatarImage src={session.creator_avatar || undefined} />
              <AvatarFallback className="bg-coral/20 text-coral">
                {session.creator_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">
                {session.creator_name || 'Utilisateur'}
              </p>
              {session.creator_reliability !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-signal-green" />
                  <span>{Math.round(session.creator_reliability)}% fiabilité</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={activityColors[session.activity]}>
            {activityIcons[session.activity]}
            <span className="ml-1">{activityLabels[session.activity]}</span>
          </Badge>
        </div>

        {/* Session details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="h-4 w-4 text-coral" />
            <span className="capitalize">{formattedDate}</span>
            <span className="text-muted-foreground">•</span>
            <Clock className="h-4 w-4 text-coral" />
            <span>{session.start_time.slice(0, 5)}</span>
            <span className="text-muted-foreground">
              ({durationLabels[session.duration_minutes] || session.duration_minutes + ' min'})
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-signal-green" />
            <span className="text-foreground">{session.city}</span>
            {session.location_name && (
              <span className="text-muted-foreground">• {session.location_name}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-signal-yellow" />
            <span className={isFull ? 'text-coral' : 'text-foreground'}>
              {session.current_participants || 0} / {session.max_participants} participants
            </span>
            {isFull && <Badge variant="outline" className="text-xs">Complet</Badge>}
          </div>

          {session.note && (
            <p className="text-sm text-muted-foreground italic mt-2 pl-6">
              "{session.note}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isOwner ? (
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancel?.(session.id)}
              disabled={isLoading || session.status === 'cancelled'}
            >
              {session.status === 'cancelled' ? 'Annulé' : 'Annuler'}
            </Button>
          ) : isJoined ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onLeave?.(session.id)}
              disabled={isLoading}
            >
              Quitter
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1 bg-coral hover:bg-coral/90"
              onClick={() => onJoin?.(session.id)}
              disabled={isLoading || isFull}
            >
              {isFull ? 'Complet' : 'Rejoindre'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
