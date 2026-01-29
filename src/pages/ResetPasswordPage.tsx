import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { PageLayout } from '@/components/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
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
      setError('Mot de passe trop court (min 6 caractères)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setIsLoading(false);

    if (updateError) {
      toast.error('Erreur lors de la mise à jour');
      setError(updateError.message);
      return;
    }

    setIsSuccess(true);
    toast.success('Mot de passe mis à jour !');
    
    // Redirect after delay
    setTimeout(() => {
      navigate('/map');
    }, 2000);
  };

  if (!isValidSession) {
    return (
      <PageLayout showSidebar={false} className="flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">
          Lien expiré
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Ce lien de réinitialisation n'est plus valide. Demande un nouveau lien.
        </p>
        <Button
          onClick={() => navigate('/forgot-password')}
          className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
        >
          Nouveau lien
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
          Mot de passe mis à jour !
        </h1>
        <p className="text-muted-foreground text-center">
          Redirection en cours...
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
          Nouveau mot de passe
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Choisis un mot de passe sécurisé.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
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
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl",
                error && "border-destructive"
              )}
              autoComplete="new-password"
            />
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
              'Mettre à jour'
            )}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
