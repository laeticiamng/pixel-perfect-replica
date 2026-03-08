import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users2, UserCheck, UserPlus, Clock, MessageCircle, Search, UserX, ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { MiniChat } from '@/components/social/MiniChat';
import { useConnections } from '@/hooks/useConnections';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
}

export default function ConnectionsPage() {
  const { connections, pendingRequests, isLoading, acceptConnection, declineConnection } = useConnections();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [chatState, setChatState] = useState<{ interactionId: string; name: string } | null>(null);
  const [loadingChatFor, setLoadingChatFor] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  // Fetch profiles for all connection participants
  useEffect(() => {
    const userIds = new Set<string>();
    connections.forEach(c => { userIds.add(c.user_a); userIds.add(c.user_b); });
    pendingRequests.forEach(c => { userIds.add(c.user_a); userIds.add(c.user_b); });
    if (user) userIds.delete(user.id);
    if (userIds.size === 0) return;

    const fetchProfiles = async () => {
      const { data } = await supabase.rpc('get_public_profiles', {
        profile_ids: Array.from(userIds),
      });
      if (data) {
        const map: Record<string, UserProfile> = {};
        (data as UserProfile[]).forEach(p => { map[p.id] = p; });
        setProfiles(map);
      }
    };
    fetchProfiles();
  }, [connections, pendingRequests, user]);

  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  const getOtherUserId = (c: { user_a: string; user_b: string }) =>
    c.user_a === user?.id ? c.user_b : c.user_a;

  const handleAccept = async (id: string) => {
    const result = await acceptConnection(id);
    if (result.success) toast.success(t('connections.accepted'));
  };

  const handleDecline = async (id: string) => {
    const result = await declineConnection(id);
    if (result.success) toast.success(t('connections.declined'));
  };

  // Open chat with a friend — find or create interaction via RPC
  const handleOpenChat = useCallback(async (otherUserId: string, name: string) => {
    setLoadingChatFor(otherUserId);
    try {
      const { data, error } = await supabase.rpc('get_or_create_interaction', {
        p_other_user_id: otherUserId,
      });
      if (error) throw error;
      setChatState({ interactionId: data as string, name });
    } catch (err: any) {
      toast.error(t('connections.chatError'));
    } finally {
      setLoadingChatFor(null);
    }
  }, [t]);

  // Remove a connection
  const handleRemoveConnection = async () => {
    if (!removeTarget) return;
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', removeTarget.id);
      if (error) throw error;
      toast.success(t('connections.removed'));
      setRemoveTarget(null);
    } catch {
      toast.error(t('connections.removeError'));
    }
  };

  // Filter friends by search
  const filteredFriends = acceptedConnections.filter(c => {
    if (!searchQuery) return true;
    const otherId = getOtherUserId(c);
    const name = profiles[otherId]?.first_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // If viewing a chat
  if (chatState) {
    return (
      <PageLayout className="pb-28">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => setChatState(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('back')}</span>
          </button>
          <MiniChat
            interactionId={chatState.interactionId}
            otherUserName={chatState.name}
            className="min-h-[60vh]"
          />
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  const renderFriendCard = (connection: any) => {
    const otherUserId = getOtherUserId(connection);
    const profile = profiles[otherUserId];
    const name = profile?.first_name || t('connections.unknown');

    return (
      <div key={connection.id} className="flex items-center gap-3 p-4 rounded-xl glass group">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-coral/20 text-coral font-bold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {profile?.university || ''}
            {connection.accepted_at && (
              <> · {t('connections.friendSince')} {formatDistanceToNow(new Date(connection.accepted_at), { addSuffix: false, locale: dateFnsLocale })}</>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={() => handleOpenChat(otherUserId, name)}
            disabled={loadingChatFor === otherUserId}
            className="bg-coral hover:bg-coral-dark rounded-xl"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRemoveTarget({ id: connection.id, name })}
            className="rounded-xl text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderPendingCard = (connection: any) => {
    const otherUserId = getOtherUserId(connection);
    const profile = profiles[otherUserId];
    const name = profile?.first_name || t('connections.unknown');
    const isIncoming = connection.initiated_by !== user?.id;

    return (
      <div key={connection.id} className="flex items-center gap-3 p-4 rounded-xl glass">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-coral/20 text-coral font-bold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">
            {profile?.university || ''}
            {' · '}
            {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: dateFnsLocale })}
          </p>
          {isIncoming && (
            <p className="text-xs text-coral font-medium mt-0.5">
              {t('connections.wantsToConnect')}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isIncoming ? (
            <>
              <Button size="sm" onClick={() => handleAccept(connection.id)} className="bg-coral hover:bg-coral-dark rounded-xl">
                <UserCheck className="h-4 w-4 mr-1" />
                {t('connections.accept')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDecline(connection.id)} className="rounded-xl">
                {t('connections.decline')}
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
              <Clock className="h-3 w-3" /> {t('connections.pending')}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageLayout className="pb-28">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <PageHeader
            title={t('connections.title')}
            subtitle={t('connections.subtitle')}
            showBack
          />

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-xl">
              <TabsTrigger value="friends" className="rounded-xl">
                <UserCheck className="h-4 w-4 mr-2" />
                {t('connections.friends')} ({acceptedConnections.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-xl relative">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('connections.requests')} ({pendingRequests.length})
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-coral text-white text-[10px] font-bold rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4 space-y-3">
              {acceptedConnections.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('connections.searchFriends')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              )}

              {isLoading ? (
                <LoadingSkeleton variant="list" count={4} />
              ) : filteredFriends.length === 0 && searchQuery ? (
                <EmptyState
                  icon={Search}
                  title={t('connections.noResults')}
                  description={t('connections.noResultsDesc')}
                />
              ) : acceptedConnections.length === 0 ? (
                <EmptyState
                  icon={Users2}
                  title={t('connections.noFriends')}
                  description={t('connections.noFriendsDesc')}
                />
              ) : (
                filteredFriends.map(renderFriendCard)
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-4 space-y-3">
              {isLoading ? (
                <LoadingSkeleton variant="list" count={3} />
              ) : pendingRequests.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title={t('connections.noPending')}
                  description={t('connections.noPendingDesc')}
                />
              ) : (
                pendingRequests.map(renderPendingCard)
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Confirm remove dialog */}
        <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
          <AlertDialogContent className="glass border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">{t('connections.removeTitle')}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t('connections.removeDesc').replace('{name}', removeTarget?.name || '')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveConnection}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {t('connections.removeConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <BottomNav />
      </PageLayout>
    </>
  );
}
