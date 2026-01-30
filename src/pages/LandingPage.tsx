import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
// Animated text that reveals on scroll
function RevealText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating orbs background
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-coral/20 rounded-full blur-[120px] animate-float" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-signal-green/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-coral/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
    </div>
  );
}

// Signal demo animation
function SignalDemo() {
  const { t } = useTranslation();
  const [activeSignal, setActiveSignal] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const signals = [
    { color: 'bg-signal-green', glow: 'glow-green', label: t('activities.studying'), emoji: '📚' },
    { color: 'bg-signal-green', glow: 'glow-green', label: t('activities.sport'), emoji: '🏃' },
    { color: 'bg-signal-yellow', glow: 'glow-yellow', label: t('activities.talking'), emoji: '☕' },
  ];
  
  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 mx-auto">
      {/* Radar circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full border border-coral/20" />
        <div className="absolute w-3/4 h-3/4 rounded-full border border-coral/30" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-coral/40" />
      </div>
      
      {/* Center - You */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg glow-coral">
          <span className="text-white font-bold">T</span>
        </div>
      </div>
      
      {/* Animated signals around */}
      {signals.map((signal, i) => {
        const angle = (i / signals.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 80;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: activeSignal === i ? 1.2 : 1,
              opacity: 1,
              x: x - 20,
              y: y - 20,
            }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
          >
            <div className={`w-10 h-10 rounded-full ${signal.color} ${activeSignal === i ? signal.glow : ''} flex items-center justify-center shadow-md transition-all duration-300`}>
              <span className="text-sm">{signal.emoji}</span>
            </div>
            {activeSignal === i && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground"
              >
                {signal.label}
              </motion.div>
            )}
          </motion.div>
        );
      })}
      
      {/* Radar sweep */}
      <div className="absolute inset-0 animate-radar-sweep origin-center pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 w-1/2 h-0.5"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--coral) / 0.8), transparent)',
            transformOrigin: 'left center',
          }}
        />
      </div>
    </div>
  );
}

// Feature card with hover effect
function FeatureCard({ icon, title, description, delay = 0 }: { icon: string; title: string; description: string; delay?: number }) {
  return (
    <RevealText delay={delay}>
      <motion.div 
        className="group relative p-6 rounded-3xl glass-strong border border-white/5 hover:border-coral/30 transition-all duration-500"
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-coral/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <span className="text-4xl mb-4 block">{icon}</span>
          <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </motion.div>
    </RevealText>
  );
}

