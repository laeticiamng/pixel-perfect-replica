import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, QrCode, UserPlus, LogOut, Check, Loader2, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Participant {
  id: string;
  user_id: string;
  joined_at: string;
  checked_in: boolean;
  checked_in_at: string | null;
  first_name?: string;
  avatar_url?: string;
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, myEvents, joinEvent, leaveEvent, checkInToEvent, isParticipating, isOrganizer } = useEvents();
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Find the event
  const event = [...events, ...myEvents].find(e => e.id === eventId);
  const amOrganizer = eventId ? isOrganizer(eventId) : false;
  const amParticipating = eventId ? isParticipating(eventId) : false;

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) return;
      setIsLoadingParticipants(true);

      const { data: participantsData } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId);

      if (participantsData && participantsData.length > 0) {
        // Fetch participant profiles
        const userIds = participantsData.map(p => p.user_id);
        const { data: profiles } = await supabase.rpc('get_public_profiles', {
          profile_ids: userIds
        });

        const enrichedParticipants = participantsData.map(p => {
          const profile = profiles?.find((prof: any) => prof.id === p.user_id);
          return {
            ...p,
            first_name: profile?.first_name || 'Anonyme',
            avatar_url: profile?.avatar_url,
          };
        });

        setParticipants(enrichedParticipants);
      } else {
        setParticipants([]);
      }

      setIsLoadingParticipants(false);
    };

    fetchParticipants();
  }, [eventId]);

  const handleJoin = async () => {
    if (!eventId) return;
    setIsJoining(true);
    const { error } = await joinEvent(eventId);
    setIsJoining(false);
    
    if (error) {
      toast.error('Erreur lors de l\'inscription');
    } else {
      toast.success('Tu es inscrit à l\'événement !');
    }
  };

  const handleLeave = async () => {
    if (!eventId) return;
    const { error } = await leaveEvent(eventId);
    
    if (error) {
      toast.error('Erreur lors de la désinscription');
    } else {
      toast.success('Tu as quitté l\'événement');
      navigate('/events');
    }
  };

  const handleCopyQrSecret = () => {
    if (event?.qr_code_secret) {
      navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}/checkin?secret=${event.qr_code_secret}`);
      toast.success('Lien de check-in copié !');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event?.name || 'Événement SIGNAL',
      text: `Rejoins-moi sur l'événement "${event?.name}" !`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié !');
    }
  };

  if (!event) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <header className="safe-top px-6 py-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour aux événements"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
        </header>
        <div className="px-6 py-12 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-muted-foreground">Événement non trouvé</p>
          <Button
            onClick={() => navigate('/events')}
            className="mt-4 bg-coral hover:bg-coral-dark"
          >
            Retour aux événements
          </Button>
        </div>
      </PageLayout>
    );
  }

  const eventDate = new Date(event.starts_at);
  const isUpcoming = eventDate > new Date();
  const isActive = new Date(event.starts_at) <= new Date() && new Date(event.ends_at) > new Date();

  return (
    <PageLayout className="pb-24 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/events')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour aux événements"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Event Header */}
        <Card className="glass border-0 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isActive && (
                    <span className="text-xs bg-signal-green/20 text-signal-green px-2 py-1 rounded-full animate-pulse">
                      🔴 En cours
                    </span>
                  )}
                  {amOrganizer && (
                    <span className="text-xs bg-coral/20 text-coral px-2 py-1 rounded-full">
                      Organisateur
                    </span>
                  )}
                  {amParticipating && !amOrganizer && (
                    <span className="text-xs bg-signal-green/20 text-signal-green px-2 py-1 rounded-full">
                      Inscrit ✓
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4" />
                  {event.location_name}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(event.starts_at), 'PPP à HH:mm', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participants.length} / {event.max_participants} participants</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!amParticipating && !amOrganizer && (
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1 bg-coral hover:bg-coral-dark gap-2"
                >
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Rejoindre
                    </>
                  )}
                </Button>
              )}
              
              {amParticipating && !amOrganizer && (
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  className="flex-1 text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Quitter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section (Organizer only) */}
        {amOrganizer && (
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-coral" />
                Check-in QR Code
              </CardTitle>
              <CardDescription>
                Partage ce code pour que les participants puissent confirmer leur présence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-card p-6 rounded-xl text-center mb-4 border border-border">
                {/* QR Code placeholder - in production, use a QR code library */}
                <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">QR Code</p>
                    <p className="text-[10px] text-muted-foreground mt-1 break-all px-2">
                      {event.qr_code_secret.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleCopyQrSecret}
                className="w-full gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier le lien de check-in
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-coral" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingParticipants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-muted-foreground">Aucun participant pour le moment</p>
                <p className="text-sm text-muted-foreground mt-1">Sois le premier à rejoindre !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      participant.checked_in ? "bg-signal-green/10" : "bg-muted/50"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold",
                      participant.avatar_url ? "" : "bg-gradient-to-br from-coral to-coral-dark"
                    )}>
                      {participant.avatar_url ? (
                        <img
                          src={participant.avatar_url}
                          alt={participant.first_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        participant.first_name?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{participant.first_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit {format(new Date(participant.joined_at), 'dd MMM', { locale: fr })}
                      </p>
                    </div>
                    
                    {/* Check-in status */}
                    {participant.checked_in && (
                      <div className="flex items-center gap-1 text-signal-green text-sm">
                        <Check className="h-4 w-4" />
                        <span>Présent</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
