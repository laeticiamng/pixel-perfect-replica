import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const features = [
  {
    icon: <div className="w-3 h-3 rounded-full bg-signal-green" />,
    title: 'Signale que tu es ouvert',
    description: 'Active ton signal pour montrer que tu es ouvert à l\'interaction',
  },
  {
    icon: <MapPin className="h-5 w-5 text-coral" />,
    title: 'Vois les signaux autour',
    description: 'Découvre qui est ouvert près de toi sur la carte radar',
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-coral" />,
    title: 'Approche sans awkwardness',
    description: 'Reçois un icebreaker parfait pour lancer la conversation',
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Animated Logo */}
        <div className="animate-float mb-8 relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
          <div className="absolute inset-0 rounded-full bg-coral/10 animate-ripple" style={{ animationDelay: '0.5s' }} />
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center glow-coral relative">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-deep-blue to-midnight" />
            <span className="text-5xl relative z-10">📍</span>
          </div>
        </div>

        {/* Title with gradient */}
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-coral via-coral-light to-coral bg-clip-text text-transparent animate-fade-in">
          SIGNAL
        </h1>

        {/* Tagline */}
        <p className="text-center text-lg text-muted-foreground max-w-xs mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Vois qui est ouvert à l'interaction autour de toi.
          <br />
          <span className="text-foreground font-semibold">Approche sans awkwardness.</span>
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-5 flex items-start gap-4 animate-slide-up hover:scale-[1.02] transition-transform duration-300"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-blue-light to-deep-blue flex items-center justify-center shrink-0 shadow-soft">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-2xl animate-glow-pulse transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-medium"
          >
            Commencer
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

      {/* Footer */}
      <footer className="py-6 text-center safe-bottom">
        <p className="text-xs text-muted-foreground px-4">
          En continuant, tu acceptes nos{' '}
          <button 
            onClick={() => navigate('/terms')}
            className="text-coral underline hover:text-coral-light transition-colors"
          >
            conditions d'utilisation
          </button>
          {' '}et notre{' '}
          <button 
            onClick={() => navigate('/privacy')}
            className="text-coral underline hover:text-coral-light transition-colors"
          >
            politique de confidentialité
          </button>
        </p>
      </footer>
    </div>
  );
}
