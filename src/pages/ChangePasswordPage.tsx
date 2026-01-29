import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/validation';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate new password
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('Le nouveau mot de passe doit être différent');
      return;
    }

    setIsLoading(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes('same')) {
          toast.error('Le nouveau mot de passe doit être différent de l\'ancien');
        } else {
          toast.error('Erreur lors du changement de mot de passe');
        }
        return;
      }

      toast.success('Mot de passe modifié avec succès !');
      navigate('/settings');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    currentPassword.length >= 6 && 
    newPassword.length >= 6 && 
    confirmPassword === newPassword;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Changer le mot de passe</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Mot de passe actuel
          </label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ton mot de passe actuel"
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nouveau mot de passe</label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ton nouveau mot de passe"
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {newPassword && <PasswordStrengthIndicator password={newPassword} />}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirmer le nouveau mot de passe</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme ton nouveau mot de passe"
              className="h-14 bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmPassword && newPassword && (
            <div className="flex items-center gap-2 text-sm">
              {confirmPassword === newPassword ? (
                <>
                  <Check className="h-4 w-4 text-signal-green" />
                  <span className="text-signal-green">Les mots de passe correspondent</span>
                </>
              ) : (
                <span className="text-signal-red">Les mots de passe ne correspondent pas</span>
              )}
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div className="glass rounded-xl p-4">
          <p className="text-sm font-medium text-foreground mb-2">Exigences du mot de passe :</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className={newPassword.length >= 6 ? 'text-signal-green' : ''}>
              • Minimum 6 caractères
            </li>
            <li className={/[a-z]/.test(newPassword) ? 'text-signal-green' : ''}>
              • Au moins une minuscule
            </li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-signal-green' : ''}>
              • Au moins une majuscule
            </li>
            <li className={/[0-9]/.test(newPassword) ? 'text-signal-green' : ''}>
              • Au moins un chiffre
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Changer le mot de passe'
          )}
        </Button>
      </form>
    </div>
  );
}
