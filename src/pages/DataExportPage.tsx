import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileJson, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useGdprExport } from '@/hooks/useGdprExport';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function DataExportPage() {
  const navigate = useNavigate();
  const { downloadExport, isExporting } = useGdprExport();
  const [exportComplete, setExportComplete] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setExportError(null);
    setExportComplete(false);
    const { error } = await downloadExport();
    
    if (error) {
      setExportError(error.message);
      toast.error('Erreur lors de l\'export');
    } else {
      setExportComplete(true);
      toast.success('Données exportées avec succès !');
    }
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/privacy-settings')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Retour aux paramètres de confidentialité"
          >
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Exporter mes données</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-6">
        {/* Info Card */}
        <Card className="glass border-0">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-coral/20">
                <FileJson className="h-5 w-5 text-coral" />
              </div>
              <div>
                <CardTitle className="text-lg">Droit à la portabilité</CardTitle>
                <CardDescription>
                  Conformément au RGPD (Article 20)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu as le droit de recevoir une copie de toutes les données personnelles 
              que nous avons collectées te concernant. Ces données sont fournies 
              dans un format structuré et lisible par machine (JSON).
            </p>

            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-2">Données incluses :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Profil (nom, email, université, bio)</li>
                <li>• Paramètres de compte</li>
                <li>• Statistiques d'utilisation</li>
                <li>• Historique des interactions</li>
                <li>• Contacts d'urgence</li>
                <li>• Signalements effectués</li>
                <li>• Feedbacks envoyés</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="space-y-4">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full h-14 text-lg gap-3"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Télécharger mes données
              </>
            )}
          </Button>

          {exportComplete && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-signal-green/10 text-signal-green">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                Tes données ont été téléchargées avec succès. 
                Vérifie ton dossier de téléchargements.
              </p>
            </div>
          )}

          {exportError && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{exportError}</p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>
            Les données sont exportées au format JSON.
          </p>
          <p className="mt-1">
            Pour toute question, contacte-nous via la page d'aide.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
