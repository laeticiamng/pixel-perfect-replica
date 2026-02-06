import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Flag, GraduationCap, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { IcebreakerCard, VerificationBadges, MiniChat, VoiceIcebreakerButton } from '@/components/social';
import { useActiveSignal } from '@/hooks/useActiveSignal';
import { useInteractions } from '@/hooks/useInteractions';
import { useRevealRateLimit } from '@/hooks/useRevealRateLimit';
import { useTranslation } from '@/lib/i18n';
import { ACTIVITIES, getIcebreaker as getIcebreakerFn } from '@/types/signal';
import { formatDistance, formatTimeSince } from '@/utils/distance';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UserProfile {
  avatar_url: string | null;
  bio: string | null;
  university: string | null;
}

export default function ProximityRevealPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { userId } = useParams();
  const { nearbyUsers } = useActiveSignal();
  const { createInteraction, addFeedback } = useInteractions();
  const { checkAndLogReveal, isChecking: isCheckingReveal } = useRevealRateLimit();
  
  const [icebreaker, setIcebreaker] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [revealBlocked, setRevealBlocked] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const user = nearbyUsers.find(u => u.id === userId);

  useEffect(() => {
    const initReveal = async () => {
      if (!userId) {
        setIsLoadingProfile(false);
        return;
      }

      const { allowed } = await checkAndLogReveal(userId);
      if (!allowed) {
        setRevealBlocked(true);
        setIsLoadingProfile(false);
        return;
      }

      const { data } = await supabase
        .rpc('get_safe_public_profile', { profile_id: userId });
      if (data && data[0]) {
        setUserProfile({
          avatar_url: data[0].avatar_url,
          bio: null,
          university: data[0].university,
        });
      }
      setIsLoadingProfile(false);
    };
    initReveal();
  }, [userId, checkAndLogReveal]);

  const generateIcebreaker = useCallback(() => {
    if (user) {
      const ib = getIcebreakerFn(user.activity as any, locale);
      setIcebreaker(ib);
    }
  }, [user, locale]);

  useEffect(() => {
    if (user && !revealBlocked) {
      generateIcebreaker();
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 300);
      }
    }
  }, [user, generateIcebreaker, revealBlocked]);

  if (isLoadingProfile || isCheckingReveal) {
    return (
      <PageLayout className="flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-coral" />
          <p className="text-muted-foreground">{t('reveal.loadingProfile')}</p>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout className="flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">👻</div>
          <p className="text-foreground font-medium mb-2">{t('reveal.userNotFound')}</p>
          <p className="text-muted-foreground text-sm mb-6">{t('reveal.userNotFoundDesc')}</p>
          <Button
            onClick={() => navigate('/map')}
            className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            {t('reveal.backToMap')}
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (revealBlocked) {
    return (
      <PageLayout className="flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">⏱️</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-signal-yellow" />
            <p className="text-foreground font-medium">{t('reveal.rateLimitTitle')}</p>
          </div>
          <p className="text-muted-foreground text-sm mb-6">{t('reveal.rateLimitDesc')}</p>
          <Button 
            onClick={() => navigate('/map')}
            className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            {t('reveal.backToMap')}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const activityData = ACTIVITIES.find(a => a.id === user.activity);

  const handleRefreshIcebreaker = () => {
    generateIcebreaker();
    toast.success(t('reveal.newIcebreaker'));
  };

  const handleTalked = async () => {
    const { data, error } = await createInteraction(user.id, user.activity, icebreaker);
    
    if (error) {
      toast.error(t('reveal.interactionError'));
      return;
    }
    
    if (data) {
      setInteractionId(data.id);
      setShowChat(true);
    }
    setShowFeedback(true);
  };

  const handleFeedback = async (positive: boolean) => {
    if (interactionId) {
      await addFeedback(interactionId, positive ? 'positive' : 'negative');
    }
    
    toast.success(positive ? t('reveal.feedbackPositive') : t('reveal.feedbackNegative'));
    navigate('/map');
  };

  const handleSkip = () => {
    navigate('/map');
  };

  if (showFeedback) {
    return (
      <PageLayout className="flex flex-col items-center justify-center px-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-8">{t('reveal.howWasIt')}</h2>
        
        <div className="flex gap-6 mb-8">
          <button
            onClick={() => handleFeedback(true)}
            className="w-24 h-24 rounded-2xl bg-signal-green/20 border-2 border-signal-green flex items-center justify-center text-5xl transition-all hover:scale-110 active:scale-95 glow-green"
          >
            😊
          </button>
          <button
            onClick={() => handleFeedback(false)}
            className="w-24 h-24 rounded-2xl bg-signal-red/20 border-2 border-signal-red flex items-center justify-center text-5xl transition-all hover:scale-110 active:scale-95"
          >
            😕
          </button>
        </div>
        
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          {t('skip')}
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout className={cn("flex flex-col animate-slide-up", isVibrating && "animate-pulse")}>
      <header className="safe-top px-6 py-4">
        <button onClick={() => navigate('/map')} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-coral flex items-center justify-center glow-coral animate-pulse-signal overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt={`Avatar ${user.firstName}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary-foreground">{user.firstName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={cn(
                'absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-background',
                user.signal === 'green' && 'bg-signal-green glow-green',
                user.signal === 'yellow' && 'bg-signal-yellow glow-yellow',
                user.signal === 'red' && 'bg-signal-red',
              )} />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground text-center mb-2">{user.firstName}</h1>
          
          {userProfile?.university && (
            <div className="flex items-center justify-center gap-1 mb-4 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm">{userProfile.university}</span>
            </div>
          )}

          {userId && <VerificationBadges userId={userId} className="justify-center mb-4" />}

          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
              <span>{activityData?.emoji}</span>
              <span className="text-sm text-foreground">{activityData?.label}</span>
            </div>
            <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatTimeSince(user.activeSince)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 mb-8">
            <Star className="h-5 w-5 text-signal-yellow fill-signal-yellow" />
            <span className="font-semibold text-foreground">{user.rating.toFixed(1)}</span>
          </div>

          <IcebreakerCard icebreaker={icebreaker} onRefresh={handleRefreshIcebreaker} />
          
          <div className="flex justify-center mt-4">
            <VoiceIcebreakerButton text={icebreaker} />
          </div>

          <p className="text-center text-muted-foreground mt-4">
            📍 {user.distance ? formatDistance(user.distance) : t('reveal.nearby')}
          </p>
        </div>
      </div>

      {showChat && interactionId && (
        <div className="px-6 pb-4">
          <MiniChat interactionId={interactionId} otherUserName={user.firstName} className="glass rounded-2xl" />
        </div>
      )}

      <div className="px-6 pb-8 space-y-3">
        {!showChat ? (
          <>
            <Button
              onClick={handleTalked}
              className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
              aria-label={t('reveal.talkConfirm')}
            >
              {t('reveal.iTalked')}
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/map')}
                className="flex-1 h-14 rounded-xl text-muted-foreground"
                aria-label={t('reveal.backToMap')}
              >
                {t('reveal.notNow')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/report', { state: { reportedUserId: userId } })}
                className="h-14 px-4 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                aria-label={t('reveal.reportUser')}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <Button variant="outline" onClick={() => navigate('/map')} className="w-full h-14 rounded-xl">
            {t('reveal.backToMap')}
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
