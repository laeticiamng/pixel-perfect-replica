import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email requis');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide');
      return;
    }

    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      toast.error('Erreur lors de l\'envoi');
      return;
    }

    setIsSent(true);
    toast.success('Email envoyé !');
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-gradient-radial flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-signal-green/20 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-signal-green" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4 text-center">
          Email envoyé !
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Consulte ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.
        </p>
        <Button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
        >
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial flex flex-col px-6 py-8 safe-bottom">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Mot de passe oublié</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-coral/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="h-8 w-8 text-coral" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center mb-2">
          Réinitialise ton mot de passe
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Entre ton email et on t'envoie un lien de réinitialisation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="ton.email@universite.fr"
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
              'Envoyer le lien'
            )}
          </Button>
        </form>

        <button
          onClick={() => navigate('/onboarding', { state: { isLogin: true } })}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground text-center"
        >
          Retour à la connexion
        </button>
      </div>
    </div>
  );
}
