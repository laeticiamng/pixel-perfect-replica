import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Ticket, Sparkles, Shield, Radio, Zap, Infinity } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const freeFeatures = [
    t('pricing.freeRadar'),
    t('pricing.freeSessions'),
    t('pricing.freeEvents'),
    t('pricing.freeMessaging'),
    t('pricing.freeSafety'),
    t('pricing.freeGdpr'),
  ];

  return (
    <PageLayout showSidebar={false}>
      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('pricing.title')}</h1>
        </header>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-signal-green to-emerald-500 bg-clip-text text-transparent">
            {t('pricing.freeForever')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.section>

        {/* Free Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-card border-signal-green/30 bg-signal-green/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-signal-green to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
              {t('pricing.freeForever')}
            </div>
            <CardContent className="py-6 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-signal-green/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-signal-green" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">NEARVITY</h3>
                  <p className="text-3xl font-black text-foreground">0€</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {t('pricing.freeForeverDesc')}
              </p>

              <h4 className="text-sm font-semibold text-foreground mb-3">
                {t('pricing.whatsIncluded')}
              </h4>
              <ul className="space-y-3">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-signal-green mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate('/onboarding')}
                size="lg"
                className="w-full mt-6 h-12 text-base font-semibold bg-gradient-to-r from-signal-green to-emerald-500 hover:from-emerald-600 hover:to-emerald-500"
              >
                {t('landing.createMyAccount')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Want more? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-center mb-6">{t('pricing.wantMore')}</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* NEARVITY+ */}
            <Card className="glass-card border-coral/30 bg-coral/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{t('pricing.nearvityPlus')}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      9,90€ <span className="text-sm font-normal text-muted-foreground">{t('pricing.perMonth')}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('pricing.nearvityPlusDesc')}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Infinity className="h-4 w-4 text-coral" />
                    {t('premium.unlimitedSessions')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-coral" />
                    {t('premium.ghostMode')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-coral" />
                    {t('premium.prioritySupport')}
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/premium')}
                  variant="outline"
                  className="w-full border-coral/50 hover:bg-coral/10"
                >
                  {t('pricing.seeDetails')}
                </Button>
              </CardContent>
            </Card>

            {/* Session Pack */}
            <Card className="glass-card border-signal-yellow/30 bg-signal-yellow/5">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-signal-yellow/20 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-signal-yellow" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{t('pricing.sessionPack')}</h3>
                    <p className="text-2xl font-bold text-foreground">
                      0,99€ <span className="text-sm font-normal text-muted-foreground">{t('pricing.perSession')}</span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('pricing.sessionPackDesc')}
                </p>
                <Button
                  onClick={() => navigate('/premium')}
                  variant="outline"
                  className="w-full border-signal-yellow/50 hover:bg-signal-yellow/10"
                >
                  {t('pricing.seeDetails')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* No hidden fees */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground pb-8"
        >
          {t('pricing.noHiddenFees')}
        </motion.p>

        {/* Back */}
        <div className="text-center pb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('help.backToHome')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
