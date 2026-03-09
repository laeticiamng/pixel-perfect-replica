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
  ComparisonSection,
  UseCasesSection,
  GuaranteeSection,
  FinalCTASection,
  LandingFooter,
  SocialProofBar,
  PricingPreviewSection,
  LandingTestimonialsSection,
  ErasmusFeaturesSection,
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
    <section ref={ref} className="py-16 px-6 relative z-10">
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

// Features Grid Section - Bento grid layout
const FeaturesSection = forwardRef<HTMLElement>(function FeaturesSection(_props, ref) {
  const { t } = useTranslation();
  
  return (
    <section ref={ref} className="py-16 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t('landing.whyItChanges')}
          </h2>
        </RevealText>
        
        <div className="grid md:grid-cols-2 gap-4">
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
      ? 'Le premier réseau social 100% IRL. Active ton signal, trouve des étudiants qui veulent aussi se rencontrer.'
      : 'The first 100% IRL social network. Activate your signal, find students who also want to meet.',
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
      ? 'Le premier réseau social 100% IRL pour étudiants.'
      : 'The first 100% IRL social network for students.',
    inLanguage: [locale === 'fr' ? 'fr-FR' : 'en'],
    publisher: {
      '@type': 'Organization',
      name: 'EmotionsCare SASU',
      url: SITE_URL,
    },
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <Helmet>
        <title>{locale === 'fr' ? 'NEARVITY — Le réseau social 100% IRL pour étudiants' : 'NEARVITY — The 100% IRL social network for students'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'NEARVITY est le premier réseau social IRL. Active ton signal, vois qui est ouvert à l\'interaction autour de toi. Rencontres spontanées entre étudiants. Gratuit.'
          : 'NEARVITY is the first IRL social network. Activate your signal, see who is open to interact around you. Spontaneous student meetups. Free.'
        } />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content={locale === 'fr' ? 'NEARVITY — Le réseau social 100% IRL pour étudiants' : 'NEARVITY — The 100% IRL social network for students'} />
        <meta property="og:description" content={locale === 'fr'
          ? 'Vois qui est ouvert à l\'interaction autour de toi. Rencontres spontanées IRL entre étudiants. Gratuit.'
          : 'See who is open to interact around you. Spontaneous IRL student meetups. Free.'
        } />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="NEARVITY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={locale === 'fr' ? 'NEARVITY — Réseau social IRL' : 'NEARVITY — IRL Social Network'} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLdApp)}</script>
        <script type="application/ld+json">{JSON.stringify(jsonLdWebSite)}</script>
      </Helmet>
      <FloatingOrbs />
      <LandingHeader />
      <main>
        <HeroSection heroOpacity={heroOpacity} heroScale={heroScale} />
        <AppPreviewSection />
        <SocialProofBar />
        <HowItWorksSection />
        <GuaranteeSection />
        <FeaturesSection />
        <UseCasesSection />
        <ErasmusFeaturesSection />
        <LandingTestimonialsSection />
        <PricingPreviewSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
