import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, forwardRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Helmet } from 'react-helmet-async';
import { Users, Sparkles, MapPin } from 'lucide-react';
import { SITE_URL } from '@/lib/constants';
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
  TrustedBySection,
} from '@/components/landing';

// Problem Section
const ProblemSection = forwardRef<HTMLElement>(function ProblemSection(_props, ref) {
  const { t } = useTranslation();
  
  return (
    <section ref={ref} className="py-12 px-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-center leading-relaxed">
            <span className="text-foreground/70">{t('landing.youWantToMeet')}</span>
            <br />
            <span className="text-foreground/70">{t('landing.butYouNeverKnow')}</span>
            <br />
            <span className="text-foreground font-bold">{t('landing.wantsToBeApproached')}</span>
          </p>
        </RevealText>
        
        <RevealText delay={0.2}>
          <div className="mt-8 text-center">
            <p className="text-lg text-coral font-semibold">{t('landing.untilNow')}</p>
          </div>
        </RevealText>
      </div>
    </section>
  );
});

// Signal Explanation Section
const SignalExplanationSection = forwardRef<HTMLElement>(function SignalExplanationSection(_props, ref) {
  const { t } = useTranslation();
  
  return (
    <section ref={ref} className="py-12 px-6 relative z-10 bg-card/30">
      <div className="max-w-4xl mx-auto text-center">
        <RevealText>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.greenSignalChanges')}
            <br />{t('landing.changesEverything')}
          </h2>
        </RevealText>
        
        <RevealText delay={0.2}>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            {t('landing.whenSomeoneActivates')}
            <br /><span className="text-foreground font-semibold">{t('landing.iAmOpenToInteract')}</span>
          </p>
        </RevealText>
        
        <RevealText delay={0.4}>
          <p className="mt-8 text-sm text-muted-foreground">
            {t('landing.noMoreAwkward')}
            <br />{t('landing.firstStepDone')}
          </p>
        </RevealText>
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
        
        {/* Bento grid - asymmetric layout */}
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

// Comparison Wrapper Section
const ComparisonWrapper = forwardRef<HTMLElement>(function ComparisonWrapper(_props, ref) {
  const { t } = useTranslation();
  
  return (
    <section ref={ref} className="py-12 px-6 relative z-10 bg-card/30">
      <div className="max-w-2xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('landing.weConnectIntentions')}
          </h2>
          <p className="text-xl text-coral font-semibold text-center mb-12">
            {t('landing.weConnectIntentions2')}
          </p>
        </RevealText>
        
        <ComparisonSection />
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
        <TrustedBySection />
        <SocialProofBar />
        <ProblemSection />
        <SignalExplanationSection />
        <FeaturesSection />
        <ComparisonWrapper />
        <UseCasesSection />
        <PricingPreviewSection />
        <LandingTestimonialsSection />
        <GuaranteeSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
