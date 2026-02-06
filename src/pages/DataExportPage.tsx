import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileJson, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGdprExport } from '@/hooks/useGdprExport';
import { useTranslation } from '@/lib/i18n';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function DataExportPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { downloadExport, isExporting } = useGdprExport();
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExportComplete(false);
    const { error } = await downloadExport();
    if (error) { setExportError(error.message); toast.error(t('dataExport.exportError')); }
    else { setExportComplete(true); toast.success(t('dataExport.exportedSuccess')); }
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate('/privacy-settings')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('dataExport.title')}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        <Card className="glass border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-coral/20"><FileJson className="h-5 w-5 text-coral" /></div>
              <div>
                <CardTitle className="text-lg">{t('dataExport.portabilityRight')}</CardTitle>
                <CardDescription>{t('dataExport.gdprArticle')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('dataExport.description')}</p>
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">{t('dataExport.includedData')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('dataExport.profileData')}</li>
                <li>• {t('dataExport.accountSettings')}</li>
                <li>• {t('dataExport.usageStats')}</li>
                <li>• {t('dataExport.interactionHistory')}</li>
                <li>• {t('dataExport.emergencyContacts')}</li>
                <li>• {t('dataExport.reportsSubmitted')}</li>
                <li>• {t('dataExport.feedbackSent')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button onClick={handleExport} disabled={isExporting} className="w-full h-14 text-lg gap-3">
            {isExporting ? (<><Loader2 className="h-5 w-5 animate-spin" />{t('dataExport.exporting')}</>) : (<><Download className="h-5 w-5" />{t('dataExport.downloadData')}</>)}
          </Button>
          {exportComplete && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-signal-green/10 text-signal-green">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{t('dataExport.exportSuccess')}</p>
            </div>
          )}
          {exportError && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{exportError}</p>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>{t('dataExport.formatInfo')}</p>
          <p className="mt-1">{t('dataExport.contactInfo')}</p>
        </div>
      </div>
    </PageLayout>
  );
}
