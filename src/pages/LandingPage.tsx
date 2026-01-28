import { useNavigate } from 'react-router-dom';
import { MapPin, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
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
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-radial flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Animated Logo */}
        <div className="animate-float mb-8">
          <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center glow-coral">
            <span className="text-5xl">📍</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-coral mb-4 tracking-tight">
          SIGNAL
        </h1>

        {/* Tagline */}
        <p className="text-center text-lg text-muted-foreground max-w-xs mb-12 leading-relaxed">
          Vois qui est ouvert autour de toi.
          <br />
          <span className="text-foreground font-medium">Approche sans awkwardness.</span>
        </p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-xl p-4 flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-lg bg-deep-blue-light flex items-center justify-center shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => navigate('/onboarding')}
            className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Commencer
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
            className="w-full h-12 text-muted-foreground hover:text-foreground"
          >
            J'ai déjà un compte
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          En continuant, tu acceptes nos{' '}
          <button className="text-coral underline">conditions d'utilisation</button>
        </p>
      </footer>
    </div>
  );
}
