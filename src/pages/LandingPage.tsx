import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const steps = [
  {
    number: '1',
    emoji: '📚',
    title: 'Choisis ton activité',
    description: 'Réviser, manger, bosser, sport...',
  },
  {
    number: '2',
    emoji: '📍',
    title: 'Active ton signal',
    description: 'Montre que tu es ouvert à l\'interaction',
  },
  {
    number: '3',
    emoji: '🔔',
    title: 'Reçois une notif',
    description: 'Dès que quelqu\'un arrive près de toi',
  },
  {
    number: '4',
    emoji: '👋',
    title: 'Approche facilement',
    description: 'Tu sais déjà ce qu\'il/elle fait !',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Animated Logo - Custom SVG */}
        <div className="animate-float mb-6 relative">
          {/* Multiple glow rings */}
          <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
          <div className="absolute inset-0 rounded-full bg-coral/15 animate-ripple" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full bg-coral/10 animate-ripple" style={{ animationDelay: '0.8s' }} />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral/40 to-coral/15 flex items-center justify-center glow-coral relative shadow-medium">
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-deep-blue via-deep-blue-light to-midnight" />
            {/* Custom SVG Pin Icon */}
            <svg 
              className="relative z-10 w-12 h-12 text-coral drop-shadow-[0_0_12px_hsl(var(--coral)/0.8)]" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>

        {/* Title with gradient */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent animate-fade-in">
          SIGNAL
        </h1>

        {/* Subtitle - More explicit */}
        <p className="text-center text-base text-muted-foreground max-w-sm mb-2 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          L'app qui te dit <span className="text-foreground font-semibold">qui est ouvert</span> à discuter autour de toi.
        </p>
        
        {/* Value proposition */}
        <div className="glass-strong rounded-full px-4 py-2 mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <p className="text-sm text-coral font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Fini l'hésitation : approche ceux qui veulent être approchés
          </p>
        </div>

        {/* How it works - Step by step */}
        <div className="w-full max-w-sm md:max-w-md mb-8">
          <h2 className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-4 font-semibold">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="glass rounded-xl p-4 animate-slide-up hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center border border-coral/50">
                    <span className="text-lg">{step.emoji}</span>
                  </div>
                  <span className="text-xs font-bold text-coral">Étape {step.number}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use case example */}
        <div className="w-full max-w-sm md:max-w-md mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="glass-strong rounded-2xl p-4 border border-coral/20">
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-medium text-foreground">Exemple concret</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu es à la BU en train de réviser. Tu actives ton signal <span className="text-signal-green font-semibold">« Réviser »</span>. 
              Marie arrive, active aussi son signal. Tu reçois une notif : 
              <span className="text-coral font-semibold"> "Marie vient d'arriver ! 📚"</span>
            </p>
            <p className="text-sm text-foreground mt-2 font-medium">
              → Tu sais qu'elle révise aussi. L'approche devient naturelle !
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm md:max-w-md space-y-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-2xl animate-glow-pulse transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-medium"
          >
            Commencer gratuitement
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            className="w-full h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
          >
            J'ai déjà un compte
          </Button>
        </div>
      </div>

      {/* Footer - Enhanced visibility */}
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
