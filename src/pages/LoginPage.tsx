import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Wand2, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/lib/validation';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { cn } from '@/lib/utils';
import { lovable } from '@/integrations/lovable';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, signInWithMagicLink, signInWithOAuthSupabase, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const loginRateLimit = useRateLimit(RATE_LIMIT_PRESETS.login);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/map', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

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
      navigate('/map', { replace: true });
    }
  };

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google');
      if (result.error) {
        const { error } = await signInWithOAuthSupabase('google');
        if (error) toast.error(t('auth.googleError'));
      }
    } catch {
      try {
        const { error } = await signInWithOAuthSupabase('google');
        if (error) toast.error(t('auth.googleError'));
      } catch {
        toast.error(t('auth.googleError'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('apple');
      if (result.error) toast.error(t('auth.appleError'));
    } catch {
      toast.error(t('auth.appleError'));
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: confirmationEmail });
      if (error) toast.error(error.message);
      else toast.success(t('auth.emailResent'));
    } catch {
      toast.error(t('errors.generic'));
    } finally {
      setIsResending(false);
    }
  };

  // Magic link sent screen
  if (isMagicLinkSent) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-top safe-bottom">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
          <div className="space-y-6 animate-slide-up text-center">
            <div className="w-24 h-24 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6 glow-coral">
              <Wand2 className="h-12 w-12 text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{t('auth.magicLinkSent')}</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">{t('auth.magicLinkSentDesc')}</p>
            <p className="text-sm text-foreground font-medium">{confirmationEmail}</p>
            <div className="space-y-3 pt-4">
              <Button onClick={handleMagicLink} disabled={isMagicLinkLoading} variant="outline" className="w-full h-14 rounded-xl">
                {isMagicLinkLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
                {t('auth.resendEmail')}
              </Button>
              <Button onClick={() => { setIsMagicLinkSent(false); setUseMagicLink(false); }} className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral">
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
            <h2 className="text-2xl font-bold text-foreground">{t('auth.checkEmail')}</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">{t('auth.checkEmailDesc')}</p>
            <p className="text-sm text-foreground font-medium">{confirmationEmail}</p>
            <div className="space-y-3 pt-4">
              <Button onClick={handleResendEmail} disabled={isResending} variant="outline" className="w-full h-14 rounded-xl">
                {isResending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <RefreshCw className="h-5 w-5 mr-2" />}
                {t('auth.resendEmail')}
              </Button>
              <Button onClick={() => { setShowEmailConfirmation(false); setPassword(''); setErrors({}); }} className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral">
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
        {/* Back */}
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-muted transition-colors w-fit mb-4">
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center">
                <span className="text-white font-black text-2xl">N</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.welcomeBack')}</h1>
              <p className="text-muted-foreground">{t('auth.enterCredentials')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn("h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl", errors.email && "border-destructive")}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn("h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12", errors.password && "border-destructive")}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-coral hover:text-coral-dark transition-colors">
                  {t('auth.forgotPassword')}
                </button>
                <button type="button" onClick={() => setUseMagicLink(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <Wand2 className="h-3.5 w-3.5" />
                  {t('auth.useMagicLink')}
                </button>
              </div>

              {useMagicLink && (
                <div className="space-y-3 p-4 rounded-xl bg-coral/5 border border-coral/20">
                  <p className="text-sm text-muted-foreground">{t('auth.magicLinkDesc')}</p>
                  <Button type="button" onClick={handleMagicLink} disabled={isMagicLinkLoading || !email} className="w-full h-12 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl gap-2">
                    {isMagicLinkLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Wand2 className="h-4 w-4" />{t('auth.sendMagicLink')}</>}
                  </Button>
                  <button type="button" onClick={() => setUseMagicLink(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                    {t('auth.usePassword')}
                  </button>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-semibold bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl glow-coral">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('auth.signIn')}
              </Button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t('or')}</span></div>
              </div>

              {/* Google */}
              <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={isGoogleLoading} className="w-full h-14 rounded-xl border-border hover:bg-muted gap-3">
                {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    {t('auth.continueWithGoogle')}
                  </>
                )}
              </Button>

              {/* Apple */}
              <Button type="button" variant="outline" onClick={handleAppleSignIn} disabled={isAppleLoading} className="w-full h-14 rounded-xl border-border hover:bg-muted gap-3">
                {isAppleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    {t('auth.continueWithApple')}
                  </>
                )}
              </Button>
            </div>

            {/* Switch to signup */}
            <div className="text-center pt-2">
              <span className="text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="text-coral font-medium hover:text-coral-dark transition-colors">
                  {t('auth.signUp')}
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
