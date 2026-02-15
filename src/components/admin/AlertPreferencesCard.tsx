import { useState, useEffect } from 'react';
import { Bell, Mail, AlertTriangle, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n';
import { logger } from '@/lib/logger';

interface AlertPreferences {
  email: string;
  alert_new_user: boolean;
  alert_high_reports: boolean;
  alert_error_spike: boolean;
}

export function AlertPreferencesCard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<AlertPreferences>({
    email: '', alert_new_user: true, alert_high_reports: true, alert_error_spike: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('admin_alert_preferences').select('*').eq('user_id', user.id).maybeSingle();
      if (error) { logger.api.error('admin_alert_preferences', 'fetch', String(error)); }
      else if (data) {
        setPreferences({ email: data.email, alert_new_user: data.alert_new_user, alert_high_reports: data.alert_high_reports, alert_error_spike: data.alert_error_spike });
      }
      setIsLoading(false);
    };
    fetchPreferences();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from('admin_alert_preferences').upsert({
      user_id: user.id, email: preferences.email, alert_new_user: preferences.alert_new_user,
      alert_high_reports: preferences.alert_high_reports, alert_error_spike: preferences.alert_error_spike, updated_at: new Date().toISOString(),
    });
    if (error) { logger.api.error('admin_alert_preferences', 'save', String(error)); toast.error(t('adminAlerts.saveError')); }
    else { toast.success(t('adminAlerts.saveSuccess')); }
    setIsSaving(false);
  };

  const togglePreference = (key: keyof AlertPreferences) => {
    if (typeof preferences[key] === 'boolean') { setPreferences(prev => ({ ...prev, [key]: !prev[key] })); }
  };

  if (isLoading) {
    return (
      <Card className="glass border-0"><CardContent className="p-6">
        <div className="animate-pulse space-y-4"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-10 bg-muted rounded" /><div className="h-8 bg-muted rounded w-2/3" /></div>
      </CardContent></Card>
    );
  }

  return (
    <Card className="glass border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-coral" />{t('adminAlerts.title')}</CardTitle>
        <CardDescription>{t('adminAlerts.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="alert-email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{t('adminAlerts.notificationEmail')}</Label>
          <Input id="alert-email" type="email" placeholder="admin@example.com" value={preferences.email} onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))} className="bg-background/50" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-signal-green/20"><Users className="h-4 w-4 text-signal-green" /></div><div><p className="font-medium text-sm">{t('adminAlerts.newUsers')}</p><p className="text-xs text-muted-foreground">{t('adminAlerts.newUsersDesc')}</p></div></div>
            <Switch checked={preferences.alert_new_user} onCheckedChange={() => togglePreference('alert_new_user')} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-signal-yellow/20"><AlertTriangle className="h-4 w-4 text-signal-yellow" /></div><div><p className="font-medium text-sm">{t('adminAlerts.highReports')}</p><p className="text-xs text-muted-foreground">{t('adminAlerts.highReportsDesc')}</p></div></div>
            <Switch checked={preferences.alert_high_reports} onCheckedChange={() => togglePreference('alert_high_reports')} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-coral/20"><Zap className="h-4 w-4 text-coral" /></div><div><p className="font-medium text-sm">{t('adminAlerts.errorSpikes')}</p><p className="text-xs text-muted-foreground">{t('adminAlerts.errorSpikesDesc')}</p></div></div>
            <Switch checked={preferences.alert_error_spike} onCheckedChange={() => togglePreference('alert_error_spike')} />
          </div>
        </div>
        <Button onClick={savePreferences} disabled={isSaving || !preferences.email} className="w-full">
          {isSaving ? t('adminAlerts.saving') : t('adminAlerts.savePreferences')}
        </Button>
      </CardContent>
    </Card>
  );
}
