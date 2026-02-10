import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/validation';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared';
import { useTranslation } from '@/lib/i18n';
import { getPasswordPolicyErrorMessage, isPwnedPasswordError, isWeakPasswordError } from '@/lib/authErrorMapper';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(t('auth.passwordMustBeDifferent'));
      return;
    }

    setIsLoading(true);

    try {
      // Get current user email
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      
      if (!email) {
        toast.error(t('auth.sessionExpired'));
        navigate('/');
        return;
      }

      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error(t('auth.currentPasswordIncorrect'));
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // Handle weak/pwned password error
        if (isWeakPasswordError(error.message) || isPwnedPasswordError(error.message)) {
          toast.error(getPasswordPolicyErrorMessage(error.message, t));
        } else if (error.message.includes('same')) {
          toast.error(t('auth.passwordMustBeDifferent'));
        } else {
          toast.error(t('auth.updateError'));
        }
        return;
      }

      toast.success(t('auth.passwordChanged'));
      navigate('/settings');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    currentPassword.length >= 6 && 
    newPassword.length >= 6 && 
    confirmPassword === newPassword;

  return (
    <PageLayout className="pb-8 safe-bottom">
      <PageHeader title={t('auth.changePassword')} backTo="/settings" />

      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6 animate-slide-up">
        {/* Security Info */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20">
              <Lock className="h-5 w-5 text-signal-green" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('auth.useStrongPassword')}
            </p>
          </div>
        </div>

        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            {t('auth.currentPassword')}
          </label>
          <div className="relative">
            <Input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('auth.currentPasswordPlaceholder')}
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
          <label className="text-sm font-medium text-foreground">{t('auth.newPassword')}</label>
          <div className="relative">
            <Input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.newPasswordPlaceholder')}
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
          <label className="text-sm font-medium text-foreground">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
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
                  <span className="text-signal-green">{t('auth.passwordsMatch')}</span>
                </>
              ) : (
                <span className="text-signal-red">{t('auth.passwordsDontMatch')}</span>
              )}
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div className="glass rounded-xl p-4">
          <p className="text-sm font-medium text-foreground mb-2">{t('auth.passwordRequirements')}</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className={newPassword.length >= 6 ? 'text-signal-green' : ''}>
              • {t('auth.passwordRequirementMin')}
            </li>
            <li className={/[a-z]/.test(newPassword) ? 'text-signal-green' : ''}>
              • {t('auth.passwordRequirementLower')}
            </li>
            <li className={/[A-Z]/.test(newPassword) ? 'text-signal-green' : ''}>
              • {t('auth.passwordRequirementUpper')}
            </li>
            <li className={/[0-9]/.test(newPassword) ? 'text-signal-green' : ''}>
              • {t('auth.passwordRequirementNumber')}
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
            t('auth.changePassword')
          )}
        </Button>
      </form>
    </PageLayout>
  );
}
