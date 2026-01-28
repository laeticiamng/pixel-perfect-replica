import { useState } from 'react';
import { Ghost, Ruler, Bell, Volume2, Vibrate, Trash2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SettingItem {
  icon: React.ReactNode;
  label: string;
  description?: string;
  type: 'toggle' | 'slider' | 'button';
  premium?: boolean;
  danger?: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    ghostMode: false,
    visibilityDistance: 200,
    pushNotifications: true,
    soundNotifications: true,
    proximityVibration: true,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const settingsItems: SettingItem[] = [
    {
      icon: <Ghost className="h-5 w-5" />,
      label: 'Mode fantôme',
      description: 'Vois sans être vu',
      type: 'toggle',
      premium: true,
    },
    {
      icon: <Ruler className="h-5 w-5" />,
      label: 'Distance de visibilité',
      description: `${settings.visibilityDistance}m`,
      type: 'slider',
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: 'Notifications push',
      type: 'toggle',
    },
    {
      icon: <Volume2 className="h-5 w-5" />,
      label: 'Son des notifications',
      type: 'toggle',
    },
    {
      icon: <Vibrate className="h-5 w-5" />,
      label: 'Vibration proximité',
      type: 'toggle',
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
                  checked={
                    item.label === 'Mode fantôme' ? settings.ghostMode :
                    item.label === 'Notifications push' ? settings.pushNotifications :
                    item.label === 'Son des notifications' ? settings.soundNotifications :
                    item.label === 'Vibration proximité' ? settings.proximityVibration :
                    false
                  }
                  onCheckedChange={(checked) => {
                    if (item.label === 'Mode fantôme') updateSetting('ghostMode', checked);
                    else if (item.label === 'Notifications push') updateSetting('pushNotifications', checked);
                    else if (item.label === 'Son des notifications') updateSetting('soundNotifications', checked);
                    else if (item.label === 'Vibration proximité') updateSetting('proximityVibration', checked);
                  }}
                  disabled={item.premium}
                />
              )}
            </div>

            {item.type === 'slider' && (
              <div className="mt-4 px-1">
                <Slider
                  value={[settings.visibilityDistance]}
                  onValueChange={([value]) => updateSetting('visibilityDistance', value)}
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

        {/* Delete Account */}
        <button className="w-full glass rounded-xl p-4 flex items-center gap-4 text-destructive hover:bg-destructive/10 transition-colors mt-8">
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
