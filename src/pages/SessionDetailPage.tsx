import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, 
  MessageCircle, Shield, Loader2, AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionChat } from '@/components/binome/SessionChat';
import { SessionCheckin } from '@/components/binome/SessionCheckin';
import { SessionFeedbackForm } from '@/components/binome/SessionFeedbackForm';
import { TestimonialForm } from '@/components/binome/TestimonialForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import type { ActivityType } from '@/hooks/useBinomeSessions';

interface SessionDetail {
  id: string;
  creator_id: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  activity: ActivityType;
  city: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
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
  checked_out?: boolean;
  profile?: { first_name: string; avatar_url: string | null };
  reliability?: { reliability_score: number };
}

interface CreatorProfile {
  first_name: string;
  avatar_url: string | null;
  university: string | null;
}

const activityEmojis: Record<ActivityType, string> = {
  studying: '📚', working: '💻', eating: '🍽️', sport: '🏃', talking: '💬', other: '✨'
};

const durationLabels: Record<number, string> = { 45: '45 min', 90: '1h30', 180: '3h' };

export default function SessionDetailPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTestimonial, setShowTestimonial] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('scheduled_sessions').select('*').eq('id', sessionId).single();
      if (sessionError) throw sessionError;
      setSession(sessionData);
      setIsCreator(sessionData.creator_id === user?.id);

      const { data: creatorData } = await supabase.rpc('get_public_profile_secure', { p_user_id: sessionData.creator_id });
      if (creatorData?.[0]) setCreator(creatorData[0]);

      const { data: participantsData, error: participantsError } = await supabase
        .from('session_participants').select('id, user_id, joined_at, checked_in, checked_out').eq('session_id', sessionId);
      if (participantsError) throw participantsError;

      // Batch fetch profiles and reliability
      const participantUserIds = (participantsData || []).map(p => p.user_id);
      const [{ data: profilesData }, ...reliabilityResults] = await Promise.all([
        supabase.rpc('get_public_profiles', { profile_ids: participantUserIds }),
        ...participantUserIds.map(uid => supabase.rpc('get_user_reliability_public', { p_user_id: uid }))
      ]);

      const profileMap = new Map<string, { first_name: string; avatar_url: string | null }>();
      (profilesData || []).forEach((p: any) => profileMap.set(p.id, p));
      const reliabilityMap = new Map<string, { reliability_score: number }>();
      reliabilityResults.forEach((res, idx) => { if (res.data?.[0]) reliabilityMap.set(participantUserIds[idx], res.data[0]); });

      const participantProfiles: Participant[] = (participantsData || []).map(p => {
        if (p.user_id === user?.id) { setIsParticipant(true); if (p.checked_out) setHasCheckedOut(true); }
        return { ...p, checked_out: p.checked_out, profile: profileMap.get(p.user_id) || { first_name: t('profile.user'), avatar_url: null }, reliability: reliabilityMap.get(p.user_id) || undefined };
      });
      setParticipants(participantProfiles);

      if (sessionData.status === 'completed') {
        const sessionDateTime = new Date(`${sessionData.scheduled_date}T${sessionData.start_time}`);
        const endTime = new Date(sessionDateTime.getTime() + sessionData.duration_minutes * 60000);
        if (new Date() > endTime) {
          const { data: feedbackData } = await supabase.from('session_feedback').select('id').eq('session_id', sessionId).eq('from_user_id', user?.id).single();
          if (!feedbackData) setShowFeedback(true);
          const { data: testimonialData } = await supabase.from('user_testimonials').select('id').eq('session_id', sessionId).eq('user_id', user?.id).single();
          if (!testimonialData) setShowTestimonial(true);
        }
      }
    } catch (error) {
      console.error('[SessionDetail] Error:', error);
      toast.error(t('sessionDetail.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, user?.id]);

  useEffect(() => { fetchSessionDetails(); }, [fetchSessionDetails]);

  const handleJoin = async () => {
    if (!sessionId) return;
    try {
      const { error } = await supabase.rpc('join_session', { p_session_id: sessionId });
      if (error) throw error;
      toast.success(t('binome.joinedSession'));
      await fetchSessionDetails();
    } catch (error) { toast.error((error as Error).message); }
  };

  const handleLeave = async () => {
    if (!sessionId) return;
    try {
      const { error } = await supabase.rpc('leave_session', { p_session_id: sessionId });
      if (error) throw error;
      toast.success(t('binome.leftSession'));
      await fetchSessionDetails();
    } catch (error) { toast.error((error as Error).message); }
  };

  if (isLoading) {
    return (<PageLayout className="pb-24 safe-bottom"><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-coral" /></div><BottomNav /></PageLayout>);
  }

  if (!session) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
          <AlertTriangle className="h-16 w-16 text-signal-yellow mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">{t('sessionDetail.sessionNotFound')}</h2>
          <p className="text-muted-foreground text-center mb-4">{t('sessionDetail.sessionNotFoundDesc')}</p>
          <Button onClick={() => navigate('/binome')} className="bg-coral">{t('sessionDetail.backToSessions')}</Button>
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  const sessionDate = new Date(session.scheduled_date);
  const dateLocale = locale === 'fr' ? fr : enUS;
  const formattedDate = format(sessionDate, 'EEEE d MMMM yyyy', { locale: dateLocale });
  const isFull = participants.length >= session.max_participants;
  const canJoin = !isParticipant && !isCreator && !isFull && session.status === 'open';

  const statusLabel = session.status === 'open' ? t('sessionDetail.open') : session.status === 'full' ? t('sessionDetail.full') : session.status === 'cancelled' ? t('sessionDetail.cancelled') : t('sessionDetail.completed');

  return (
    <PageLayout className="pb-24 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/binome')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {activityEmojis[session.activity]} {t(`activities.${session.activity}` as any)}
            </h1>
            <p className="text-sm text-muted-foreground">{session.city}</p>
          </div>
          <Badge variant={session.status === 'cancelled' ? 'destructive' : 'default'} className={session.status === 'open' ? 'bg-signal-green/20 text-signal-green' : ''}>
            {statusLabel}
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
                <AvatarFallback className="bg-coral/20 text-coral text-lg">{creator?.first_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{creator?.first_name || t('profile.user')}</p>
                {creator?.university && <p className="text-sm text-muted-foreground">{creator.university}</p>}
              </div>
              {isCreator && <Badge className="bg-coral/20 text-coral">{t('sessionDetail.organizer')}</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-foreground"><Calendar className="h-5 w-5 text-coral" /><span className="capitalize">{formattedDate}</span></div>
          <div className="flex items-center gap-3 text-foreground"><Clock className="h-5 w-5 text-coral" /><span>{session.start_time.slice(0, 5)} • {durationLabels[session.duration_minutes] || `${session.duration_minutes} min`}</span></div>
          <div className="flex items-center gap-3 text-foreground"><MapPin className="h-5 w-5 text-signal-green" /><span>{session.city}{session.location_name && ` - ${session.location_name}`}</span></div>
          <div className="flex items-center gap-3"><Users className="h-5 w-5 text-signal-yellow" /><span className={isFull ? 'text-coral' : 'text-foreground'}>{participants.length} / {session.max_participants} {t('sessionDetail.participants').toLowerCase()}</span></div>
          {session.note && <div className="glass rounded-xl p-4 mt-4"><p className="text-sm text-muted-foreground italic">"{session.note}"</p></div>}
        </div>

        {/* Actions */}
        {!isCreator && (
          <div className="flex gap-3">
            {canJoin ? (<Button onClick={handleJoin} className="flex-1 bg-coral hover:bg-coral/90">{t('sessionDetail.joinSession')}</Button>)
            : isParticipant ? (<Button onClick={handleLeave} variant="outline" className="flex-1">{t('sessionDetail.leaveSession')}</Button>) : null}
          </div>
        )}

        {/* Check-in */}
        {isParticipant && (
          <SessionCheckin
            sessionId={session.id}
            sessionLocation={session.latitude && session.longitude ? { latitude: session.latitude as unknown as number, longitude: session.longitude as unknown as number, name: session.location_name || undefined } : undefined}
            scheduledDate={session.scheduled_date}
            startTime={session.start_time}
            onCheckinComplete={() => fetchSessionDetails()}
            onCheckoutComplete={() => { fetchSessionDetails(); setHasCheckedOut(true); }}
          />
        )}

        {/* Tabs */}
        {(isParticipant || isCreator) && (
          <Tabs defaultValue="participants" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="participants" className="flex items-center gap-1"><Users className="h-4 w-4" />{t('sessionDetail.participants')} ({participants.length})</TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{t('sessionDetail.chat')}</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="space-y-3">
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-coral/30">
                  <AvatarImage src={creator?.avatar_url || undefined} />
                  <AvatarFallback className="bg-coral/20 text-coral">{creator?.first_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{creator?.first_name}</p>
                    <Badge variant="outline" className="text-xs">{t('sessionDetail.organizer')}</Badge>
                  </div>
                  {creator?.university && <p className="text-xs text-muted-foreground">{creator.university}</p>}
                </div>
              </div>

              {participants.map((participant) => (
                <div key={participant.id} className="glass rounded-xl p-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={participant.profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{participant.profile?.first_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{participant.profile?.first_name || t('profile.user')}</p>
                      {participant.user_id === user?.id && <Badge className="bg-signal-green/20 text-signal-green text-xs">{t('sessionDetail.you')}</Badge>}
                    </div>
                    {participant.reliability && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 text-signal-green" />
                        <span>{Math.round(participant.reliability.reliability_score)}% {t('sessionDetail.reliability')}</span>
                      </div>
                    )}
                  </div>
                  {participant.checked_in && <Badge className="bg-signal-green/20 text-signal-green">{t('sessionDetail.checkedIn')}</Badge>}
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>{t('sessionDetail.noParticipants')}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat"><SessionChat sessionId={session.id} /></TabsContent>
          </Tabs>
        )}

        {showFeedback && isParticipant && (
          <SessionFeedbackForm
            sessionId={session.id}
            participants={[
              { id: session.creator_id, name: creator?.first_name || t('sessionDetail.organizer') },
              ...participants.filter(p => p.user_id !== user?.id).map(p => ({ id: p.user_id, name: p.profile?.first_name || t('profile.user') }))
            ]}
            onComplete={() => setShowFeedback(false)}
          />
        )}

        {(showTestimonial || hasCheckedOut) && isParticipant && (
          <TestimonialForm
            sessionId={session.id}
            activity={t(`activities.${session.activity}` as any)}
            onSuccess={() => setShowTestimonial(false)}
            onCancel={() => setShowTestimonial(false)}
          />
        )}
      </div>
      <BottomNav />
    </PageLayout>
  );
}
