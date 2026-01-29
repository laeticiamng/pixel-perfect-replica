import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellRing, Volume2, Vibrate, Clock, Users, BellOff, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    setPushNotifications,
    setSoundNotifications,
    setProximityVibration,
  } = useUserSettings();

  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

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

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await subscribe();
      if (success) {
        await setPushNotifications(true);
      }
    } else {
      await unsubscribe();
      await setPushNotifications(false);
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { text: 'Non supporté', color: 'text-muted-foreground' };
    }
    if (permission === 'granted') {
      return { text: 'Autorisé', color: 'text-signal-green' };
    }
    if (permission === 'denied') {
      return { text: 'Bloqué', color: 'text-destructive' };
    }
    return { text: 'Non demandé', color: 'text-signal-yellow' };
  };

  const permissionStatus = getPermissionStatus();

  const notificationSettings = [
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
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour au profil"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Push Notifications Card */}
        <div className="glass rounded-xl p-4 border-2 border-coral/30 animate-fade-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isSubscribed ? 'bg-signal-green/20' : 'bg-coral/20'}`}>
                {isSubscribed ? (
                  <Bell className="h-5 w-5 text-signal-green" />
                ) : (
                  <BellOff className="h-5 w-5 text-coral" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">Notifications push</p>
                <p className="text-sm text-muted-foreground">
                  Statut: <span className={permissionStatus.color}>{permissionStatus.text}</span>
                </p>
              </div>
            </div>
            
            {isSupported && (
              <Switch
                checked={isSubscribed && settings.push_notifications}
                onCheckedChange={handlePushToggle}
                disabled={permission === 'denied'}
              />
            )}
          </div>
          
          {permission === 'denied' && (
            <p className="text-xs text-destructive mt-3">
              ⚠️ Les notifications sont bloquées. Autorise-les dans les paramètres de ton navigateur.
            </p>
          )}
          
          {!isSupported && (
            <p className="text-xs text-muted-foreground mt-3">
              ℹ️ Ton navigateur ne supporte pas les notifications push.
            </p>
          )}
        </div>

        {/* Status Banner */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20">
              <Check className="h-5 w-5 text-signal-green" />
            </div>
            <div>
              <p className="font-medium text-foreground">Paramètres actifs</p>
              <p className="text-sm text-muted-foreground">
                {[isSubscribed && settings.push_notifications, settings.sound_notifications, settings.proximity_vibration].filter(Boolean).length}/3 activés
              </p>
            </div>
          </div>
        </div>

        {/* Active Settings */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Autres paramètres
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

        {/* Nearby Alerts - Now Active! */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/20">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">Alertes de nouveaux signaux</p>
                <span className="px-2 py-0.5 text-xs font-medium bg-signal-green/20 text-signal-green rounded-full">
                  Actif
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu seras notifié quand quelqu'un arrive à proximité
              </p>
            </div>
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
            💡 Pour recevoir les notifications même quand l'app est fermée, 
            installe Signal comme application sur ton téléphone.
          </p>
          <Button
            variant="ghost"
            className="w-full mt-2 text-coral"
            onClick={() => navigate('/install')}
          >
            Installer l'application
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
