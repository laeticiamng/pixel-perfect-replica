import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Zap, Shield, Infinity, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PREMIUM_FEATURES = [
  {
    icon: <Infinity className="h-5 w-5" />,
    title: "Créneaux illimités",
    description: "Crée autant de sessions Binôme que tu veux"
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

const PRICING = {
  monthly: {
    price: 4.99,
    period: '/mois',
    label: 'Mensuel',
  },
  yearly: {
    price: 39.99,
    period: '/an',
    label: 'Annuel',
    savings: '33%',
  },
};

export default function PremiumPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { status, isLoading: isCheckingSubscription, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const isPremium = profile?.is_premium || status?.subscribed;

  // Handle success/cancel URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('🎉 Bienvenue dans le club Premium !');
      checkSubscription();
      // Clear URL params
      navigate('/premium', { replace: true });
    } else if (canceled === 'true') {
      toast('Paiement annulé', { icon: '🔙' });
      navigate('/premium', { replace: true });
    }
  }, [searchParams, navigate, checkSubscription]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Connecte-toi d\'abord');
      navigate('/onboarding');
      return;
    }

    setIsLoading(true);

    try {
      const checkoutUrl = await createCheckout(selectedPlan);
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      console.error('[PremiumPage] Subscribe error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const portalUrl = await openCustomerPortal();
      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (error) {
      console.error('[PremiumPage] Portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold text-foreground">Premium</h1>
        </header>

        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-signal-yellow flex items-center justify-center mx-auto mb-6 shadow-lg glow-coral">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tu es Premium ! 🎉
          </h2>
          <p className="text-muted-foreground mb-2">
            Merci pour ton soutien. Profite de tous les avantages !
          </p>
          
          {status?.subscriptionEnd && (
            <p className="text-sm text-muted-foreground mb-8">
              Renouvellement le {format(new Date(status.subscriptionEnd), 'd MMMM yyyy', { locale: fr })}
              {status.plan && ` (plan ${status.plan === 'yearly' ? 'annuel' : 'mensuel'})`}
            </p>
          )}

          <Card className="glass text-left mb-6">
            <CardContent className="py-6 space-y-4">
              {PREMIUM_FEATURES.map((feature, i) => (
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
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
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
        <h1 className="text-xl font-bold text-foreground">Passer Premium</h1>
      </header>

      <motion.div 
        className="px-6 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-signal-yellow flex items-center justify-center mx-auto mb-6 shadow-lg animate-glow-pulse">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Débloque tout le potentiel
          </h2>
          <p className="text-muted-foreground">
            Créneaux illimités, mode fantôme et plus encore
          </p>
        </div>

        {/* Features */}
        <Card className="glass">
          <CardContent className="py-6 space-y-4">
            {PREMIUM_FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center text-coral">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground text-center">
            Choisis ton plan
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-coral bg-coral/10'
                  : 'border-border bg-card hover:border-coral/50'
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">{PRICING.monthly.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {PRICING.monthly.price}€
                <span className="text-sm font-normal text-muted-foreground">{PRICING.monthly.period}</span>
              </p>
            </button>

            {/* Yearly */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-2xl border-2 transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'border-coral bg-coral/10'
                  : 'border-border bg-card hover:border-coral/50'
              }`}
            >
              <Badge className="absolute -top-2 -right-2 bg-signal-green text-white border-0">
                -{PRICING.yearly.savings}
              </Badge>
              <p className="text-sm text-muted-foreground mb-1">{PRICING.yearly.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {PRICING.yearly.price}€
                <span className="text-sm font-normal text-muted-foreground">{PRICING.yearly.period}</span>
              </p>
            </button>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleSubscribe}
          disabled={isLoading}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral glow-coral"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Crown className="h-5 w-5 mr-2" />
              Passer Premium - {selectedPlan === 'monthly' 
                ? `${PRICING.monthly.price}€/mois`
                : `${PRICING.yearly.price}€/an`
              }
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
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
