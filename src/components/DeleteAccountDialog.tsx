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

export function DeleteAccountDialog() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    if (!user || confirmText !== 'SUPPRIMER') return;

    setIsLoading(true);
    try {
      // Delete all user data from tables (RLS will ensure only user's data is deleted)
      await Promise.all([
        supabase.from('active_signals').delete().eq('user_id', user.id),
        supabase.from('interactions').delete().eq('user_id', user.id),
        supabase.from('app_feedback').delete().eq('user_id', user.id),
        supabase.from('reports').delete().eq('reporter_id', user.id),
        supabase.from('user_settings').delete().eq('user_id', user.id),
        supabase.from('user_stats').delete().eq('user_id', user.id),
        supabase.from('user_roles').delete().eq('user_id', user.id),
      ]);

      // Delete profile
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out
      await signOut();
      
      toast.success('Ton compte a été supprimé');
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Erreur lors de la suppression. Contacte le support.');
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl"
        >
          Supprimer mon compte
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
            Supprimer ton compte ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Cette action est <strong className="text-foreground">irréversible</strong>. 
            Toutes tes données seront définitivement supprimées : profil, statistiques, 
            historique d'interactions, feedbacks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <label className="text-sm text-muted-foreground block mb-2">
            Tape <span className="font-mono font-bold text-foreground">SUPPRIMER</span> pour confirmer
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder="SUPPRIMER"
            className="bg-muted border-border text-foreground"
          />
        </div>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || confirmText !== 'SUPPRIMER'}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Supprimer définitivement'
            )}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full">
            Annuler
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
