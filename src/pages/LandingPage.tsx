import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, forwardRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Helmet } from 'react-helmet-async';
import { Users, Sparkles, MapPin, Zap, Eye, Handshake } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  FloatingOrbs,
  LandingHeader,
  HeroSection,
  AppPreviewSection,
  RevealText,
  FeatureCard,
  UseCasesSection,
  GuaranteeSection,
  FinalCTASection,
  LandingFooter,
  SocialProofBar,
  PricingPreviewSection,
  LandingTestimonialsSection,
  ErasmusFeaturesSection,
  ComparisonSection,
  TrustedBySection,
} from '@/components/landing';

// How It Works — 3 simple steps (replaces old Problem + SignalExplanation)
const HowItWorksSection = forwardRef<HTMLElement>(function HowItWorksSection(_props, ref) {
  const { t } = useTranslation();

  const steps = [
    { icon: Zap, title: t('landing.step1Title'), desc: t('landing.step1Desc'), num: '1' },
    { icon: Eye, title: t('landing.step2Title'), desc: t('landing.step2Desc'), num: '2' },
    { icon: Handshake, title: t('landing.step3Title'), desc: t('landing.step3Desc'), num: '3' },
  ];

  return (
    <section ref={ref} id="how-it-works" className="py-16 px-6 relative z-10 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('landing.howItWorksTitle')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            {t('landing.howItWorksSubtitle')}
          </p>
        </RevealText>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <RevealText key={i} delay={i * 0.15}>
              <motion.div
                className="relative text-center p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md"
                whileHover={{ y: -4 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-light flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {step.num}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-coral/15 to-coral/5 flex items-center justify-center mx-auto mt-4 mb-4 border border-coral/10">
                  <step.icon className="h-7 w-7 text-coral" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});

// Combined Features + Use Cases section
const FeaturesSection = forwardRef<HTMLElement>(function FeaturesSection(_props, ref) {
  const { t } = useTranslation();

  return (
    <section ref={ref} className="py-16 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('landing.whyItChanges')}
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
            {t('landing.worksEverywhere')}
          </p>
        </RevealText>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <FeatureCard
            icon={Users}
            title={t('landing.fightLoneliness')}
            description={t('landing.fightLonelinessDesc')}
            delay={0}
            size="large"
            className="md:row-span-2"
          />
          <FeatureCard
            icon={Sparkles}
            title={t('landing.noAwkwardApproach')}
            description={t('landing.noAwkwardApproachDesc')}
            delay={0.1}
          />
          <FeatureCard
            icon={MapPin}
            title={t('landing.anchoredInReal')}
            description={t('landing.anchoredInRealDesc')}
            delay={0.2}
          />
        </div>
      </div>
    </section>
  );
});


export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, locale } = useTranslation();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map');
    }
  }, [isAuthenticated, navigate]);

  const jsonLdApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NEARVITY',
    url: SITE_URL,
    applicationCategory: 'SocialNetworkingApplication',
    operatingSystem: 'Web',
    description: locale === 'fr'
      ? 'L\'app des rencontres spontanées entre étudiants. Active ton signal, vois qui est dispo près de toi, retrouve-toi en vrai.'
      : 'The app for spontaneous meetups between students. Activate your signal, see who\'s available near you, meet up in real life.',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'EUR', name: 'Free' },
      { '@type': 'Offer', price: '0.99', priceCurrency: 'EUR', name: 'Session unitaire' },
      { '@type': 'Offer', price: '9.90', priceCurrency: 'EUR', name: 'Nearvity+' },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'EmotionsCare SASU',
      url: `${SITE_URL}/about`,
    },
  };

  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NEARVITY',
    alternateName: 'Nearvity',
    url: SITE_URL,
    description: locale === 'fr'
      ? 'L\'app des rencontres spontanées entre étudiants. Retrouve-toi en vrai, en quelques minutes.'
      : 'The app for spontaneous student meetups. Meet up in real life, in minutes.',
    inLanguage: [locale === 'fr' ? 'fr-FR' : 'en'],
    publisher: {
      '@type': 'Organization',
      name: 'EmotionsCare SASU',
      url: SITE_URL,
    },
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-coral focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">
        {t('a11y.skipToContent')}
      </a>
      <Helmet>
        <title>{locale === 'fr' ? 'NEARVITY — Ne mange, révise ou fais du sport plus jamais seul' : 'NEARVITY — Never eat, study or work out alone again'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'Active ton signal, vois qui est dispo près de toi, retrouve-toi en vrai. L\'app des rencontres spontanées entre étudiants. Gratuit.'
          : 'Activate your signal, see who\'s available near you, meet up in real life. The app for spontaneous meetups between students. Free.'
        } />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content={locale === 'fr' ? 'NEARVITY — L\'app des rencontres spontanées entre étudiants' : 'NEARVITY — The app for spontaneous meetups between students'} />
        <meta property="og:description" content={locale === 'fr'
          ? 'Active ton signal, vois qui est dispo autour de toi. Rencontres IRL entre étudiants en quelques minutes. Gratuit.'
          : 'Activate your signal, see who\'s available around you. IRL student meetups in minutes. Free.'
        } />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="NEARVITY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={locale === 'fr' ? 'NEARVITY — L\'app des rencontres spontanées entre étudiants' : 'NEARVITY — Spontaneous student meetups, IRL'} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdApp)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdWebSite)}</script>
      </Helmet>
      <FloatingOrbs scrollProgress={scrollYProgress} />
      <LandingHeader />
      <main id="main-content" role="main">
        <HeroSection heroOpacity={heroOpacity} heroScale={heroScale} />
        <SocialProofBar />
        <HowItWorksSection />

        {/* Before/After comparison */}
        <section className="py-12 px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <RevealText>
              <p className="text-center text-muted-foreground mb-2 text-sm">{t('landing.weConnectIntentions')}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('landing.weConnectIntentions2')}</h2>
            </RevealText>
            <ComparisonSection />
          </div>
        </section>

        <AppPreviewSection />
        <FeaturesSection />
        <UseCasesSection />
        <GuaranteeSection />
        <LandingTestimonialsSection />
        <PricingPreviewSection />
        <TrustedBySection />
        <FinalCTASection />
        <ErasmusFeaturesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
