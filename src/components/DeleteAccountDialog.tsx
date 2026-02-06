import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

export function DeleteAccountDialog() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const confirmWord = t('deleteAccount.confirmWord');

  const handleDelete = async () => {
    if (!user || confirmText !== confirmWord) return;

    setIsLoading(true);
    try {
      await Promise.all([
        supabase.from('active_signals').delete().eq('user_id', user.id),
        supabase.from('interactions').delete().eq('user_id', user.id),
        supabase.from('app_feedback').delete().eq('user_id', user.id),
        supabase.from('reports').delete().eq('reporter_id', user.id),
        supabase.from('user_settings').delete().eq('user_id', user.id),
        supabase.from('user_stats').delete().eq('user_id', user.id),
        supabase.from('user_roles').delete().eq('user_id', user.id),
      ]);

      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
      
      toast.success(t('deleteAccount.success'));
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(t('deleteAccount.error'));
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full h-12 rounded-xl">
          {t('deleteAccount.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-background border-border max-w-sm mx-4">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            {t('deleteAccount.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t('deleteAccount.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <label className="text-sm text-muted-foreground block mb-2">
            {t('deleteAccount.confirmLabel')}
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder={confirmWord}
            className="bg-muted border-border text-foreground"
          />
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || confirmText !== confirmWord}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('deleteAccount.confirmAction')
            )}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full">
            {t('cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
