import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { Users, Sparkles, MapPin } from 'lucide-react';
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
} from '@/components/landing';

// Problem Section
function ProblemSection() {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 px-6 relative z-10">
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
}

// Signal Explanation Section
function SignalExplanationSection() {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 px-6 relative z-10 bg-card/30">
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
}

// Features Grid Section
function FeaturesSection() {
  const { t } = useTranslation();
  
  return (
    <section id="features" className="py-12 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t('landing.whyItChanges')}
          </h2>
        </RevealText>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Users}
            title={t('landing.fightLoneliness')}
            description={t('landing.fightLonelinessDesc')}
            delay={0}
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
}

// Comparison Wrapper Section
function ComparisonWrapper() {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 px-6 relative z-10 bg-card/30">
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
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <FloatingOrbs />
      <LandingHeader />
      <HeroSection heroOpacity={heroOpacity} heroScale={heroScale} />
      
      <AppPreviewSection />
      <ProblemSection />
      <SignalExplanationSection />
      <FeaturesSection />
      <ComparisonWrapper />
      <UseCasesSection />
      <GuaranteeSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  );
}
