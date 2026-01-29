import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, 
  MessageCircle, Shield, Loader2, AlertTriangle,
  CheckCircle2, Navigation
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionChat } from '@/components/binome/SessionChat';
import { SessionFeedbackForm } from '@/components/binome/SessionFeedbackForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { calculateDistance } from '@/utils/distance';
import { toast } from 'sonner';
import type { ActivityType, DurationOption, SessionStatus } from '@/hooks/useBinomeSessions';

interface SessionDetail {
  id: string;
  creator_id: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  activity: ActivityType;
  city: string;
  location_name: string | null;
  note: string | null;
  max_participants: number;
  status: string;
  created_at: string;
}

interface Participant {
  id: string;
  user_id: string;
  joined_at: string;
  checked_in: boolean;
  profile?: {
    first_name: string;
    avatar_url: string | null;
  };
  reliability?: {
    reliability_score: number;
  };
}

interface CreatorProfile {
  first_name: string;
  avatar_url: string | null;
  university: string | null;
}

const activityLabels: Record<ActivityType, string> = {
  studying: 'Réviser',
  working: 'Bosser',
  eating: 'Manger',
  sport: 'Sport',
  talking: 'Parler',
  other: 'Autre'
};

const activityEmojis: Record<ActivityType, string> = {
  studying: '📚',
  working: '💻',
  eating: '🍽️',
  sport: '🏃',
  talking: '💬',
  other: '✨'
};

