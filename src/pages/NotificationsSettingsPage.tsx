import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellRing, Volume2, Vibrate, Clock, Users, BellOff, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTranslation } from '@/lib/i18n';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, setPushNotifications, setSoundNotifications, setProximityVibration } = useUserSettings();
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async (setter: (value: boolean) => Promise<{ error: any }>, value: boolean, name: string) => {
    const { error } = await setter(value);
    if (error) {
      toast.error(t('notificationsSettings.updateError'));
    } else {
      toast.success(value ? t('notificationsSettings.toggleEnabled').replace('{name}', name) : t('notificationsSettings.toggleDisabled').replace('{name}', name));
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await subscribe();
      if (success) await setPushNotifications(true);
    } else {
      await unsubscribe();
      await setPushNotifications(false);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) return { text: t('notificationsSettings.notSupported'), color: 'text-muted-foreground' };
    if (permission === 'granted') return { text: t('notificationsSettings.allowed'), color: 'text-signal-green' };
    if (permission === 'denied') return { text: t('notificationsSettings.blocked'), color: 'text-destructive' };
    return { text: t('notificationsSettings.notRequested'), color: 'text-signal-yellow' };
  };

  const permissionStatus = getPermissionStatus();

  const notificationSettings = [
    { icon: <Volume2 className="h-5 w-5" />, label: t('notificationsSettings.soundNotifications'), description: t('notificationsSettings.soundDesc'), value: settings.sound_notifications, onChange: (v: boolean) => handleToggle(setSoundNotifications, v, t('notificationsSettings.soundNotifications')) },
    { icon: <Vibrate className="h-5 w-5" />, label: t('notificationsSettings.proximityVibration'), description: t('notificationsSettings.proximityDesc'), value: settings.proximity_vibration, onChange: (v: boolean) => handleToggle(setProximityVibration, v, t('notificationsSettings.proximityVibration')) },
  ];

  const upcomingFeatures = [
    { icon: <Clock className="h-5 w-5" />, label: t('notificationsSettings.silentHours'), description: t('notificationsSettings.silentHoursDesc') },
    { icon: <BellRing className="h-5 w-5" />, label: t('notificationsSettings.activationReminders'), description: t('notificationsSettings.activationRemindersDesc') },
  ];

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('notificationsSettings.title')}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Push Notifications */}
        <div className="glass rounded-xl p-4 border-2 border-coral/30 animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isSubscribed ? 'bg-signal-green/20' : 'bg-coral/20'}`}>
                {isSubscribed ? <Bell className="h-5 w-5 text-signal-green" /> : <BellOff className="h-5 w-5 text-coral" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{t('notificationsSettings.pushNotifications')}</p>
                <p className="text-sm text-muted-foreground">Status: <span className={permissionStatus.color}>{permissionStatus.text}</span></p>
              </div>
            </div>
            {isSupported && <Switch checked={isSubscribed && settings.push_notifications} onCheckedChange={handlePushToggle} disabled={permission === 'denied'} />}
          </div>
          {permission === 'denied' && <p className="text-xs text-destructive mt-3">{t('notificationsSettings.blockedWarning')}</p>}
          {!isSupported && <p className="text-xs text-muted-foreground mt-3">{t('notificationsSettings.notSupportedWarning')}</p>}
        </div>

        {/* Active status */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20"><Check className="h-5 w-5 text-signal-green" /></div>
            <div>
              <p className="font-medium text-foreground">{t('notificationsSettings.activeSettings')}</p>
              <p className="text-sm text-muted-foreground">
                {[isSubscribed && settings.push_notifications, settings.sound_notifications, settings.proximity_vibration].filter(Boolean).length}/3 {t('notificationsSettings.enabled')}
              </p>
            </div>
          </div>
        </div>

        {/* Other Settings */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('notificationsSettings.otherSettings')}</h2>
          <div className="space-y-3">
            {notificationSettings.map((setting, idx) => (
              <div key={setting.label} className="glass rounded-xl p-4 flex items-center justify-between gap-4 animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${setting.value ? 'bg-coral/20 text-coral' : 'bg-deep-blue-light text-muted-foreground'} transition-colors`}>{setting.icon}</div>
                  <div><p className="font-medium text-foreground">{setting.label}</p><p className="text-sm text-muted-foreground">{setting.description}</p></div>
                </div>
                <Switch checked={setting.value} onCheckedChange={setting.onChange} />
              </div>
            ))}
          </div>
        </div>

        {/* Signal alerts */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/20">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green"><Users className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">{t('notificationsSettings.newSignalAlerts')}</p>
                <span className="px-2 py-0.5 text-xs font-medium bg-signal-green/20 text-signal-green rounded-full">{t('notificationsSettings.active')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('notificationsSettings.newSignalDesc')}</p>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('notificationsSettings.comingSoon')}</h2>
          <div className="space-y-3">
            {upcomingFeatures.map((feature) => (
              <div key={feature.label} className="glass rounded-xl p-4 flex items-center justify-between gap-4 opacity-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">{feature.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{feature.label}</p>
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">{t('notificationsSettings.soon')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Install tip */}
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">{t('notificationsSettings.installTip')}</p>
          <Button variant="ghost" className="w-full mt-2 text-coral" onClick={() => navigate('/install')}>{t('notificationsSettings.installApp')}</Button>
        </div>
      </div>
    </PageLayout>
  );
}
