import { Bell, Check, CheckCheck, Trash2, MessageCircle, UserPlus, CalendarDays, MapPin } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  message: <MessageCircle className="h-5 w-5 text-primary" />,
  connection_request: <UserPlus className="h-5 w-5 text-coral" />,
  session_reminder: <CalendarDays className="h-5 w-5 text-accent-foreground" />,
  proximity_alert: <MapPin className="h-5 w-5 text-signal-green" />,
  default: <Bell className="h-5 w-5 text-muted-foreground" />,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { t, locale } = useTranslation();

  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  const getIcon = (type: string) => NOTIF_ICONS[type] || NOTIF_ICONS.default;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <PageHeader
          title={t('notificationsPage.title')}
          subtitle={t('notificationsPage.subtitle')}
          showBack
          rightContent={unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="rounded-xl flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {t('notificationsPage.markAllRead')}
            </Button>
          ) : undefined}
        />

        {isLoading ? (
          <LoadingSkeleton variant="list" count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={t('notificationsPage.empty')}
            description={t('notificationsPage.emptyDesc')}
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl transition-all",
                  notif.read_at 
                    ? "bg-muted/30" 
                    : "glass border-l-4 border-l-coral"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm",
                    notif.read_at ? "text-muted-foreground" : "text-foreground font-medium"
                  )}>
                    {notif.title}
                  </p>
                  {notif.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {notif.body}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: dateFnsLocale })}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!notif.read_at && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notif.id)}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notif.id)}
                    className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
