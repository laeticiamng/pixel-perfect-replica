import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

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
  const [activeSignal, setActiveSignal] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSignal(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  const signals = [
    { color: 'bg-signal-green', glow: 'glow-green', label: 'Réviser', emoji: '📚' },
    { color: 'bg-signal-green', glow: 'glow-green', label: 'Sport', emoji: '🏃' },
    { color: 'bg-signal-yellow', glow: 'glow-yellow', label: 'Discuter', emoji: '☕' },
  ];
  
  return (
    <div className="relative w-64 h-64 mx-auto">
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
  const comparisons = [
    { old: '"Je suis là"', new: '"Je suis ouvert à l\'interaction"' },
    { old: 'Profils passifs', new: 'Intentions actives' },
    { old: 'Espoir de match', new: 'Consentement mutuel' },
    { old: 'Approche gênante', new: 'Approche naturelle' },
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
      
      {/* Hero Section - Full Screen */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10"
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
            <span className="text-sm font-medium text-foreground">La rencontre réinventée</span>
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
            Vois qui est
          </span>
          <br />
          <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
            ouvert à l'interaction.
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-lg mb-12 leading-relaxed"
        >
          Groupes de motivation, amis, travail, amour...
          <br className="hidden sm:block" />
          <span className="text-foreground font-medium">Crée du lien en vrai, plus facilement, ici et maintenant.</span>
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
            Commencer
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg font-medium rounded-full border-2 border-muted hover:border-coral/50 hover:bg-coral/5 transition-all duration-300"
          >
            Se connecter
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
              <span className="text-muted-foreground">Tu veux rencontrer quelqu'un.</span>
              <br />
              <span className="text-muted-foreground">Mais tu ne sais jamais si cette personne</span>
              <br />
              <span className="text-foreground font-bold">veut être approchée.</span>
            </p>
          </RevealText>
          
          <RevealText delay={0.2}>
            <div className="mt-12 text-center">
              <p className="text-lg text-coral font-semibold">Jusqu'à maintenant.</p>
            </div>
          </RevealText>
        </div>
      </section>

      {/* Signal Demo Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <RevealText>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Le <span className="text-coral">signal vert</span>
              <br />change tout.
            </h2>
          </RevealText>
          
          <RevealText delay={0.2}>
            <p className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto">
              Quand quelqu'un active son signal, ça veut dire une chose :
              <br /><span className="text-foreground font-semibold">"Je suis ouvert·e à l'interaction."</span>
            </p>
          </RevealText>
          
          <RevealText delay={0.4}>
            <SignalDemo />
          </RevealText>
          
          <RevealText delay={0.6}>
            <p className="mt-12 text-sm text-muted-foreground">
              Plus de malaise. Plus de "je dérange ou pas ?"
              <br />Le premier pas est déjà fait des deux côtés.
            </p>
          </RevealText>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <RevealText>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Pourquoi ça change tout
            </h2>
          </RevealText>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🤝"
              title="Lutte contre la solitude"
              description="Tu n'es plus seul·e à vouloir rencontrer quelqu'un. Ici, tout le monde cherche la même chose."
              delay={0}
            />
            <FeatureCard
              icon="✨"
              title="Zéro approche gênante"
              description="Pas de 'tu veux un café ?' random. Les deux personnes ont déjà dit oui."
              delay={0.1}
            />
            <FeatureCard
              icon="📍"
              title="Ancré dans le réel"
              description="Pas de swipe infini. Des vraies personnes, au même endroit, au même moment."
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
              On ne connecte pas des profils.
            </h2>
            <p className="text-xl text-coral font-semibold text-center mb-12">
              On connecte des intentions.
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
              Ça marche partout
            </h2>
          </RevealText>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '📚', place: 'Bibliothèque', action: 'Réviser ensemble' },
              { emoji: '🏋️', place: 'Salle de sport', action: 'S\'entraîner à deux' },
              { emoji: '☕', place: 'Café', action: 'Discuter' },
              { emoji: '💻', place: 'Coworking', action: 'Brainstormer' },
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

      {/* Final CTA */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <RevealText>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              <span className="text-muted-foreground">Prêt·e à</span>
              <br />
              <span className="bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent">
                te connecter ?
              </span>
            </h2>
          </RevealText>
          
          <RevealText delay={0.2}>
            <p className="text-lg text-muted-foreground mb-12 max-w-md mx-auto">
              Rejoins la révolution des rencontres intentionnelles.
              <br />C'est gratuit. C'est maintenant.
            </p>
          </RevealText>
          
          <RevealText delay={0.4}>
            <Button
              onClick={() => navigate('/onboarding')}
              size="lg"
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-white rounded-full shadow-xl hover:shadow-coral/30 transition-all duration-300 hover:scale-105"
            >
              Commencer maintenant
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
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-foreground">SIGNAL</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button 
                onClick={() => navigate('/help')}
                className="hover:text-foreground transition-colors"
              >
                Aide
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-foreground transition-colors"
              >
                Conditions
              </button>
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-foreground transition-colors"
              >
                Confidentialité
              </button>
              <a 
                href="mailto:support@signal-app.fr"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p className="font-medium">SIGNAL v1.0.0</p>
            <p>Made with ❤️ in France par EmotionsCare Sasu</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
