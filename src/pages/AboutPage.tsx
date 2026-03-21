import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { useTranslation } from '@/lib/i18n';
import { SUPPORT_EMAIL, SITE_URL } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft, Users, Heart, Shield, Rocket, Mail, MessageCircle,
  MapPin, Zap, BookOpen, HandshakeIcon, Eye, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5 },
});

export default function AboutPage() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const values = [
    { icon: Heart, title: t('about.authenticity'), description: t('about.authenticityDesc'), gradient: 'from-coral to-coral-dark' },
    { icon: Shield, title: t('about.security'), description: t('about.securityDesc'), gradient: 'from-signal-green to-emerald-500' },
    { icon: Rocket, title: t('about.innovation'), description: t('about.innovationDesc'), gradient: 'from-purple-500 to-indigo-500' },
    { icon: Users, title: t('about.community'), description: t('about.communityDesc'), gradient: 'from-blue-500 to-cyan-500' },
  ];

  const steps = [
    { icon: Zap, text: t('about.howStep1') },
    { icon: Eye, text: t('about.howStep2') },
    { icon: HandshakeIcon, text: t('about.howStep3') },
    { icon: Sparkles, text: t('about.howStep4') },
  ];

  const manifesto = [
    t('about.manifesto1'),
    t('about.manifesto2'),
    t('about.manifesto3'),
    t('about.manifesto4'),
    t('about.manifesto5'),
  ];

  const figures = [
    { label: t('about.figLaunch'), value: '2025' },
    { label: t('about.figActivities'), value: '6+' },
    { label: t('about.figGDPR'), value: '100%' },
    { label: t('about.figMadeIn'), value: '🇫🇷' },
  ];

  // JSON-LD for GEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'EmotionsCare SASU',
      brand: { '@type': 'Brand', name: 'NEARVITY' },
      description: locale === 'fr'
        ? 'L\'app des rencontres spontanées entre étudiants. Connecte des intentions réelles pour des meetups IRL autour d\'activités.'
        : 'The app for spontaneous meetups between students. Connects real intentions for IRL activity-based meetings.',
      url: SITE_URL,
      foundingDate: '2025',
      foundingLocation: { '@type': 'Place', name: 'France' },
      sameAs: [],
      knowsAbout: [
        'Spontaneous student meetups',
        'Activity-based matching',
        'Student connection platform',
        'Consent-first interactions',
        'GDPR-compliant geolocation',
      ],
    },
  };

  return (
    <PageLayout showSidebar={false}>
      <Helmet>
        <title>{locale === 'fr' ? 'À propos de NEARVITY — Mission, Équipe & Valeurs' : 'About NEARVITY — Mission, Team & Values'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'Découvrez la mission de NEARVITY — l\'app des rencontres spontanées entre étudiants. Conçue en France par EmotionsCare SASU.'
          : 'Discover NEARVITY\'s mission — the app for spontaneous meetups between students. Built in France by EmotionsCare SASU.'
        } />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <meta property="og:title" content={locale === 'fr' ? 'À propos de NEARVITY — Mission & Valeurs' : 'About NEARVITY — Mission & Values'} />
        <meta property="og:description" content={locale === 'fr'
          ? 'L\'app des rencontres spontanées entre étudiants, conçue en France par EmotionsCare SASU.'
          : 'The app for spontaneous student meetups, built in France by EmotionsCare SASU.'
        } />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'NEARVITY', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: locale === 'fr' ? 'À propos' : 'About', item: `${SITE_URL}/about` },
          ],
        })}</script>
      </Helmet>

      <article className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('about.title')}</h1>
        </header>

        {/* Hero */}
        <motion.section {...fadeUp()} className="text-center mb-14">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg shadow-coral/20">
            <span className="text-white font-bold text-3xl">N</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-coral to-coral-dark bg-clip-text text-transparent leading-tight">
            NEARVITY
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
          {/* NOT a dating app badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-coral/30 bg-coral/5 text-sm font-medium text-coral">
            <Shield className="w-4 h-4" />
            {t('about.notDatingApp')}
          </div>
        </motion.section>

        {/* Origin Story */}
        <motion.section {...fadeUp(0.1)} className="mb-12">
          <Card className="glass-card border-muted/30 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-coral" />
                {t('about.originTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[0.95rem]">
                {t('about.originText')}
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Mission */}
        <motion.section {...fadeUp(0.15)} className="mb-12">
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral" />
                {t('about.missionTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[0.95rem]">
                {t('about.missionText')}
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* How It Works */}
        <motion.section {...fadeUp(0.2)} className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">{t('about.howItWorksTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div key={i} {...fadeUp(0.2 + i * 0.07)}>
                <Card className="glass-card border-muted/30 h-full">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-coral/20 to-coral-dark/20 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-coral" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-coral mb-1 block">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Activity-based meetups callout */}
        <motion.section {...fadeUp(0.25)} className="mb-12">
          <Card className="border-coral/30 bg-coral/5">
            <CardContent className="p-6 sm:p-8 text-center">
              <Shield className="w-8 h-8 text-coral mx-auto mb-3" />
              <h3 className="text-lg font-bold text-coral mb-2">{t('about.notDatingApp')}</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">{t('about.notDatingDesc')}</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Key Figures */}
        <motion.section {...fadeUp(0.3)} className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">{t('about.keyFigures')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {figures.map((fig, i) => (
              <Card key={i} className="glass-card border-muted/30 text-center">
                <CardContent className="p-5">
                  <p className="text-2xl font-bold text-coral mb-1">{fig.value}</p>
                  <p className="text-xs text-muted-foreground">{fig.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Values */}
        <motion.section {...fadeUp(0.35)} className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-center">{t('about.valuesTitle')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((value, i) => (
              <motion.div key={value.title} {...fadeUp(0.35 + i * 0.07)}>
                <Card className="glass-card border-muted/30 h-full hover:border-coral/30 transition-colors">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-3`}>
                      <value.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Manifesto */}
        <motion.section {...fadeUp(0.4)} className="mb-12">
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-coral" />
                {t('about.manifestoTitle')}
              </h3>
              <ul className="space-y-3">
                {manifesto.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-coral font-bold mt-0.5">✦</span>
                    <p className="text-muted-foreground text-[0.95rem] italic">{item}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.section>

        {/* Team */}
        <motion.section {...fadeUp(0.45)} className="mb-12">
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-coral" />
                {t('about.teamTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 text-[0.95rem]">
                {t('about.teamText')}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                    <span className="text-white font-bold text-xs">EC</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">EmotionsCare SASU</p>
                    <p className="text-xs text-muted-foreground">{t('about.founderRole')} · France 🇫🇷</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t('about.madeWithLove')}</p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Contact */}
        <motion.section {...fadeUp(0.5)} className="mb-8">
          <Card className="glass-card border-muted/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-coral" />
                {t('about.contactTitle')}
              </h3>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-coral transition-colors"
              >
                <Mail className="w-4 h-4" />
                {SUPPORT_EMAIL}
              </a>
            </CardContent>
          </Card>
        </motion.section>

        {/* Back */}
        <div className="text-center pb-8">
          <Button variant="outline" onClick={() => navigate(isAuthenticated ? '/profile' : '/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {isAuthenticated ? t('help.backToProfile') : t('help.backToHome')}
          </Button>
        </div>
      </article>
      {isAuthenticated && <BottomNav />}
    </PageLayout>
  );
}