// Comparison section
function ComparisonSection() {
  const { t } = useTranslation();
  
  const comparisons = [
    { old: t('landing.imHere'), new: t('landing.imOpenToInteract') },
    { old: t('landing.passiveProfiles'), new: t('landing.activeIntentions') },
    { old: t('landing.hopeForMatch'), new: t('landing.mutualConsent') },
    { old: t('landing.awkwardApproach'), new: t('landing.naturalApproach') },
  ];
  
  return (
    <div className="space-y-4">
      {comparisons.map((item, i) => (
        <RevealText key={i} delay={i * 0.1}>
          <div className="flex items-center gap-4 p-4 rounded-2xl glass">
            <span className="text-muted-foreground line-through text-sm flex-1">{item.old}</span>
            <ArrowRight className="h-4 w-4 text-coral flex-shrink-0" />
            <span className="text-foreground font-semibold text-sm flex-1">{item.new}</span>
          </div>
        </RevealText>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef(null);
  const { t } = useTranslation();
  
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
      
      {/* Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">E</span>
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
              EASY
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => navigate('/install')}
              variant="ghost"
              size="sm"
              className="text-coral hover:text-coral-dark hover:bg-coral/10 gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('landing.install')}</span>
            </Button>
            <LanguageToggle />
            <Button
              onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              {t('auth.signIn')}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section - Full Screen */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 pt-16"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-coral/30">
            <Sparkles className="h-4 w-4 text-coral" />
            <span className="text-sm font-medium text-foreground">{t('landing.meetingsReinvented')}</span>
          </div>
        </motion.div>
        
        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-center tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            {t('landing.seeWhoIsOpen')}
          </span>
          <br />
          <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
            {t('landing.openToInteract')}
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-lg mb-12 leading-relaxed"
        >
          {t('landing.motivationGroups')}
          <br className="hidden sm:block" />
          <span className="text-foreground font-medium">{t('landing.createRealConnections')}</span>
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-lg hover:shadow-coral/25 transition-all duration-300 hover:scale-105"
          >
            {t('landing.getStarted')}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg font-medium rounded-full border-2 border-muted hover:border-coral/50 hover:bg-coral/5 transition-all duration-300"
          >
            {t('auth.signIn')}
          </Button>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-2.5 bg-coral rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Problem Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <RevealText>
            <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-center leading-relaxed">
              <span className="text-muted-foreground">{t('landing.youWantToMeet')}</span>
              <br />
              <span className="text-muted-foreground">{t('landing.butYouNeverKnow')}</span>
              <br />
              <span className="text-foreground font-bold">{t('landing.wantsToBeApproached')}</span>
            </p>
          </RevealText>
          
          <RevealText delay={0.2}>
            <div className="mt-12 text-center">
              <p className="text-lg text-coral font-semibold">{t('landing.untilNow')}</p>
            </div>
          </RevealText>
        </div>
      </section>

      {/* Signal Demo Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <RevealText>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {t('landing.greenSignalChanges')}
              <br />{t('landing.changesEverything')}
            </h2>
          </RevealText>
          
          <RevealText delay={0.2}>
            <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
              {t('landing.whenSomeoneActivates')}
              <br /><span className="text-foreground font-semibold">{t('landing.iAmOpenToInteract')}</span>
            </p>
          </RevealText>
          
          <RevealText delay={0.4}>
            <SignalDemo />
          </RevealText>
          
          <RevealText delay={0.6}>
            <p className="mt-12 text-sm text-muted-foreground">
              {t('landing.noMoreAwkward')}
              <br />{t('landing.firstStepDone')}
            </p>
          </RevealText>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <RevealText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              {t('landing.whyItChanges')}
            </h2>
          </RevealText>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🤝"
              title={t('landing.fightLoneliness')}
              description={t('landing.fightLonelinessDesc')}
              delay={0}
            />
            <FeatureCard
              icon="✨"
              title={t('landing.noAwkwardApproach')}
              description={t('landing.noAwkwardApproachDesc')}
              delay={0.1}
            />
            <FeatureCard
              icon="📍"
              title={t('landing.anchoredInReal')}
              description={t('landing.anchoredInRealDesc')}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-6 relative z-10">
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

      {/* Use Cases */}
      <section className="py-24 px-6 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <RevealText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              {t('landing.worksEverywhere')}
            </h2>
          </RevealText>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '📚', place: t('landing.library'), action: t('landing.studyTogether') },
              { emoji: '🏋️', place: t('landing.gym'), action: t('landing.trainTogether') },
              { emoji: '☕', place: t('landing.cafe'), action: t('landing.chat') },
              { emoji: '💻', place: t('landing.coworking'), action: t('landing.brainstorm') },
            ].map((item, i) => (
              <RevealText key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl glass text-center hover:border-coral/30 border border-transparent transition-all duration-300">
                  <span className="text-4xl mb-3 block">{item.emoji}</span>
                  <p className="font-bold text-foreground">{item.place}</p>
                  <p className="text-sm text-muted-foreground">{item.action}</p>
                </div>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* 100% Real Guarantee Section */}
      <section className="py-24 px-6 relative z-10 bg-gradient-to-b from-transparent to-coral/5">
        <div className="max-w-4xl mx-auto">
          <RevealText>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-signal-green/50 mb-6">
                <span className="text-2xl">🛡️</span>
                <span className="text-sm font-semibold text-signal-green">{t('landing.realMeetingsGuarantee')}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('landing.notADatingApp')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {t('landing.forRealConnections')}
              </p>
            </div>
          </RevealText>

          <div className="grid md:grid-cols-3 gap-6">
            <RevealText delay={0}>
              <div className="p-6 rounded-2xl glass border border-coral/20 text-center">
                <span className="text-4xl mb-4 block">🚫</span>
                <h3 className="font-bold text-foreground mb-2">{t('landing.noVirtualChat')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.meetInPerson')}</p>
              </div>
            </RevealText>
            <RevealText delay={0.1}>
              <div className="p-6 rounded-2xl glass border border-signal-green/30 text-center">
                <span className="text-4xl mb-4 block">✅</span>
                <h3 className="font-bold text-foreground mb-2">{t('landing.mutualConsent')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.naturalApproach')}</p>
              </div>
            </RevealText>
            <RevealText delay={0.2}>
              <div className="p-6 rounded-2xl glass border border-signal-yellow/30 text-center">
                <span className="text-4xl mb-4 block">🔒</span>
                <h3 className="font-bold text-foreground mb-2">{t('landing.safetyFirst')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.safetyDesc')}</p>
              </div>
            </RevealText>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <RevealText>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              <span className="text-muted-foreground">{t('landing.readyToConnect')}</span>
              <br />
              <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
                {t('landing.connect')}
              </span>
            </h2>
          </RevealText>
          
          <RevealText delay={0.2}>
            <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
              {t('landing.joinRevolution')}
              <br />{t('landing.itsFreeNow')}
            </p>
          </RevealText>
          
          <RevealText delay={0.4}>
            <Button
              onClick={() => navigate('/onboarding')}
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl hover:shadow-coral/30 transition-all duration-300 hover:scale-105"
            >
              {t('landing.startNow')}
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </RevealText>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-muted/20 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-foreground">EASY</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button 
                onClick={() => navigate('/install')}
                className="hover:text-coral transition-colors font-medium"
              >
                📲 {t('landing.install')}
              </button>
              <button 
                onClick={() => navigate('/help')}
                className="hover:text-foreground transition-colors"
              >
                {t('nav.help')}
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-foreground transition-colors"
              >
                {t('landing.terms')}
              </button>
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-foreground transition-colors"
              >
                {t('nav.privacy')}
              </button>
              <a 
                href="mailto:support@easy-app.fr"
                className="hover:text-foreground transition-colors"
              >
                {t('landing.contact')}
              </a>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <Link to="/changelog" className="font-medium hover:text-coral transition-colors">
              EASY v1.3.0 • PWA
            </Link>
            <p>{t('landing.madeWith')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
