import { Ghost, Ruler, Bell, Volume2, Vibrate, Trash2, Bug } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const {
    settings,
    setGhostMode,
    setVisibilityDistance,
    setPushNotifications,
    setSoundNotifications,
    setProximityVibration,
  } = useUserSettings();

  const isDev = import.meta.env.DEV || localStorage.getItem('debug') === 'true';

  const handleDeleteAccount = async () => {
    if (confirm('Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.')) {
      // Delete user data first
      if (user) {
        logger.action.reportSubmitted(user.id, 'account_deletion');
        await supabase.from('active_signals').delete().eq('user_id', user.id);
        await supabase.from('user_settings').delete().eq('user_id', user.id);
        await supabase.from('user_stats').delete().eq('user_id', user.id);
        await supabase.from('profiles').delete().eq('id', user.id);
      }
      await signOut();
      toast.success('Compte supprimé');
      navigate('/');
    }
  };

  const settingsItems = [
    {
      icon: <Ghost className="h-5 w-5" />,
      label: 'Mode fantôme',
      description: 'Vois sans être vu',
      type: 'toggle' as const,
      value: settings.ghost_mode,
      onChange: (v: boolean) => setGhostMode(v),
      premium: true,
    },
    {
      icon: <Ruler className="h-5 w-5" />,
      label: 'Distance de visibilité',
      description: `${settings.visibility_distance}m`,
      type: 'slider' as const,
      value: settings.visibility_distance,
      onChange: (v: number) => setVisibilityDistance(v),
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications push',
      type: 'toggle' as const,
      value: settings.push_notifications,
      onChange: (v: boolean) => setPushNotifications(v),
    },
    {
      icon: <Volume2 className="h-5 w-5" />,
      label: 'Son des notifications',
      type: 'toggle' as const,
      value: settings.sound_notifications,
      onChange: (v: boolean) => setSoundNotifications(v),
    },
    {
      icon: <Vibrate className="h-5 w-5" />,
      label: 'Vibration proximité',
      type: 'toggle' as const,
      value: settings.proximity_vibration,
      onChange: (v: boolean) => setProximityVibration(v),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial pb-28">
      <header className="safe-top px-6 py-6">
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      </header>

      <div className="px-6 space-y-4">
        {settingsItems.map((item) => (
          <div
            key={item.label}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.label}</span>
                    {item.premium && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-coral/20 text-coral rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {item.type === 'toggle' && (
                <Switch
                  checked={item.value as boolean}
                  onCheckedChange={(checked) => {
                    if (item.premium) {
                      toast('Cette fonctionnalité est Premium !', { icon: '⭐' });
                      return;
                    }
                    item.onChange(checked);
                    toast.success('Paramètre mis à jour');
                  }}
                  disabled={item.premium}
                />
              )}
            </div>

            {item.type === 'slider' && (
              <div className="mt-4 px-1">
                <Slider
                  value={[item.value as number]}
                  onValueChange={([value]) => {
                    item.onChange(value);
                  }}
                  min={50}
                  max={500}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>50m</span>
                  <span>500m</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Diagnostics (dev only) */}
        {isDev && (
          <button 
            onClick={() => navigate('/diagnostics')}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 text-signal-yellow hover:bg-signal-yellow/10 transition-colors mt-6"
          >
            <div className="p-2 rounded-lg bg-signal-yellow/20">
              <Bug className="h-5 w-5" />
            </div>
            <span className="font-medium">Diagnostics (Dev)</span>
          </button>
        )}

        {/* Delete Account */}
        <button 
          onClick={handleDeleteAccount}
          className="w-full glass rounded-xl p-4 flex items-center gap-4 text-destructive hover:bg-destructive/10 transition-colors mt-4"
        >
          <div className="p-2 rounded-lg bg-destructive/20">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="font-medium">Supprimer mon compte</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
