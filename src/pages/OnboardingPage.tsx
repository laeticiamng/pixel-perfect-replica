import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Check, Loader2, Eye, EyeOff, Sparkles, Mail, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { loginSchema, registerSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { cn } from '@/lib/utils';
import { lovable } from '@/integrations/lovable';
import { useTranslation } from '@/lib/i18n';
import { getPasswordPolicyErrorMessage, isPwnedPasswordError, isWeakPasswordError } from '@/lib/authErrorMapper';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin || false);
  const returnPath = location.state?.from || '/map';
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { t } = useTranslation();
  
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [university, setUniversity] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  
  const { signIn, signUp, signInWithMagicLink, signInWithOAuthSupabase, isAuthenticated } = useAuth();
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const loginRateLimit = useRateLimit(RATE_LIMIT_PRESETS.login);
  const signupRateLimit = useRateLimit(RATE_LIMIT_PRESETS.signup);
  const { startWatching, position, error: locationError } = useLocationStore();
  
  // Handle magic link
  const handleMagicLink = async () => {
    if (!email) {
      setErrors({ email: t('auth.emailRequired') });
      return;
    }
    setIsMagicLinkLoading(true);
    const { error } = await signInWithMagicLink(email);
    setIsMagicLinkLoading(false);
    if (error) {
      toast.error(t('auth.magicLinkError'));
    } else {
      setIsMagicLinkSent(true);
      setConfirmationEmail(email);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Try Lovable OAuth first, fallback to Supabase OAuth
      const result = await lovable.auth.signInWithOAuth('google');
      if (result.error) {
        // Fallback to native Supabase OAuth
        const { error } = await signInWithOAuthSupabase('google');
        if (error) {
          toast.error(t('auth.googleError'));
          logger.api.error('auth', 'oauth-google', String(error));
        }
      }
    } catch (err) {
      // Fallback to native Supabase OAuth
      try {
        const { error } = await signInWithOAuthSupabase('google');
        if (error) {
          toast.error(t('auth.googleError'));
        }
      } catch {
        toast.error(t('auth.googleError'));
        logger.api.error('auth', 'oauth-google-fallback', String(err));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Apple OAuth
  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('apple');
      if (result.error) {
        toast.error(t('auth.appleError'));
        logger.api.error('auth', 'oauth-apple', String(result.error));
      }
    } catch (err) {
      toast.error(t('auth.appleError'));
      logger.api.error('auth', 'oauth-apple', String(err));
    } finally {
      setIsAppleLoading(false);
    }
  };

  // Watch for position changes to update locationStatus
  useEffect(() => {
    if (position && locationStatus === 'loading') {
      if (locationError) {
        setLocationStatus('error');
        // Translate error keys from locationStore
        const errorMsg = locationError === 'location_denied' ? t('mapToasts.locationDenied')
          : locationError === 'location_unavailable' ? t('mapToasts.locationUnavailable')
          : locationError === 'geolocation_not_supported' ? t('mapToasts.geoNotSupported')
          : locationError;
        toast.error(errorMsg);
      } else {
        setLocationStatus('success');
        toast.success(t('onboarding.locationObtained') + ' !');
      }
    }
  }, [position, locationStatus, locationError, t]);

  // Watch for location errors (when no fallback position was set)
  useEffect(() => {
    if (locationError && !position && locationStatus === 'loading') {
      setLocationStatus('error');
      const errorMsg = locationError === 'location_denied' ? t('mapToasts.locationDenied')
        : locationError === 'location_unavailable' ? t('mapToasts.locationUnavailable')
        : locationError === 'geolocation_not_supported' ? t('mapToasts.geoNotSupported')
        : locationError;
      toast.error(errorMsg);
    }
  }, [locationError, position, locationStatus, t]);

  // If already authenticated, go directly to return path or map
  useEffect(() => {
    if (isAuthenticated && position) {
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, position, navigate, returnPath]);

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
      const result = registerSchema.safeParse({ email, password, firstName: firstName.trim(), university: university.trim() || undefined });
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
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      if (isLogin) {
        const { allowed } = loginRateLimit.checkRateLimit();
        if (!allowed) {
          toast.error(t('auth.tooManyAttempts'));
          return;
        }
        
        setIsLoading(true);
        loginRateLimit.recordAttempt();
        const { error } = await signIn(email, password);
        setIsLoading(false);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('auth.invalidCredentials'));
          } else if (error.message.includes('Email not confirmed')) {
            setConfirmationEmail(email);
            setShowEmailConfirmation(true);
          } else {
            toast.error(error.message || t('errors.generic'));
          }
        } else {
          loginRateLimit.reset();
          toast.success(t('auth.welcome'));
          setStep(2);
        }
      } else {
        const { allowed } = signupRateLimit.checkRateLimit();
        if (!allowed) {
          toast.error(t('auth.tooManyAttempts'));
          return;
        }
        
        setIsLoading(true);
        signupRateLimit.recordAttempt();
        const { error } = await signUp(email, password, firstName.trim(), university.trim() || undefined);
        setIsLoading(false);
        
        if (error) {
          if (isPwnedPasswordError(error.message) || isWeakPasswordError(error.message)) {
            toast.error(getPasswordPolicyErrorMessage(error.message, t));
          } else if (error.message.includes('User already registered')) {
            toast.error(t('auth.accountExists'));
          } else {
            toast.error(error.message || t('errors.generic'));
          }
        } else {
          signupRateLimit.reset();
          // Check if email confirmation is required (session will be null)
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Email confirmation required - show confirmation screen
            setConfirmationEmail(email);
            setShowEmailConfirmation(true);
          } else {
            toast.success(t('auth.accountCreated'));
            navigate('/welcome');
          }
        }
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      navigate(returnPath, { replace: true });
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
          <form className="space-y-6 animate-slide-up" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? t('auth.enterCredentials') : t('auth.fillInfo')}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
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
                    placeholder={t('auth.password')}
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                      placeholder={t('auth.firstName')}
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
                    placeholder={t('auth.universityOptional')}
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                    autoComplete="organization"
                  />
                </>
              )}
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-coral hover:text-coral-dark transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMagicLink(true);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    {t('auth.useMagicLink')}
                  </button>
                </div>
              )}

              {/* Magic Link Section (login only) */}
              {isLogin && useMagicLink && (
                <div className="space-y-3 p-4 rounded-xl bg-coral/5 border border-coral/20">
                  <p className="text-sm text-muted-foreground">{t('auth.magicLinkDesc')}</p>
                  <Button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={isMagicLinkLoading || !email}
                    className="w-full h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl gap-2"
                  >
                    {isMagicLinkLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        {t('auth.sendMagicLink')}
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setUseMagicLink(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                  >
                    {t('auth.usePassword')}
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">{t('or')}</span>
                </div>
              </div>
              
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full h-14 rounded-xl border-border hover:bg-muted gap-3"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t('auth.continueWithGoogle')}
                  </>
                )}
              </Button>
              
              {/* Apple Sign In */}
              <Button
                type="button"
                variant="outline"
                onClick={handleAppleSignIn}
                disabled={isAppleLoading}
                className="w-full h-14 rounded-xl border-border hover:bg-muted gap-3"
              >
                {isAppleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    {t('auth.continueWithApple')}
                  </>
                )}
              </Button>
            </div>

            {/* Toggle login/signup */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? (
                  <>{t('auth.noAccount')} <span className="text-coral font-medium">{t('auth.signUp')}</span></>
                ) : (
                  <>{t('auth.alreadyHaveAccount')} <span className="text-coral font-medium">{t('auth.signIn')}</span></>
                )}
              </button>
            </div>
          </form>
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
              {t('onboarding.enableLocation')}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('onboarding.locationExplain')}
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
                  {t('onboarding.locationObtained')}
                </>
              ) : locationStatus === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('onboarding.locating')}
                </>
              ) : (
                t('onboarding.allowLocation')
              )}
            </Button>
            
            {locationStatus !== 'success' && (
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
              >
                {t('onboarding.skipForNow')}
              </button>
            )}
            
            {locationStatus !== 'success' && (
              <p className="text-xs text-muted-foreground/70">
                {t('onboarding.enableLater')}
              </p>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6 animate-slide-up text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('onboarding.youReReady')}
            </h2>
            
            <p className="text-coral font-semibold mb-2">
              {t('onboarding.everyoneOpen')}
            </p>
            
            <p className="text-muted-foreground mb-6 text-sm">
              {t('onboarding.activateSignal')}
            </p>
            
            <div className="space-y-4 text-left">
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform border border-signal-green/30">
                <div className="w-7 h-7 rounded-full bg-signal-green glow-green shadow-lg" />
                <div>
                  <p className="font-bold text-signal-green">{t('signals.green')}</p>
                  <p className="text-sm text-foreground font-medium">{t('signals.greenDesc')}</p>
                  <p className="text-xs text-muted-foreground">{t('signals.greenSubDesc')}</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-7 h-7 rounded-full bg-signal-yellow glow-yellow shadow-lg" />
                <div>
                  <p className="font-bold text-signal-yellow">{t('signals.yellow')}</p>
                  <p className="text-sm text-foreground font-medium">{t('signals.yellowDesc')}</p>
                  <p className="text-xs text-muted-foreground">{t('signals.yellowSubDesc')}</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-4 flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-7 h-7 rounded-full bg-signal-red glow-red shadow-lg" />
                <div>
                  <p className="font-bold text-signal-red">{t('signals.red')}</p>
                  <p className="text-sm text-foreground font-medium">{t('signals.redDesc')}</p>
                  <p className="text-xs text-muted-foreground">{t('signals.redSubDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: confirmationEmail });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t('auth.emailResent'));
      }
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setIsResending(false);
    }
  };

  const totalSteps = 3;

  // Magic link sent screen
  if (isMagicLinkSent) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-top safe-bottom">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
          <div className="space-y-6 animate-slide-up text-center">
            <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6 glow-coral">
              <Wand2 className="h-12 w-12 text-coral" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.magicLinkSent')}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('auth.magicLinkSentDesc')}
            </p>
            <p className="text-sm text-foreground font-medium">{confirmationEmail}</p>

            <div className="space-y-3 pt-4">
              <Button
                onClick={handleMagicLink}
                disabled={isMagicLinkLoading}
                variant="outline"
                className="w-full h-14 rounded-xl border-border"
              >
                {isMagicLinkLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                {t('auth.resendEmail')}
              </Button>

              <Button
                onClick={() => {
                  setIsMagicLinkSent(false);
                  setUseMagicLink(false);
                  setIsLogin(true);
                }}
                className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral"
              >
                {t('auth.usePassword')}
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Email confirmation screen
  if (showEmailConfirmation) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-top safe-bottom">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
          <div className="space-y-6 animate-slide-up text-center">
            <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6 glow-coral">
              <Mail className="h-12 w-12 text-coral" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground">
              {t('auth.checkEmail')}
            </h2>
            <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {t('auth.checkEmailDesc')}
            </p>
            <p className="text-sm text-foreground font-medium">{confirmationEmail}</p>
            
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full h-14 rounded-xl border-border"
              >
                {isResending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-5 w-5 mr-2" />
                )}
                {t('auth.resendEmail')}
              </Button>
              
              <Button
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setIsLogin(true);
                  setPassword('');
                  setErrors({});
                }}
                className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral"
              >
                {t('auth.confirmedGoLogin')}
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-top safe-bottom">
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
          disabled={isLoading}
          className="flex-1 h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral transition-all duration-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : step === totalSteps ? (
            t('onboarding.letsGo')
          ) : step === 2 && locationStatus !== 'success' ? (
            t('skip')
          ) : (
            <>
              {t('continue')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </PageLayout>
  );
}
