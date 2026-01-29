import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellRing, Volume2, Vibrate, Clock, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { PageLayout } from '@/components/PageLayout';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    setPushNotifications,
    setSoundNotifications,
    setProximityVibration,
  } = useUserSettings();

  const handleToggle = async (
    setter: (value: boolean) => Promise<{ error: any }>,
    value: boolean,
    name: string
  ) => {
    const { error } = await setter(value);
    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success(`${name} ${value ? 'activé' : 'désactivé'}`);
    }
  };

  const notificationSettings = [
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications push',
      description: 'Recevoir des notifications sur ton téléphone',
      value: settings.push_notifications,
      onChange: (v: boolean) => handleToggle(setPushNotifications, v, 'Notifications push'),
    },
    {
      icon: <Volume2 className="h-5 w-5" />,
      label: 'Son des notifications',
      description: 'Jouer un son lors des notifications',
      value: settings.sound_notifications,
      onChange: (v: boolean) => handleToggle(setSoundNotifications, v, 'Son'),
    },
    {
      icon: <Vibrate className="h-5 w-5" />,
      label: 'Vibration de proximité',
      description: 'Vibrer quand quelqu\'un est très proche',
      value: settings.proximity_vibration,
      onChange: (v: boolean) => handleToggle(setProximityVibration, v, 'Vibration'),
    },
  ];

  const upcomingFeatures = [
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Alertes de nouveaux signaux',
      description: 'Être notifié quand des signaux apparaissent',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: 'Heures silencieuses',
      description: 'Définir des plages horaires sans notification',
    },
    {
      icon: <BellRing className="h-5 w-5" />,
      label: 'Rappels d\'activation',
      description: 'Rappel pour activer ton signal',
    },
  ];

  return (
    <PageLayout className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Retour aux paramètres"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Status Banner */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20">
              <Bell className="h-5 w-5 text-signal-green" />
            </div>
            <div>
              <p className="font-medium text-foreground">Notifications actives</p>
              <p className="text-sm text-muted-foreground">
                {[settings.push_notifications, settings.sound_notifications, settings.proximity_vibration].filter(Boolean).length}/3 paramètres activés
              </p>
            </div>
          </div>
        </div>

        {/* Active Settings */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Paramètres actifs
          </h2>
          <div className="space-y-3">
            {notificationSettings.map((setting, idx) => (
              <div
                key={setting.label}
                className="glass rounded-xl p-4 flex items-center justify-between gap-4 animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${setting.value ? 'bg-coral/20 text-coral' : 'bg-deep-blue-light text-muted-foreground'} transition-colors`}>
                    {setting.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch
                  checked={setting.value}
                  onCheckedChange={setting.onChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Bientôt disponible
          </h2>
          <div className="space-y-3">
            {upcomingFeatures.map((feature) => (
              <div
                key={feature.label}
                className="glass rounded-xl p-4 flex items-center justify-between gap-4 opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{feature.label}</p>
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        Bientôt
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 Les notifications push nécessitent que tu autorises les notifications 
            dans les paramètres de ton navigateur.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}