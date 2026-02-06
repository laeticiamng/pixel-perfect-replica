import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const passwordResetRateLimit = useRateLimit(RATE_LIMIT_PRESETS.passwordReset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    // Check rate limit
    const { allowed } = passwordResetRateLimit.checkRateLimit();
    if (!allowed) {
      toast.error(t('auth.tooManyAttempts'));
      return;
    }

    setIsLoading(true);
    passwordResetRateLimit.recordAttempt();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      toast.error(t('auth.updateError'));
      return;
    }

    setIsSent(true);
    toast.success(t('auth.emailSent'));
  };

  if (isSent) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col items-center justify-center px-6" showOrbs={true}>
        <div className="relative mb-8 animate-scale-in">
          <div className="absolute inset-0 rounded-full bg-signal-green/30 blur-xl animate-breathing" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-signal-green/30 to-signal-green/10 flex items-center justify-center relative shadow-medium">
            <Check className="h-12 w-12 text-signal-green" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center animate-slide-up">
          {t('auth.emailSent')}
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {t('auth.emailSentDesc')}
        </p>
        <Button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          className="bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral text-primary-foreground rounded-2xl shadow-medium animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          {t('auth.backToLogin')}
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout showSidebar={false} className="flex flex-col px-6 py-8 safe-bottom">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('auth.forgotPassword')}</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-coral" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          {t('auth.resetPasswordTitle')}
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {t('auth.resetPasswordDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl",
                error && "border-destructive"
              )}
              autoComplete="email"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t('auth.sendLink')
            )}
          </Button>
        </form>

        <button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground text-center"
        >
          {t('auth.backToLogin')}
        </button>
      </div>
    </PageLayout>
  );
}
