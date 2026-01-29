import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const features = [
  {
    icon: <div className="w-3 h-3 rounded-full bg-signal-green" />,
    title: 'Dis ce que tu fais',
    description: 'Réviser, manger, bosser... Choisis ton activité et active ton signal',
  },
  {
    icon: <MapPin className="h-5 w-5 text-coral" />,
    title: 'Détecte qui est dispo',
    description: 'Reçois une notif dès que quelqu\'un arrive et active son signal près de toi',
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-coral" />,
    title: 'Approche naturellement',
    description: 'Tu sais déjà ce qu\'il/elle fait — l\'icebreaker parfait pour engager',
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Animated Logo - Custom SVG */}
        <div className="animate-float mb-8 relative">
          {/* Multiple glow rings */}
          <div className="absolute inset-0 rounded-full bg-coral/20 animate-ripple" />
          <div className="absolute inset-0 rounded-full bg-coral/15 animate-ripple" style={{ animationDelay: '0.4s' }} />
          <div className="absolute inset-0 rounded-full bg-coral/10 animate-ripple" style={{ animationDelay: '0.8s' }} />
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral/40 to-coral/15 flex items-center justify-center glow-coral relative shadow-medium">
            <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-deep-blue via-deep-blue-light to-midnight" />
            {/* Custom SVG Pin Icon */}
            <svg 
              className="relative z-10 w-14 h-14 text-coral drop-shadow-[0_0_12px_hsl(var(--coral)/0.8)]" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
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
          <span className="text-foreground font-bold">Approche sans awkwardness.</span>
        </p>

        {/* Visual Flow Schema */}
        <div className="w-full max-w-sm md:max-w-md mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="glass rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              {/* Step 1: Activity */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center border-2 border-coral animate-pulse">
                  <span className="text-xl">📚</span>
                </div>
                <span className="text-xs text-muted-foreground text-center">Toi</span>
              </div>
              
              {/* Arrow 1 */}
              <div className="flex items-center text-coral">
                <div className="w-6 h-0.5 bg-gradient-to-r from-coral/50 to-coral" />
                <span className="text-sm">→</span>
              </div>
              
              {/* Step 2: Signal broadcast */}
              <div className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-signal-green/30 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <div className="w-12 h-12 rounded-full bg-signal-green/20 flex items-center justify-center border-2 border-signal-green relative z-10">
                  <div className="w-3 h-3 rounded-full bg-signal-green" />
                </div>
                <span className="text-xs text-muted-foreground text-center">Signal</span>
              </div>
              
              {/* Arrow 2 */}
              <div className="flex items-center text-coral">
                <div className="w-6 h-0.5 bg-gradient-to-r from-coral to-coral/50" />
                <span className="text-sm">→</span>
              </div>
              
              {/* Step 3: Others appear */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center border-2 border-coral/50">
                    <span className="text-xl">🍽️</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral flex items-center justify-center text-xs font-bold text-primary-foreground animate-bounce">
                    !
                  </div>
                </div>
                <span className="text-xs text-muted-foreground text-center">Notif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm md:max-w-md space-y-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-5 flex items-start gap-4 animate-slide-up hover:scale-[1.02] hover:bg-card/90 active:scale-[0.98] transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-blue-light to-deep-blue flex items-center justify-center shrink-0 shadow-medium border border-white/5">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm md:max-w-md space-y-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
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
