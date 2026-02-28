import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Check, Zap, Shield, Infinity as InfinityIcon, Loader2, ExternalLink, Ticket, Sparkles, Radio, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { logger } from '@/lib/logger';
import { useSessionQuota } from '@/hooks/useSessionQuota';
import { useTranslation } from '@/lib/i18n';
import { celebrationBurst } from '@/components/binome';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

export default function PremiumPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { 
    status, 
    isLoading: isCheckingSubscription, 
    createNearvityPlusCheckout, 
    purchaseSession,
    confirmSessionPurchase,
    openCustomerPortal, 
    checkSubscription 
  } = useSubscription();
  const { usage, refetch: refetchQuota, purchasedSessions, freeRemaining } = useSessionQuota();
  const [isLoading, setIsLoading] = useState<'nearvityplus' | 'session' | 'portal' | null>(null);
  const [sessionQuantity, setSessionQuantity] = useState(1);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successType, setSuccessType] = useState<'subscription' | 'session' | null>(null);

  const isPremium = profile?.is_premium || status?.subscribed;
  const dateLocale = locale === 'fr' ? fr : enUS;

  const NEARVITY_PLUS_FEATURES = [
    {
      icon: <InfinityIcon className="h-5 w-5" />,
      title: t('premium.unlimitedSessions'),
      description: t('premium.unlimitedSessionsDesc')
    },
    {
      icon: <Radio className="h-5 w-5" />,
      title: t('premium.liveMode'),
      description: t('premium.liveModeDesc')
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: t('premium.ghostMode'),
      description: t('premium.ghostModeDesc')
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: t('premium.prioritySupport'),
      description: t('premium.prioritySupportDesc')
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: t('premium.premiumBadge'),
      description: t('premium.premiumBadgeDesc')
    },
  ];

  const FREE_FEATURES = [
    t('premium.freeSessions'),
    t('premium.freeLiveMode'),
    t('premium.freeCommunity'),
  ];

  // Handle success/cancel URL params — F9: persistent banner + confetti
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionPurchased = searchParams.get('session_purchased');
    const checkoutSessionId = searchParams.get('checkout_session_id');

    if (success === 'true') {
      setShowSuccessBanner(true);
      setSuccessType('subscription');
      celebrationBurst();
      toast.success(t('premium.welcomeNearvityPlus'));
      checkSubscription();
      navigate('/premium', { replace: true });
    } else if (sessionPurchased && checkoutSessionId) {
      const count = parseInt(sessionPurchased, 10);
      if (!isNaN(count) && count > 0) {
        confirmSessionPurchase(count, checkoutSessionId)
          .then(() => {
            const message = count > 1 
              ? t('premium.sessionsAddedPlural', { count }) 
              : t('premium.sessionsAdded', { count });
            toast.success(`🎫 ${message}`);
            setShowSuccessBanner(true);
            setSuccessType('session');
            celebrationBurst();
            refetchQuota();
          })
          .catch((err) => {
            logger.api.error('subscriptions', 'confirm-purchase', String(err));
            toast.error(t('premium.confirmError'));
          });
      }
      navigate('/premium', { replace: true });
    } else if (canceled === 'true') {
      toast(t('premium.paymentCanceled'), { icon: '🔙' });
      navigate('/premium', { replace: true });
    }
  }, [searchParams, navigate, checkSubscription, confirmSessionPurchase, refetchQuota, t]);

  // F7: Use redirect instead of new tab
  const handleNearvityPlusSubscribe = async () => {
    if (!user) {
      toast.error(t('premium.loginFirst'));
      navigate('/onboarding');
      return;
    }

    setIsLoading('nearvityplus');

    try {
      const checkoutUrl = await createNearvityPlusCheckout();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      logger.api.error('subscriptions', 'subscribe', String(error));
      toast.error(error instanceof Error ? error.message : t('errors.generic'));
    } finally {
      setIsLoading(null);
    }
  };

  const handleBuySession = async () => {
    if (!user) {
      toast.error(t('premium.loginFirst'));
      navigate('/onboarding');
      return;
    }

    setIsLoading('session');

    try {
      const checkoutUrl = await purchaseSession(sessionQuantity);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      logger.api.error('subscriptions', 'purchase-session', String(error));
      toast.error(error instanceof Error ? error.message : t('errors.generic'));
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
      logger.api.error('subscriptions', 'portal', String(error));
      toast.error(error instanceof Error ? error.message : t('errors.generic'));
    } finally {
      setIsLoading(null);
    }
  };

  // Premium user view
  if (isPremium) {
    return (
      <PageLayout className="pb-8 safe-bottom">
        <header className="safe-top px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('premium.nearvityPlusTitle')}</h1>
        </header>

        <div className="px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-signal-yellow flex items-center justify-center mx-auto mb-6 shadow-lg glow-coral">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('premium.welcomeNearvityPlus')}</h2>
          <p className="text-muted-foreground mb-2">{t('premium.thanksForSupport')}</p>
          
          {status?.subscriptionEnd && (
            <p className="text-sm text-muted-foreground mb-8">
              {t('premium.renewsOn')} {format(new Date(status.subscriptionEnd), 'd MMMM yyyy', { locale: dateLocale })}
            </p>
          )}

          <Card className="glass text-left mb-6">
            <CardContent className="py-6 space-y-4">
              {NEARVITY_PLUS_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center text-coral">{feature.icon}</div>
                  <div>
                    <p className="font-medium text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Check className="h-5 w-5 text-signal-green ml-auto" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleManageSubscription} disabled={isLoading === 'portal'} variant="outline" className="w-full">
            {isLoading === 'portal' ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <><ExternalLink className="h-4 w-4 mr-2" />{t('premium.manageSubscription')}</>
            )}
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('premium.title')}</h1>
      </header>

      <motion.div 
        className="px-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* F9: Persistent success banner */}
        <AnimatePresence>
          {showSuccessBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-signal-green/10 border border-signal-green/30"
            >
              <PartyPopper className="h-5 w-5 text-signal-green shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {successType === 'subscription' ? t('premium.welcomeNearvityPlus') : t('premium.sessionsPurchasedSuccess')}
                </p>
                <p className="text-xs text-muted-foreground">{t('premium.enjoyFeatures')}</p>
              </div>
              <button onClick={() => setShowSuccessBanner(false)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current status */}
        {usage && (
          <Card className="glass border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('premium.yourSessions')}</p>
                  <p className="text-lg font-bold text-foreground">
                    {usage.sessionsCreated} / {usage.sessionsLimit === -1 ? '∞' : usage.sessionsLimit}
                  </p>
                </div>
                {purchasedSessions > 0 && (
                  <Badge variant="secondary" className="bg-signal-yellow/20 text-signal-yellow">
                    <Ticket className="h-3 w-3 mr-1" />
                    {purchasedSessions} {purchasedSessions > 1 ? t('premium.purchasedPlural') : t('premium.purchased')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* F3: Nearvity+ FIRST (recommended, hero position) */}
        <Card className="glass border-coral/30 bg-coral/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-coral to-coral-light text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
            {t('premium.recommended')}
          </div>
          <CardContent className="py-6 pt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center">
                <Crown className="h-5 w-5 text-coral" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{t('premium.nearvityPlusTitle')}</h3>
                <p className="text-2xl font-bold text-foreground">
                  9,90€ <span className="text-sm font-normal text-muted-foreground">{t('premium.perMonth')}</span>
                </p>
              </div>
            </div>
            
            {/* F8: ROI anchor line */}
            <p className="text-xs text-coral font-medium mb-4 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t('premium.roiAnchor')}
            </p>

            <div className="space-y-3 mb-6">
              {NEARVITY_PLUS_FEATURES.map((feature, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-coral/20 flex items-center justify-center text-coral">{feature.icon}</div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleNearvityPlusSubscribe}
              disabled={isLoading === 'nearvityplus'}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral glow-coral"
            >
              {isLoading === 'nearvityplus' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <><Crown className="h-5 w-5 mr-2" />{t('premium.subscribe')}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Pay-per-use (second) */}
        <Card className="glass border-signal-yellow/30 bg-signal-yellow/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-signal-yellow/20 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-signal-yellow" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{t('premium.sessionUnit')}</h3>
                <p className="text-2xl font-bold text-foreground">
                  0,99€ <span className="text-sm font-normal text-muted-foreground">{t('premium.perSession')}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{t('premium.buyMore')}</p>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center bg-muted rounded-xl">
                <button
                  onClick={() => setSessionQuantity(Math.max(1, sessionQuantity - 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted-foreground/10 rounded-l-xl transition-colors"
                  disabled={sessionQuantity <= 1}
                >-</button>
                <span className="px-4 py-2 font-bold text-foreground min-w-[40px] text-center">{sessionQuantity}</span>
                <button
                  onClick={() => setSessionQuantity(Math.min(10, sessionQuantity + 1))}
                  className="px-3 py-2 text-foreground hover:bg-muted-foreground/10 rounded-r-xl transition-colors"
                  disabled={sessionQuantity >= 10}
                >+</button>
              </div>
              <span className="text-muted-foreground">= {(sessionQuantity * 0.99).toFixed(2)}€</span>
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
                  {sessionQuantity > 1 
                    ? t('premium.buySessionsPlural', { count: sessionQuantity })
                    : t('premium.buySessions', { count: sessionQuantity })}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* FREE Tier (last) */}
        <Card className="glass border-border/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{t('premium.freeTitle')}</h3>
                <p className="text-2xl font-bold text-foreground">0€</p>
              </div>
              {!isPremium && (
                <Badge className="ml-auto bg-signal-green/20 text-signal-green border-signal-green/30">
                  {t('premium.yourPlan')}
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

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          {t('premium.termsNote')}
          <br />
          {t('premium.bySubscribing')}{' '}
          <button onClick={() => navigate('/terms')} className="text-coral hover:underline">
            {t('premium.termsOfUse')}
          </button>.
        </p>
      </motion.div>
    </PageLayout>
  );
}
