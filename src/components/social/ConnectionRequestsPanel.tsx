import { useState, useEffect } from 'react';
import { UserCheck, UserX, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/hooks/useConnections';
import { useTranslation } from '@/lib/i18n';
import { ACTIVITIES } from '@/types/signal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProfileInfo {
  id: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
}

interface ConnectionRequestsPanelProps {
  className?: string;
}

export function ConnectionRequestsPanel({ className }: ConnectionRequestsPanelProps) {
  const { t } = useTranslation();
  const { pendingRequests, acceptConnection, declineConnection } = useConnections();
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Fetch profiles for pending request initiators
  useEffect(() => {
    if (pendingRequests.length === 0) return;

    const userIds = pendingRequests.map(r => r.initiated_by);
    const missingIds = userIds.filter(id => !profiles[id]);

    if (missingIds.length === 0) return;

    const fetchProfiles = async () => {
      const { data } = await supabase
        .rpc('get_public_profiles', { profile_ids: missingIds });

      if (data) {
        const profileMap: Record<string, ProfileInfo> = {};
        data.forEach((p: any) => {
          profileMap[p.id] = p;
        });
        setProfiles(prev => ({ ...prev, ...profileMap }));
      }
    };

    fetchProfiles();
  }, [pendingRequests]);

  const handleAccept = async (connectionId: string) => {
    setLoadingAction(connectionId);
    const result = await acceptConnection(connectionId);
    setLoadingAction(null);

    if (result.success) {
      toast.success(t('connections.accepted'));
    } else {
      toast.error(t('connections.acceptError'));
    }
  };

  const handleDecline = async (connectionId: string) => {
    setLoadingAction(connectionId);
    const result = await declineConnection(connectionId);
    setLoadingAction(null);

    if (result.success) {
      toast(t('connections.declined'), { icon: '👋' });
    } else {
      toast.error(t('connections.declineError'));
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('connections.justNow');
    return t('connections.minutesAgo', { n: minutes });
  };

  if (pendingRequests.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 px-1">
        <Users className="h-4 w-4 text-coral" />
        <span className="text-sm font-semibold text-foreground">
          {t('connections.pendingRequests')} ({pendingRequests.length})
        </span>
      </div>

      {pendingRequests.map((request) => {
        const profile = profiles[request.initiated_by];
        const activityData = ACTIVITIES.find(a => a.id === request.activity);
        const isLoading = loadingAction === request.id;

        return (
          <div
            key={request.id}
            className="glass rounded-2xl p-4 border border-signal-green/20 animate-slide-up"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.first_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary-foreground">
                    {profile?.first_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {profile?.first_name || '...'}{' '}
                  <span className="font-normal text-muted-foreground">
                    {t('connections.wantsToConnect')}
                  </span>{' '}
                  <span>{activityData?.emoji} {t(activityData?.labelKey || 'activities.other')}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {getTimeAgo(request.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.id)}
                disabled={isLoading}
                className="flex-1 h-9 bg-signal-green hover:bg-signal-green/80 text-primary-foreground rounded-xl gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                {t('connections.accept')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(request.id)}
                disabled={isLoading}
                className="flex-1 h-9 rounded-xl gap-1.5 text-muted-foreground"
              >
                <UserX className="h-4 w-4" />
                {t('connections.decline')}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
