import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { PageLayout } from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (recovery link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setIsLoading(false);

    if (updateError) {
      // Handle weak/pwned password error
      if (updateError.message.includes('weak_password') || updateError.message.includes('pwned')) {
        toast.error(t('auth.weakPassword'));
        setError(t('auth.weakPassword'));
      } else {
        toast.error(t('auth.updateError'));
        setError(updateError.message);
      }
      return;
    }

    setIsSuccess(true);
    toast.success(t('auth.passwordUpdated'));
    
    // Redirect after delay
    setTimeout(() => {
      navigate('/map');
    }, 2000);
  };

  if (!isValidSession) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">
          {t('auth.linkExpired')}
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          {t('auth.linkExpiredDesc')}
        </p>
        <Button
          onClick={() => navigate('/forgot-password')}
          className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
        >
          {t('auth.newLink')}
        </Button>
      </PageLayout>
    );
  }

  if (isSuccess) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-signal-green/20 flex items-center justify-center mb-6 animate-pulse-signal">
          <Check className="h-10 w-10 text-signal-green" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">
          {t('auth.passwordUpdated')}
        </h1>
        <p className="text-muted-foreground text-center">
          {t('auth.redirecting')}
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-bottom">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="h-8 w-8 text-coral" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          {t('auth.newPassword')}
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {t('auth.chooseSecurePassword')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.newPasswordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12",
                  error && "border-destructive"
                )}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          <div className="space-y-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl",
                error && "border-destructive"
              )}
              autoComplete="new-password"
            />
            {confirmPassword && password && (
              <div className="flex items-center gap-2 text-sm">
                {confirmPassword === password ? (
                  <>
                    <Check className="h-4 w-4 text-signal-green" />
                    <span className="text-signal-green">{t('auth.passwordsMatch')}</span>
                  </>
                ) : (
                  <span className="text-signal-red">{t('auth.passwordsDontMatch')}</span>
                )}
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t('auth.update')
            )}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
