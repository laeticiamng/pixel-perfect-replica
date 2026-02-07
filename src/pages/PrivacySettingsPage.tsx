import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ghost, Eye, MapPin, Shield, Lock, Download, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useGdprExport } from '@/hooks/useGdprExport';
import { useTranslation } from '@/lib/i18n';
import { EmergencyContactsManager } from '@/components/safety';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import toast from 'react-hot-toast';

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, setGhostMode, setVisibilityDistance } = useUserSettings();
  const { downloadExport, isExporting } = useGdprExport();

  const handleExportData = async () => {
    const { error } = await downloadExport();
    if (error) toast.error(t('privacySettings.exportError'));
    else toast.success(t('privacySettings.exportSuccess'));
  };

  const handleGhostMode = async () => {
    toast(t('privacySettings.ghostModePremium'));
  };

  const handleDistanceChange = async (value: number) => {
    const { error } = await setVisibilityDistance(value);
    if (!error) toast.success(t('privacySettings.visibilityToast').replace('{distance}', String(value)));
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate('/profile')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('privacySettings.title')}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20"><Shield className="h-5 w-5 text-signal-green" /></div>
            <div>
              <p className="font-medium text-foreground">{t('privacySettings.maxProtection')}</p>
              <p className="text-sm text-muted-foreground">{t('privacySettings.maxProtectionDesc')}</p>
            </div>
          </div>
        </div>

        <EmergencyContactsManager />

        {/* Ghost Mode */}
        <div className="glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground"><Ghost className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{t('privacySettings.ghostMode')}</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-coral/20 text-coral rounded-full">{t('misc.premium')}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{t('privacySettings.ghostModeDesc')}</p>
              </div>
            </div>
            <Switch checked={settings.ghost_mode} onCheckedChange={handleGhostMode} disabled />
          </div>
        </div>

        {/* Visibility Distance */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground"><MapPin className="h-5 w-5" /></div>
            <div>
              <span className="font-medium text-foreground">{t('privacySettings.visibilityDistance')}</span>
              <p className="text-sm text-muted-foreground mt-0.5">{t('privacySettings.visibilityDistanceDesc')}</p>
            </div>
          </div>
          <div className="px-1">
            <Slider value={[settings.visibility_distance]} onValueChange={([value]) => handleDistanceChange(value)} min={50} max={500} step={50} className="w-full" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>50m</span>
              <span className="text-coral font-semibold">{settings.visibility_distance}m</span>
              <span>500m</span>
            </div>
          </div>
        </div>

        {/* How data protected */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('privacySettings.howDataProtected')}</h2>
          <div className="space-y-3">
            {[
              { icon: Eye, title: t('privacySettings.firstNameOnly'), desc: t('privacySettings.firstNameOnlyDesc') },
              { icon: MapPin, title: t('privacySettings.positionNotStored'), desc: t('privacySettings.positionNotStoredDesc') },
              { icon: Shield, title: t('privacySettings.encryptedData'), desc: t('privacySettings.encryptedDataDesc') },
              { icon: Lock, title: t('privacySettings.fullControl'), desc: t('privacySettings.fullControlDesc') },
            ].map(item => (
              <div key={item.title} className="glass rounded-xl p-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green"><item.icon className="h-5 w-5" /></div>
                <div><p className="font-medium text-foreground">{item.title}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Export */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-coral/20 text-coral"><Download className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{t('privacySettings.exportData')}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{t('privacySettings.exportDataDesc')}</p>
            </div>
          </div>
          <Button onClick={handleExportData} disabled={isExporting} className="w-full mt-4 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl">
            {isExporting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('privacySettings.exporting')}</>) : (<><Download className="mr-2 h-4 w-4" />{t('privacySettings.downloadData')}</>)}
          </Button>
        </div>

        <button onClick={() => navigate('/blocked-users')} className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
          <div className="p-2 rounded-lg bg-destructive/20 text-destructive"><Shield className="h-5 w-5" /></div>
          <div className="text-left flex-1">
            <p className="font-medium text-foreground">{t('privacySettings.blockedUsers')}</p>
            <p className="text-sm text-muted-foreground">{t('privacySettings.blockedUsersDesc')}</p>
          </div>
        </button>

        <button onClick={() => navigate('/data-export')} className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
          <div className="p-2 rounded-lg bg-coral/20 text-coral"><Download className="h-5 w-5" /></div>
          <div className="text-left flex-1">
            <p className="font-medium text-foreground">{t('privacySettings.fullDataExport')}</p>
            <p className="text-sm text-muted-foreground">{t('privacySettings.fullDataExportDesc')}</p>
          </div>
        </button>

        <button onClick={() => navigate('/privacy')} className="w-full glass rounded-xl p-4 text-center text-coral font-medium hover:bg-coral/10 transition-colors">
          {t('privacySettings.viewPrivacyPolicy')}
        </button>
      </div>
    </PageLayout>
  );
}
