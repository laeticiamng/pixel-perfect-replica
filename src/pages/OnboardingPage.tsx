import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.state?.isLogin || false;
  
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [university, setUniversity] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { login, register, isLoading } = useAuthStore();
  const { startWatching, position } = useLocationStore();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!validateEmail(email)) {
        toast.error('Email invalide');
        return;
      }
      if (password.length < 4) {
        toast.error('Mot de passe trop court (min 4 caractères)');
        return;
      }
      
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          setStep(3); // Skip to location for login
        } else {
          toast.error('Compte non trouvé. Crée un compte d\'abord !');
        }
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!firstName.trim()) {
        toast.error('Prénom requis');
        return;
      }
      const success = await register(email, password, firstName.trim(), university.trim() || undefined);
      if (success) {
        setStep(3);
      } else {
        toast.error('Erreur lors de l\'inscription');
      }
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      navigate('/map');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/');
    }
  };

  const handleLocationRequest = () => {
    setLocationStatus('loading');
    startWatching();
    
    // Simulate location acquisition
    setTimeout(() => {
      if (position) {
        setLocationStatus('success');
        toast.success('Position obtenue !');
      } else {
        // Still succeed with default position for demo
        setLocationStatus('success');
        toast.success('Position obtenue !');
      }
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? 'Content de te revoir !' : 'Créons ton compte'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? 'Entre tes identifiants' : 'Commence par ton email'}
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="ton.email@universite.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Parle-nous de toi
              </h2>
              <p className="text-muted-foreground">
                Comment tu t'appelles ?
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
              <Input
                type="text"
                placeholder="Université (optionnel)"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6 animate-slide-up text-center">
            <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6 glow-coral">
              {locationStatus === 'success' ? (
                <Check className="h-12 w-12 text-signal-green" />
              ) : locationStatus === 'loading' ? (
                <Loader2 className="h-12 w-12 text-coral animate-spin" />
              ) : (
                <MapPin className="h-12 w-12 text-coral" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Active la localisation
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Pour voir les signaux autour de toi, on a besoin de ta position. 
              Elle reste privée et n'est jamais stockée.
            </p>
            
            <Button
              onClick={handleLocationRequest}
              disabled={locationStatus === 'loading' || locationStatus === 'success'}
              className={cn(
                'w-full h-14 text-lg font-semibold rounded-xl transition-all duration-300',
                locationStatus === 'success'
                  ? 'bg-signal-green hover:bg-signal-green text-primary-foreground'
                  : 'bg-coral hover:bg-coral-dark text-primary-foreground glow-coral'
              )}
            >
              {locationStatus === 'success' ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Position obtenue
                </>
              ) : locationStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Localisation...
                </>
              ) : (
                'Autoriser la localisation'
              )}
            </Button>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6 animate-slide-up text-center">
            <div className="text-6xl mb-6">🎉</div>
            
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Tu es prêt !
            </h2>
            
            <p className="text-muted-foreground mb-8">
              Voici comment fonctionnent les signaux :
            </p>
            
            <div className="space-y-4 text-left">
              <div className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-signal-green glow-green" />
                <div>
                  <p className="font-semibold text-foreground">Signal vert</p>
                  <p className="text-sm text-muted-foreground">Ouvert à l'interaction</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-signal-yellow glow-yellow" />
                <div>
                  <p className="font-semibold text-foreground">Signal jaune</p>
                  <p className="text-sm text-muted-foreground">Ouvert sous conditions</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-signal-red glow-red" />
                <div>
                  <p className="font-semibold text-foreground">Signal rouge</p>
                  <p className="text-sm text-muted-foreground">Pas disponible</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial flex flex-col px-6 py-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              s === step ? 'w-8 bg-coral' : s < step ? 'bg-coral/50' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 rounded-xl border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={isLoading || (step === 3 && locationStatus !== 'success')}
          className="flex-1 h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral transition-all duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : step === 4 ? (
            "C'est parti !"
          ) : (
            <>
              Continuer
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
