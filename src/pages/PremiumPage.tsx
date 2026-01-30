import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Zap, Shield, Infinity, Loader2, ExternalLink, Ticket, Sparkles, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useSessionQuota } from '@/hooks/useSessionQuota';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EASY_PLUS_FEATURES = [
  {
    icon: <Infinity className="h-5 w-5" />,
    title: "Sessions illimitées",
    description: "Crée autant de sessions Binôme que tu veux"
  },
  {
    icon: <Radio className="h-5 w-5" />,
    title: "Live Mode",
    description: "Vois qui est disponible en temps réel"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Mode Fantôme",
    description: "Vois les signaux sans être visible"
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Priorité support",
    description: "Réponse sous 4h en semaine"
  },
  {
    icon: <Crown className="h-5 w-5" />,
    title: "Badge Premium",
    description: "Affiche ton statut sur ton profil"
  },
];

const FREE_FEATURES = [
  "2 sessions Binôme / mois",
  "Live Mode inclus",
  "Accès communauté",
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { 
    status, 
    isLoading: isCheckingSubscription, 
    createEasyPlusCheckout, 
    purchaseSession,
    confirmSessionPurchase,
    openCustomerPortal, 
    checkSubscription 
  } = useSubscription();
  const { usage, refetch: refetchQuota, purchasedSessions, freeRemaining } = useSessionQuota();
  const [isLoading, setIsLoading] = useState<'easyplus' | 'session' | 'portal' | null>(null);
  const [sessionQuantity, setSessionQuantity] = useState(1);

  const isPremium = profile?.is_premium || status?.subscribed;

  // Handle success/cancel URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionPurchased = searchParams.get('session_purchased');

    if (success === 'true') {
      toast.success('🎉 Bienvenue dans Easy+ !');
      checkSubscription();
      navigate('/premium', { replace: true });
    } else if (sessionPurchased) {
      const count = parseInt(sessionPurchased, 10);
      if (!isNaN(count) && count > 0) {
        // Confirm the session purchase
        confirmSessionPurchase(count)
          .then(() => {
            toast.success(`🎫 ${count} session${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''} !`);
            refetchQuota();
          })
          .catch((err) => {
            console.error('Error confirming session purchase:', err);
            toast.error('Erreur lors de la confirmation');
          });
      }
      navigate('/premium', { replace: true });
    } else if (canceled === 'true') {
      toast('Paiement annulé', { icon: '🔙' });
      navigate('/premium', { replace: true });
    }
  }, [searchParams, navigate, checkSubscription, confirmSessionPurchase, refetchQuota]);

  const handleEasyPlusSubscribe = async () => {
    if (!user) {
      toast.error('Connecte-toi d\'abord');
      navigate('/onboarding');
      return;
    }

    setIsLoading('easyplus');

    try {
      const checkoutUrl = await createEasyPlusCheckout();
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('[PremiumPage] Subscribe error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(null);
    }
  };

  const handleBuySession = async () => {
    if (!user) {
      toast.error('Connecte-toi d\'abord');
      navigate('/onboarding');
      return;
    }

    setIsLoading('session');

    try {
      const checkoutUrl = await purchaseSession(sessionQuantity);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('[PremiumPage] Purchase session error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading('portal');
    try {
      const portalUrl = await openCustomerPortal();
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (error) {
      console.error('[PremiumPage] Portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(null);
    }
  };

  // Premium user view
  if (isPremium) {
    return (
      <PageLayout className="pb-8 safe-bottom">
        <header className="safe-top px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Easy+</h1>
        </header>

        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-signal-yellow flex items-center justify-center mx-auto mb-6 shadow-lg glow-coral">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tu es Easy+ ! 🎉
          </h2>
          <p className="text-muted-foreground mb-2">
            Merci pour ton soutien. Profite de tous les avantages !
          </p>
          
          {status?.subscriptionEnd && (
            <p className="text-sm text-muted-foreground mb-8">
              Renouvellement le {format(new Date(status.subscriptionEnd), 'd MMMM yyyy', { locale: fr })}
            </p>
          )}

          <Card className="glass text-left mb-6">
            <CardContent className="py-6 space-y-4">
              {EASY_PLUS_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center text-coral">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Check className="h-5 w-5 text-signal-green ml-auto" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            onClick={handleManageSubscription}
            disabled={isLoading === 'portal'}
            variant="outline"
            className="w-full"
          >
            {isLoading === 'portal' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Gérer mon abonnement
              </>
            )}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Offres</h1>
      </header>

      <motion.div 
        className="px-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Current status */}
        {usage && (
          <Card className="glass border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tes sessions ce mois</p>
                  <p className="text-lg font-bold text-foreground">
                    {usage.sessionsCreated} / {usage.sessionsLimit === -1 ? '∞' : usage.sessionsLimit}
                  </p>
                </div>
                {purchasedSessions > 0 && (
                  <Badge variant="secondary" className="bg-signal-yellow/20 text-signal-yellow">
                    <Ticket className="h-3 w-3 mr-1" />
                    {purchasedSessions} achetée{purchasedSessions > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FREE Tier */}
        <Card className="glass border-border/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Free</h3>
                <p className="text-2xl font-bold text-foreground">0€</p>
              </div>
              {!isPremium && (
                <Badge className="ml-auto bg-signal-green/20 text-signal-green border-signal-green/30">
                  Ton plan
                </Badge>
              )}
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-signal-green" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Pay-per-use */}
        <Card className="glass border-signal-yellow/30 bg-signal-yellow/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-signal-yellow/20 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-signal-yellow" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Session à l'unité</h3>
                <p className="text-2xl font-bold text-foreground">
                  0,99€ <span className="text-sm font-normal text-muted-foreground">/ session</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Besoin d'une session en plus ? Achète-en une à l'unité, elle ne périme jamais.
            </p>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-muted rounded-xl">
                <button
                  onClick={() => setSessionQuantity(Math.max(1, sessionQuantity - 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted-foreground/10 rounded-l-xl transition-colors"
                  disabled={sessionQuantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-foreground min-w-[40px] text-center">
                  {sessionQuantity}
                </span>
                <button
                  onClick={() => setSessionQuantity(Math.min(10, sessionQuantity + 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted-foreground/10 rounded-r-xl transition-colors"
                  disabled={sessionQuantity >= 10}
                >
                  +
                </button>
              </div>
              <span className="text-muted-foreground">
                = {(sessionQuantity * 0.99).toFixed(2)}€
              </span>
            </div>

            <Button
              onClick={handleBuySession}
              disabled={isLoading === 'session'}
              variant="outline"
              className="w-full border-signal-yellow/50 hover:bg-signal-yellow/10"
            >
              {isLoading === 'session' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Ticket className="h-4 w-4 mr-2" />
                  Acheter {sessionQuantity} session{sessionQuantity > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Easy+ */}
        <Card className="glass border-coral/30 bg-coral/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-coral to-coral-light text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
            RECOMMANDÉ
          </div>
          <CardContent className="py-6 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-coral" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Easy+</h3>
                <p className="text-2xl font-bold text-foreground">
                  9,90€ <span className="text-sm font-normal text-muted-foreground">/ mois</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {EASY_PLUS_FEATURES.map((feature, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-coral/20 flex items-center justify-center text-coral">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleEasyPlusSubscribe}
              disabled={isLoading === 'easyplus'}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral glow-coral"
            >
              {isLoading === 'easyplus' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Crown className="h-5 w-5 mr-2" />
                  Passer à Easy+
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          Annulation possible à tout moment. Paiement sécurisé via Stripe.
          <br />
          En continuant, tu acceptes nos{' '}
          <button 
            onClick={() => navigate('/terms')}
            className="text-coral hover:underline"
          >
            conditions d'utilisation
          </button>.
        </p>
      </motion.div>
    </PageLayout>
  );
}