const durationLabels: Record<number, string> = {
  45: '45 min',
  90: '1h30',
  180: '3h'
};

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);
      setIsCreator(sessionData.creator_id === user?.id);

      // Fetch creator profile
      const { data: creatorData } = await supabase
        .rpc('get_public_profile_secure', { p_user_id: sessionData.creator_id });
      
      if (creatorData && creatorData.length > 0) {
        setCreator(creatorData[0]);
      }

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('session_participants')
        .select('id, user_id, joined_at, checked_in')
        .eq('session_id', sessionId);

      if (participantsError) throw participantsError;

      // Get profiles for each participant
      const participantProfiles: Participant[] = [];
      for (const p of participantsData || []) {
        const { data: profileData } = await supabase
          .rpc('get_public_profile_secure', { p_user_id: p.user_id });
        
        const { data: reliabilityData } = await supabase
          .from('user_reliability')
          .select('reliability_score')
          .eq('user_id', p.user_id)
          .single();

        participantProfiles.push({
          ...p,
          profile: profileData?.[0] || { first_name: 'Utilisateur', avatar_url: null },
          reliability: reliabilityData || undefined
        });

        if (p.user_id === user?.id) {
          setIsParticipant(true);
        }
      }
      setParticipants(participantProfiles);

      // Check if session is completed and user hasn't given feedback
      if (sessionData.status === 'completed') {
        const sessionDateTime = new Date(`${sessionData.scheduled_date}T${sessionData.start_time}`);
        const endTime = new Date(sessionDateTime.getTime() + sessionData.duration_minutes * 60000);
        if (new Date() > endTime) {
          // Check if user has already given feedback
          const { data: feedbackData } = await supabase
            .from('session_feedback')
            .select('id')
            .eq('session_id', sessionId)
            .eq('from_user_id', user?.id)
            .single();

          if (!feedbackData) {
            setShowFeedback(true);
          }
        }
      }

    } catch (error) {
      console.error('[SessionDetail] Error:', error);
      toast.error('Erreur lors du chargement de la session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user?.id]);

  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);

  const handleJoin = async () => {
    if (!sessionId) return;
    
    try {
      const { error } = await supabase.rpc('join_session', { p_session_id: sessionId });
      if (error) throw error;
      toast.success('Tu as rejoint la session !');
      await fetchSessionDetails();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleLeave = async () => {
    if (!sessionId) return;
    
    try {
      const { error } = await supabase.rpc('leave_session', { p_session_id: sessionId });
      if (error) throw error;
      toast.success('Tu as quitté la session');
      await fetchSessionDetails();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  if (!session) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <AlertTriangle className="h-16 w-16 text-signal-yellow mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Session introuvable</h2>
          <p className="text-muted-foreground text-center mb-4">
            Cette session n'existe pas ou a été supprimée
          </p>
          <Button onClick={() => navigate('/binome')} className="bg-coral">
            Retour aux sessions
          </Button>
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  const sessionDate = new Date(session.scheduled_date);
  const formattedDate = format(sessionDate, 'EEEE d MMMM yyyy', { locale: fr });
  const isFull = participants.length >= session.max_participants;
  const canJoin = !isParticipant && !isCreator && !isFull && session.status === 'open';

  return (
    <PageLayout className="pb-24 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/binome')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {activityEmojis[session.activity]} {activityLabels[session.activity]}
            </h1>
            <p className="text-sm text-muted-foreground">{session.city}</p>
          </div>
          <Badge 
            variant={session.status === 'cancelled' ? 'destructive' : 'default'}
            className={session.status === 'open' ? 'bg-signal-green/20 text-signal-green' : ''}
          >
            {session.status === 'open' ? 'Ouvert' : session.status === 'full' ? 'Complet' : session.status === 'cancelled' ? 'Annulé' : 'Terminé'}
          </Badge>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Creator Card */}
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-coral/30">
                <AvatarImage src={creator?.avatar_url || undefined} />
                <AvatarFallback className="bg-coral/20 text-coral text-lg">
                  {creator?.first_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">
                  {creator?.first_name || 'Utilisateur'}
                </p>
                {creator?.university && (
                  <p className="text-sm text-muted-foreground">{creator.university}</p>
                )}
              </div>
              {isCreator && (
                <Badge className="bg-coral/20 text-coral">Organisateur</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-foreground">
            <Calendar className="h-5 w-5 text-coral" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <Clock className="h-5 w-5 text-coral" />
            <span>
              {session.start_time.slice(0, 5)} • {durationLabels[session.duration_minutes] || `${session.duration_minutes} min`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-foreground">
            <MapPin className="h-5 w-5 text-signal-green" />
            <span>
              {session.city}
              {session.location_name && ` - ${session.location_name}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-signal-yellow" />
            <span className={isFull ? 'text-coral' : 'text-foreground'}>
              {participants.length} / {session.max_participants} participants
            </span>
          </div>

          {session.note && (
            <div className="glass rounded-xl p-4 mt-4">
              <p className="text-sm text-muted-foreground italic">"{session.note}"</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isCreator && (
          <div className="flex gap-3">
            {canJoin ? (
              <Button onClick={handleJoin} className="flex-1 bg-coral hover:bg-coral/90">
                Rejoindre la session
              </Button>
            ) : isParticipant ? (
              <Button onClick={handleLeave} variant="outline" className="flex-1">
                Quitter la session
              </Button>
            ) : null}
          </div>
        )}

        {/* Tabs: Participants & Chat */}
        {(isParticipant || isCreator) && (
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="participants" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Participants ({participants.length})
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-3">
              {/* Creator */}
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-coral/30">
                  <AvatarImage src={creator?.avatar_url || undefined} />
                  <AvatarFallback className="bg-coral/20 text-coral">
                    {creator?.first_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{creator?.first_name}</p>
                    <Badge variant="outline" className="text-xs">Organisateur</Badge>
                  </div>
                  {creator?.university && (
                    <p className="text-xs text-muted-foreground">{creator.university}</p>
                  )}
                </div>
              </div>

              {/* Participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="glass rounded-xl p-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={participant.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {participant.profile?.first_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {participant.profile?.first_name || 'Utilisateur'}
                      </p>
                      {participant.user_id === user?.id && (
                        <Badge className="bg-signal-green/20 text-signal-green text-xs">Toi</Badge>
                      )}
                    </div>
                    {participant.reliability && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 text-signal-green" />
                        <span>{Math.round(participant.reliability.reliability_score)}% fiabilité</span>
                      </div>
                    )}
                  </div>
                  {participant.checked_in && (
                    <Badge className="bg-signal-green/20 text-signal-green">Check-in ✓</Badge>
                  )}
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun participant pour le moment</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat">
              <SessionChat sessionId={session.id} />
            </TabsContent>
          </Tabs>
        )}

        {/* Feedback Form (shown after session ends) */}
        {showFeedback && isParticipant && (
          <SessionFeedbackForm
            sessionId={session.id}
            participants={[
              { id: session.creator_id, name: creator?.first_name || 'Organisateur' },
              ...participants
                .filter(p => p.user_id !== user?.id)
                .map(p => ({ id: p.user_id, name: p.profile?.first_name || 'Participant' }))
            ]}
            onComplete={() => setShowFeedback(false)}
          />
        )}
      </div>

      <BottomNav />
    </PageLayout>
  );
}
