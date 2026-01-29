import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Flag, GraduationCap, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IcebreakerCard } from '@/components/IcebreakerCard';
import { PageLayout } from '@/components/PageLayout';
import { VerificationBadges } from '@/components/VerificationBadges';
import { MiniChat } from '@/components/MiniChat';
import { useActiveSignal } from '@/hooks/useActiveSignal';
import { useInteractions } from '@/hooks/useInteractions';
import { ACTIVITIES, ICEBREAKERS } from '@/types/signal';
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
  const { userId } = useParams();
  const { nearbyUsers } = useActiveSignal();
  const { createInteraction, addFeedback } = useInteractions();
  
  const [icebreaker, setIcebreaker] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const user = nearbyUsers.find(u => u.id === userId);

  // Fetch extended profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      const { data } = await supabase
        .rpc('get_safe_public_profile', { profile_id: userId });
      if (data && data[0]) {
        setUserProfile({
          avatar_url: data[0].avatar_url,
          bio: null, // Bio is private, we only show public fields
          university: data[0].university,
        });
      }
    };
    fetchProfile();
  }, [userId]);

  const generateIcebreaker = useCallback(() => {
    if (user) {
      const icebreakers = ICEBREAKERS[user.activity as keyof typeof ICEBREAKERS] || ICEBREAKERS.other;
      setIcebreaker(icebreakers[Math.floor(Math.random() * icebreakers.length)]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      generateIcebreaker();
      
      // Vibrate on reveal
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
        setIsVibrating(true);
        setTimeout(() => setIsVibrating(false), 300);
      }
    }
  }, [user, generateIcebreaker]);

  if (!user) {
    return (
      <PageLayout className="flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">👻</div>
          <p className="text-foreground font-medium mb-2">Utilisateur non trouvé</p>
          <p className="text-muted-foreground text-sm mb-6">
            Cette personne a peut-être désactivé son signal
          </p>
          <Button 
            onClick={() => navigate('/map')}
            className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            Retour à la carte
          </Button>
        </div>
      </PageLayout>
    );
  }

  const activityData = ACTIVITIES.find(a => a.id === user.activity);

  const handleRefreshIcebreaker = () => {
    generateIcebreaker();
    toast.success('Nouvel icebreaker !');
  };

  const handleTalked = async () => {
    // Create interaction in database
    const { data, error } = await createInteraction(
      user.id,
      user.activity,
      icebreaker
    );
    
    if (error) {
      toast.error('Erreur lors de l\'enregistrement');
      return;
    }
    
    if (data) {
      setInteractionId(data.id);
      setShowChat(true); // Show mini chat after interaction created
    }
    setShowFeedback(true);
  };

  const handleFeedback = async (positive: boolean) => {
    if (interactionId) {
      await addFeedback(interactionId, positive ? 'positive' : 'negative');
    }
    
    toast.success(positive ? 'Super ! Continue comme ça 🎉' : 'Pas de souci, ça arrive !');
    navigate('/map');
  };

  const handleSkip = () => {
    navigate('/map');
  };

  if (showFeedback) {
    return (
      <PageLayout className="flex flex-col items-center justify-center px-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground mb-8">
          Comment c'était ?
        </h2>
        
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
        
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          Passer
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout className={cn(
      "flex flex-col animate-slide-up",
      isVibrating && "animate-pulse"
    )}>
      {/* Header */}
      <header className="safe-top px-6 py-4">
        <button
          onClick={() => navigate('/map')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
      </header>

      {/* Profile Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-coral flex items-center justify-center glow-coral animate-pulse-signal overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={`Avatar de ${user.firstName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary-foreground">
                    {user.firstName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Signal indicator */}
              <div className={cn(
                'absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-background',
                user.signal === 'green' && 'bg-signal-green glow-green',
                user.signal === 'yellow' && 'bg-signal-yellow glow-yellow',
                user.signal === 'red' && 'bg-signal-red',
              )} />
            </div>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold text-foreground text-center mb-2">
            {user.firstName}
          </h1>
          
          {/* University badge */}
          {userProfile?.university && (
            <div className="flex items-center justify-center gap-1 mb-4 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm">{userProfile.university}</span>
            </div>
          )}

          {/* Verification Badges */}
          {userId && (
            <VerificationBadges userId={userId} className="justify-center mb-4" />
          )}

          {/* Activity & Time */}
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

          {/* Rating */}
          <div className="flex items-center justify-center gap-1 mb-8">
            <Star className="h-5 w-5 text-signal-yellow fill-signal-yellow" />
            <span className="font-semibold text-foreground">{user.rating.toFixed(1)}</span>
          </div>

          {/* Icebreaker */}
          <IcebreakerCard
            icebreaker={icebreaker}
            onRefresh={handleRefreshIcebreaker}
          />

          {/* Distance */}
          <p className="text-center text-muted-foreground mt-4">
            📍 {user.distance ? formatDistance(user.distance) : 'Tout près'}
          </p>
        </div>
      </div>

      {/* Mini Chat - shows after interaction */}
      {showChat && interactionId && (
        <div className="px-6 pb-4">
          <MiniChat 
            interactionId={interactionId} 
            otherUserName={user.firstName}
            className="glass rounded-2xl"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-8 space-y-3">
        {!showChat ? (
          <>
            <Button
              onClick={handleTalked}
              className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
              aria-label="Confirmer que j'ai parlé à cette personne"
            >
              J'ai parlé ✓
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/map')}
                className="flex-1 h-14 rounded-xl text-muted-foreground"
                aria-label="Retourner à la carte"
              >
                Pas maintenant
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/report', { state: { reportedUserId: userId } })}
                className="h-14 px-4 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                aria-label="Signaler cet utilisateur"
              >
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate('/map')}
            className="w-full h-14 rounded-xl"
          >
            Retour à la carte
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
