import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { loginSchema } from '@/lib/validation';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.state?.isLogin || false;
  
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [university, setUniversity] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, isAuthenticated } = useAuth();
  const loginRateLimit = useRateLimit(RATE_LIMIT_PRESETS.login);
  const signupRateLimit = useRateLimit(RATE_LIMIT_PRESETS.signup);
  const { startWatching, position, error: locationError } = useLocationStore();

  // Watch for position changes to update locationStatus
  useEffect(() => {
    if (position && locationStatus === 'loading') {
      setLocationStatus('success');
      toast.success('Position obtenue !');
    }
  }, [position, locationStatus]);

  // Watch for location errors
  useEffect(() => {
    if (locationError && locationStatus === 'loading') {
      setLocationStatus('error');
      toast.error(locationError);
    }
  }, [locationError, locationStatus]);

  // If already authenticated, go directly to map
  useEffect(() => {
    if (isAuthenticated && position) {
      navigate('/map');
    }
  }, [isAuthenticated, position, navigate]);

  const validateStep1 = () => {
    setErrors({});
    
    if (isLogin) {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      return true;
    } else {
      // For registration, validate all fields together
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) {
        setErrors({ email: 'Email invalide' });
        return false;
      }
      if (password.length < 6) {
        setErrors({ password: 'Mot de passe trop court (min 6 caractères)' });
        return false;
      }
      if (!firstName.trim()) {
        setErrors({ firstName: 'Prénom requis' });
        return false;
      }
      if (firstName.length > 50) {
        setErrors({ firstName: 'Prénom trop long (max 50 caractères)' });
        return false;
      }
      return true;
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      if (isLogin) {
        // Check rate limit for login
        const { allowed, message } = loginRateLimit.checkRateLimit();
        if (!allowed) {
          toast.error(message || 'Trop de tentatives');
          return;
        }
        
        setIsLoading(true);
        loginRateLimit.recordAttempt();
        const { error } = await signIn(email, password);
        setIsLoading(false);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Veuillez confirmer votre email');
          } else {
            toast.error(error.message || 'Erreur de connexion');
          }
        } else {
          loginRateLimit.reset();
          toast.success('Bienvenue !');
          setStep(2);
        }
      } else {
        // Check rate limit for signup
        const { allowed, message } = signupRateLimit.checkRateLimit();
        if (!allowed) {
          toast.error(message || 'Trop de tentatives');
          return;
        }
        
        setIsLoading(true);
        signupRateLimit.recordAttempt();
        const { error } = await signUp(email, password, firstName.trim(), university.trim() || undefined);
        setIsLoading(false);
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Un compte existe déjà avec cet email');
          } else {
            toast.error(error.message || 'Erreur lors de l\'inscription');
          }
        } else {
          signupRateLimit.reset();
          toast.success('Compte créé avec succès !');
          setStep(2);
        }
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      navigate('/map');
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) {
      setStep((step - 1) as Step);
    } else {
      navigate('/');
    }
  };

  const handleLocationRequest = () => {
    setLocationStatus('loading');
    startWatching();
    // The useEffect hooks will handle the success/error state based on store updates
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleContinue();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-slide-up" onKeyPress={handleKeyPress}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {isLogin ? 'Content de te revoir !' : 'Créons ton compte'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? 'Entre tes identifiants' : 'Remplis ces infos pour commencer'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="ton.email@universite.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl",
                    errors.email && "border-destructive"
                  )}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12",
                      errors.password && "border-destructive"
                    )}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                {!isLogin && password && (
                  <PasswordStrengthIndicator password={password} />
                )}
              </div>
              
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={cn(
                        "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl",
                        errors.firstName && "border-destructive"
                      )}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <Input
                    type="text"
                    placeholder="Université (optionnel)"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                    autoComplete="organization"
                  />
                </>
              )}
              
              {isLogin && (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-coral hover:text-coral-dark transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
          </div>
        );
        
      case 2:
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
            
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Active la localisation
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
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
        
      case 3:
        return (
          <div className="space-y-6 animate-slide-up text-center">
            <div className="text-6xl mb-6">🎉</div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Tu es prêt !
            </h2>
            
            <p className="text-coral font-semibold mb-2">
              Ici, tout le monde est ouvert à l'interaction.
            </p>
            
            <p className="text-muted-foreground mb-6 text-sm">
              Active ton signal pour montrer que tu veux rencontrer quelqu'un :
            </p>
            
            <div className="space-y-4 text-left">
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform border border-signal-green/30">
                <div className="w-7 h-7 rounded-full bg-signal-green glow-green shadow-lg" />
                <div>
                  <p className="font-bold text-signal-green">Signal vert</p>
                  <p className="text-sm text-foreground font-medium">"Je suis ouvert·e à l'interaction"</p>
                  <p className="text-xs text-muted-foreground">Je veux faire cette activité avec quelqu'un</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-7 h-7 rounded-full bg-signal-yellow glow-yellow shadow-lg" />
                <div>
                  <p className="font-bold text-signal-yellow">Signal jaune</p>
                  <p className="text-sm text-foreground font-medium">"Ouvert·e sous conditions"</p>
                  <p className="text-xs text-muted-foreground">Dépend de l'activité ou du contexte</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-7 h-7 rounded-full bg-signal-red glow-red shadow-lg" />
                <div>
                  <p className="font-bold text-signal-red">Signal rouge</p>
                  <p className="text-sm text-foreground font-medium">"Pas disponible"</p>
                  <p className="text-xs text-muted-foreground">Visible mais ne souhaite pas être approché</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const totalSteps = 3;

  return (
    <PageLayout className="flex flex-col px-6 py-8 safe-top safe-bottom">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8 max-w-md mx-auto w-full">
        <Button
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 rounded-xl border-border text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={isLoading || (step === 2 && locationStatus !== 'success')}
          className="flex-1 h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral transition-all duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : step === totalSteps ? (
            "C'est parti !"
          ) : (
            <>
              Continuer
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </PageLayout>
  );
}
