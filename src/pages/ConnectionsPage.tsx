import { useState, useEffect } from 'react';
import { Users2, UserCheck, UserPlus, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnections } from '@/hooks/useConnections';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
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
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  useEffect(() => {
    const userIds = new Set<string>();
    connections.forEach(c => {
      userIds.add(c.user_a);
      userIds.add(c.user_b);
    });
    pendingRequests.forEach(c => {
      userIds.add(c.user_a);
      userIds.add(c.user_b);
    });
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

  const renderConnectionCard = (connection: any, isPending = false) => {
    const otherUserId = getOtherUserId(connection);
    const profile = profiles[otherUserId];
    const isIncoming = isPending && connection.initiated_by !== user?.id;

    return (
      <div key={connection.id} className="flex items-center gap-3 p-4 rounded-xl glass">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-coral/20 text-coral font-bold">
            {profile?.first_name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {profile?.first_name || t('connections.unknown')}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile?.university || ''}
            {' · '}
            {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true, locale: dateFnsLocale })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isPending && isIncoming ? (
            <>
              <Button size="sm" onClick={() => handleAccept(connection.id)} className="bg-coral hover:bg-coral-dark rounded-xl">
                <UserCheck className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDecline(connection.id)} className="rounded-xl">
                {t('connections.decline')}
              </Button>
            </>
          ) : isPending ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {t('connections.pending')}
            </span>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/conversations')}
              className="rounded-xl"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
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
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-coral rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4 space-y-2">
            {isLoading ? (
              <LoadingSkeleton variant="list" count={4} />
            ) : acceptedConnections.length === 0 ? (
              <EmptyState
                icon={Users2}
                title={t('connections.noFriends')}
                description={t('connections.noFriendsDesc')}
              />
            ) : (
              acceptedConnections.map(c => renderConnectionCard(c))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4 space-y-2">
            {isLoading ? (
              <LoadingSkeleton variant="list" count={3} />
            ) : pendingRequests.length === 0 ? (
              <EmptyState
                icon={Clock}
                title={t('connections.noPending')}
                description={t('connections.noPendingDesc')}
              />
            ) : (
              pendingRequests.map(c => renderConnectionCard(c, true))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
