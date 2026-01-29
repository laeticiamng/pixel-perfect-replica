import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Sparkles, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const useCases = [
  {
    emoji: '📚',
    title: 'Bibliothèque',
    scenario: [
      { step: 1, text: 'Tu es à la BU → tu actives "Réviser"' },
      { step: 2, text: 'Marie arrive → elle active aussi "Réviser"' },
      { step: 3, text: 'Notif : "Marie est ouverte pour réviser 📚"' },
    ],
    result: 'Pas d\'interruption, pas de malaise',
  },
  {
    emoji: '🏋️',
    title: 'Sport',
    scenario: [
      { step: 1, text: 'Tu arrives à la salle → "S\'entraîner"' },
      { step: 2, text: 'Alex active "S\'entraîner – duo"' },
      { step: 3, text: 'Notif : "Alex est ouvert pour s\'entraîner 💪"' },
    ],
    result: 'Fini le "je dérange ou pas ?"',
  },
  {
    emoji: '☕',
    title: 'Café',
    scenario: [
      { step: 1, text: 'Tu t\'installes → "Discuter"' },
      { step: 2, text: 'Léa active "Discuter" dans le même café' },
      { step: 3, text: 'Notif : "Léa est ouverte pour discuter ☕"' },
    ],
    result: 'Échange simple, sans pression',
  },
  {
    emoji: '💻',
    title: 'Coworking',
    scenario: [
      { step: 1, text: 'Tu arrives → "Travailler / Brainstorming"' },
      { step: 2, text: 'Sam active "Brainstorming"' },
      { step: 3, text: 'Notif : "Sam est ouvert pour brainstormer 💡"' },
    ],
    result: 'Networking utile, pas de small talk',
  },
];

const differentiators = [
  { old: '"Je suis là"', new: '"Je suis ouvert à l\'interaction"' },
  { old: 'Profil passif', new: 'Intention active' },
  { old: 'Espoir de match', new: 'Consentement mutuel' },
  { old: 'Approche gênante', new: 'Premier pas déjà fait' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCase, setActiveCase] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map');
    }
  }, [isAuthenticated, navigate]);

  // Auto-rotate use cases
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCase((prev) => (prev + 1) % useCases.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Animated Logo */}
        <div className="animate-float mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
          <div className="absolute inset-0 rounded-full bg-coral/15 animate-ripple" style={{ animationDelay: '0.4s' }} />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral/40 to-coral/15 flex items-center justify-center glow-coral relative shadow-medium">
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-deep-blue via-deep-blue-light to-midnight" />
            <svg 
              className="relative z-10 w-12 h-12 text-coral drop-shadow-[0_0_12px_hsl(var(--coral)/0.8)]" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent animate-fade-in">
          SIGNAL
        </h1>

        {/* Main tagline */}
        <p className="text-center text-lg text-foreground font-medium max-w-md mb-3 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Signale que tu es <span className="text-coral font-bold">ouvert·e à l'interaction</span>, ici et maintenant.
        </p>
        
        <p className="text-center text-sm text-muted-foreground max-w-sm mb-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          Pas juste "je fais cette activité" — mais <span className="text-foreground font-semibold">"je VEUX la faire avec quelqu'un"</span>.
        </p>

        <p className="text-center text-xs text-muted-foreground max-w-xs mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          🤝 Lutte contre la solitude • ✨ Facilite la rencontre • 💚 Consentement mutuel
        </p>

        {/* Concept en une phrase */}
        <div className="w-full max-w-sm glass-strong rounded-2xl p-4 mb-8 border border-coral/20 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-2xl">💚</div>
              <p className="text-xs text-muted-foreground">Tu actives</p>
              <p className="text-sm font-semibold text-signal-green">"Ouvert à..."</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">📍</div>
              <p className="text-xs text-muted-foreground">L'app trouve</p>
              <p className="text-sm font-semibold text-foreground">Qui veut aussi</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🔔</div>
              <p className="text-xs text-muted-foreground">Tu reçois</p>
              <p className="text-sm font-semibold text-foreground">Une notif douce</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl">🤝</div>
              <p className="text-xs text-muted-foreground">L'approche devient</p>
              <p className="text-sm font-semibold text-coral">Naturelle</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3 mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-2xl animate-glow-pulse transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-medium"
          >
            Commencer gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
          >
            J'ai déjà un compte
          </Button>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="px-6 py-8 max-w-2xl mx-auto w-full">
        <h2 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6 font-semibold flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-coral" />
          Comment ça marche concrètement ?
        </h2>

        {/* Use case tabs */}
        <div className="flex justify-center gap-2 mb-4">
          {useCases.map((uc, index) => (
            <button
              key={index}
              onClick={() => setActiveCase(index)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCase === index
                  ? 'bg-coral text-primary-foreground shadow-medium'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {uc.emoji}
            </button>
          ))}
        </div>

        {/* Active use case */}
        <div className="glass-strong rounded-2xl p-5 border border-coral/20 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{useCases[activeCase].emoji}</span>
            <h3 className="text-xl font-bold text-foreground">{useCases[activeCase].title}</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {useCases[activeCase].scenario.map((step, i) => (
              <div key={i} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-6 h-6 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-coral">{step.step}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-muted/30">
            <CheckCircle2 className="h-4 w-4 text-signal-green" />
            <p className="text-sm font-medium text-signal-green">{useCases[activeCase].result}</p>
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="px-6 py-8 max-w-2xl mx-auto w-full">
        <h2 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-6 font-semibold flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 text-coral" />
          Ce qui nous différencie
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {differentiators.map((diff, index) => (
            <div 
              key={index} 
              className="glass rounded-xl p-3 flex items-center justify-between animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground line-through">{diff.old}</span>
                <ArrowRight className="h-3 w-3 text-coral" />
                <span className="text-sm font-semibold text-foreground">{diff.new}</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-signal-green" />
            </div>
          ))}
        </div>
      </section>

      {/* Closing pitch */}
      <section className="px-6 py-10 max-w-2xl mx-auto w-full text-center">
        <div className="glass-strong rounded-2xl p-6 border border-coral/30">
          <p className="text-lg text-muted-foreground mb-2">
            « Tu n'es plus seul·e à vouloir rencontrer quelqu'un.
          </p>
          <p className="text-xl font-bold text-coral">
            Ici, tout le monde est ouvert à l'interaction. »
          </p>
        </div>

        {/* Final CTA */}
        <Button
          onClick={() => navigate('/onboarding')}
          className="mt-6 h-12 px-8 font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 shadow-medium"
        >
          Essayer maintenant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center safe-bottom">
        <p className="text-sm text-muted-foreground px-4">
          En continuant, tu acceptes nos{' '}
          <button 
            onClick={() => navigate('/terms')}
            className="text-coral font-medium underline underline-offset-2 hover:text-coral-light transition-colors"
          >
            conditions d'utilisation
          </button>
          {' '}et notre{' '}
          <button 
            onClick={() => navigate('/privacy')}
            className="text-coral font-medium underline underline-offset-2 hover:text-coral-light transition-colors"
          >
            politique de confidentialité
          </button>
        </p>
      </footer>
    </div>
  );
}
