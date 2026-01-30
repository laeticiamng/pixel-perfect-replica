import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, Unlock, Loader2, Ban } from 'lucide-react';
import { useUserBlocks } from '@/hooks/useUserBlocks';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';

interface BlockedUserInfo {
  id: string;
  blocked_id: string;
  created_at: string;
  profile?: {
    first_name: string;
    avatar_url: string | null;
  };
}

export default function BlockedUsersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { blocks, fetchBlocks, unblockUser, isLoading } = useUserBlocks();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserInfo[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [userToUnblock, setUserToUnblock] = useState<string | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (blocks.length === 0) {
        setBlockedUsers([]);
        setLoadingProfiles(false);
        return;
      }

      const blockedIds = blocks.map(b => b.blocked_id);
      
      const { data: profiles } = await supabase
        .rpc('get_public_profiles', { profile_ids: blockedIds });

      const usersWithProfiles: BlockedUserInfo[] = blocks.map(block => ({
        id: block.id,
        blocked_id: block.blocked_id,
        created_at: block.created_at,
        profile: profiles?.find(p => p.id === block.blocked_id) || undefined,
      }));

      setBlockedUsers(usersWithProfiles);
      setLoadingProfiles(false);
    };

    loadProfiles();
  }, [blocks]);

  const handleUnblock = async () => {
    if (!userToUnblock) return;
    
    setIsUnblocking(true);
    const { error } = await unblockUser(userToUnblock);
    setIsUnblocking(false);
    
    if (error) {
      toast.error(t('binome.unblockError') || 'Erreur lors du déblocage');
    } else {
      toast.success(t('binome.unblockUser') || 'Utilisateur débloqué');
    }
    setUserToUnblock(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/privacy-settings')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour aux paramètres de confidentialité"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('settings.blockedUsers') || 'Utilisateurs bloqués'}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-4">
        {loadingProfiles ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-coral animate-spin" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <UserX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('settings.noBlockedUsers') || 'Aucun utilisateur bloqué'}
            </h3>
            <p className="text-muted-foreground text-center max-w-xs">
              Les utilisateurs que tu bloques n'apparaîtront plus sur ta carte et ne pourront pas te voir.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {blockedUsers.length} {blockedUsers.length === 1 ? 'utilisateur bloqué' : 'utilisateurs bloqués'}
            </p>
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="glass rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">
                      {user.profile?.first_name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {user.profile?.first_name || 'Utilisateur inconnu'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bloqué le {formatDate(user.created_at)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserToUnblock(user.blocked_id)}
                  disabled={isLoading || isUnblocking}
                  className="gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Débloquer
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!userToUnblock} onOpenChange={(open) => !open && setUserToUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Débloquer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette personne pourra à nouveau te voir sur la carte et interagir avec toi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnblocking}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} disabled={isUnblocking}>
              {isUnblocking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Débloquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
