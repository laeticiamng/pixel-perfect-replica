import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const freeFeatures = [
    t('pricing.featureRadar'),
    t('pricing.featureSignals'),
    t('pricing.featureBinome'),
    t('pricing.featureEvents'),
    t('pricing.featureChat'),
    t('pricing.featureExport'),
    t('pricing.featureSafety'),
  ];

  const premiumFeatures = [
    t('pricing.featureGhost'),
    t('pricing.featureExtendedRadius'),
    t('pricing.featurePriority'),
    t('pricing.featureStats'),
    t('pricing.featureUnlimitedSessions'),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {t('pricing.subtitle')}
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-coral/30 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral to-coral-dark" />
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-coral/10 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-coral" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-coral/10 text-coral text-xs font-semibold mb-2">
                  {t('pricing.mostPopular')}
                </span>
                <h2 className="text-2xl font-bold">{t('pricing.freePlanName')}</h2>
                <p className="text-4xl font-black text-coral mt-2">{t('pricing.freePlanPrice')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('pricing.freeForever')}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground text-sm mb-6">{t('pricing.freePlanDesc')}</p>
                <ul className="space-y-3 mb-8">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-signal-green shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/signup')}
                  className="w-full h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl font-semibold"
                >
                  {t('pricing.getStartedFree')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-muted/30 h-full relative overflow-hidden opacity-80">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">{t('pricing.premiumPlanName')}</h2>
                <p className="text-2xl font-bold text-purple-400 mt-2">{t('pricing.premiumPlanPrice')}</p>
                <p className="text-sm text-muted-foreground mt-1">&nbsp;</p>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground text-sm mb-6">{t('pricing.premiumPlanDesc')}</p>
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {t('pricing.freePlanName')} + :
                </p>
                <ul className="space-y-3 mb-8">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold cursor-not-allowed"
                >
                  {t('pricing.premiumPlanPrice')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.faqTitle')}</h2>
          <div className="space-y-4">
            <Card className="glass-card border-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('pricing.whyFree')}</h3>
                <p className="text-sm text-muted-foreground">{t('pricing.whyFreeAnswer')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{t('pricing.willPriceChange')}</h3>
                <p className="text-sm text-muted-foreground">{t('pricing.willPriceChangeAnswer')}</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      </main>

      <LandingFooter />
    </div>
  );
}
