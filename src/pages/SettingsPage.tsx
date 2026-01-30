import { Ghost, Ruler, Bell, Volume2, Vibrate, Bug, RotateCcw, Palette, Key, Lock, ChevronRight, Shield, Download, BarChart3, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { PageLayout } from '@/components/PageLayout';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useTranslation } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentRouteIndex, totalRoutes } = useSwipeNavigation();
  const { isAdmin } = useAdminCheck();
  const {
    settings,
    setGhostMode,
    setVisibilityDistance,
    setPushNotifications,
    setSoundNotifications,
    setProximityVibration,
    resetSettings,
  } = useUserSettings();

  const handleResetSettings = async () => {
    const { error } = await resetSettings();
    if (error) {
      toast.error(t('settings.resetError'));
    } else {
      toast.success(t('settings.settingsReset'));
    }
  };

  const isDev = import.meta.env.DEV || localStorage.getItem('debug') === 'true';

  const settingsItems = [
    {
      icon: <Ghost className="h-5 w-5" />,
      label: t('settings.ghostMode'),
      description: t('settings.ghostModeDesc'),
      type: 'toggle' as const,
      value: settings.ghost_mode,
      onChange: (v: boolean) => setGhostMode(v),
      premium: true,
    },
    {
      icon: <Ruler className="h-5 w-5" />,
      label: t('settings.visibilityDistance'),
      description: `${settings.visibility_distance}m`,
      type: 'slider' as const,
      value: settings.visibility_distance,
      onChange: (v: number) => setVisibilityDistance(v),
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: t('settings.pushNotifications'),
      type: 'toggle' as const,
      value: settings.push_notifications,
      onChange: (v: boolean) => setPushNotifications(v),
    },
    {
      icon: <Volume2 className="h-5 w-5" />,
      label: t('settings.soundNotifications'),
      type: 'toggle' as const,
      value: settings.sound_notifications,
      onChange: (v: boolean) => setSoundNotifications(v),
    },
    {
      icon: <Vibrate className="h-5 w-5" />,
      label: t('settings.proximityVibration'),
      type: 'toggle' as const,
      value: settings.proximity_vibration,
      onChange: (v: boolean) => setProximityVibration(v),
    },
  ];

  return (
    <PageLayout className="pb-28">
      <div className="max-w-2xl mx-auto w-full">
        <header className="safe-top px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        </header>

      <motion.div 
        className="px-6 space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
          },
        }}
      >
        {/* Language Section */}
        <motion.div 
          className="glass rounded-xl p-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <span className="font-medium text-foreground">{t('settings.language')}</span>
                <p className="text-sm text-muted-foreground mt-0.5">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </motion.div>

        {/* Theme Section */}
        <motion.div 
          className="glass rounded-xl p-4"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <span className="font-medium text-foreground">{t('settings.theme')}</span>
              <p className="text-sm text-muted-foreground mt-0.5">{t('settings.themeDesc')}</p>
            </div>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Quick Access Section */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('settings.quickAccess')}
            </span>
          </div>
          
          <button
            onClick={() => navigate('/notifications-settings')}
            className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/50 active:bg-muted/70 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
                <Bell className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-medium text-foreground">{t('settings.notifications')}</span>
                <p className="text-sm text-muted-foreground">{t('settings.manageAlerts')}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          
          <button
            onClick={() => navigate('/privacy-settings')}
            className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/50 active:bg-muted/70 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-medium text-foreground">{t('settings.privacy')}</span>
                <p className="text-sm text-muted-foreground">{t('settings.dataAndEmergency')}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Security Section */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <span className="font-medium text-foreground">{t('settings.security')}</span>
              <p className="text-sm text-muted-foreground mt-0.5">{t('settings.securityDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/change-password')}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-colors",
              "hover:bg-muted/50 active:bg-muted/70"
            )}
          >
            <Key className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground font-medium">{t('settings.changePassword')}</span>
          </button>
        </div>

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
                        {t('misc.premium')}
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
                      toast(t('settings.premiumFeature'), { icon: '⭐' });
                      return;
                    }
                    item.onChange(checked);
                    toast.success(t('settings.settingUpdated'));
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

        {/* Admin Dashboard (admin only) */}
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin')}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 text-coral hover:bg-coral/10 transition-colors"
          >
            <div className="p-2 rounded-lg bg-coral/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="font-medium">{t('settings.adminDashboard')}</span>
              <p className="text-sm text-muted-foreground">{t('settings.analyticsEngagement')}</p>
            </div>
          </button>
        )}

        {/* Diagnostics (dev only) */}
        {isDev && (
          <button 
            onClick={() => navigate('/diagnostics')}
            className="w-full glass rounded-xl p-4 flex items-center gap-4 text-signal-yellow hover:bg-signal-yellow/10 transition-colors mt-6"
          >
            <div className="p-2 rounded-lg bg-signal-yellow/20">
              <Bug className="h-5 w-5" />
            </div>
            <span className="font-medium">{t('settings.diagnostics')}</span>
          </button>
        )}

        {/* Install App */}
        <button 
          onClick={() => navigate('/install')}
          className="w-full glass rounded-xl p-4 flex items-center gap-4 text-coral hover:bg-coral/10 transition-colors"
        >
          <div className="p-2 rounded-lg bg-coral/20">
            <Download className="h-5 w-5" />
          </div>
          <div className="text-left">
            <span className="font-medium">{t('settings.installApp')}</span>
            <p className="text-sm text-muted-foreground">{t('settings.addToHomeScreen')}</p>
          </div>
        </button>

        {/* Reset Settings */}
        <Button
          variant="outline"
          onClick={handleResetSettings}
          className="w-full h-12 rounded-xl border-border text-foreground hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('settings.resetSettings')}
        </Button>

        {/* Delete Account */}
        <div className="mt-4">
          <DeleteAccountDialog />
        </div>
      </motion.div>
      </div>

      {/* Swipe Indicator */}
      <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
        <SwipeIndicator currentIndex={currentRouteIndex} totalRoutes={totalRoutes} />
      </div>

      <BottomNav />
    </PageLayout>
  );
}
