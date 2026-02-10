import { useMemo, useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck, ShieldX, Siren, TrendingUp } from 'lucide-react';
import { ActionValidation, HealthStatus, pendingValidationsMock, platformsMock, strategicWatchMock } from '@/data/presidentCockpitMock';

interface ValidationHistoryItem extends ActionValidation {
  decision: 'approuvee' | 'rejetee';
  decisionLe: string;
}

const healthBadgeClass: Record<HealthStatus, string> = {
  vert: 'bg-signal-green/20 text-signal-green border-signal-green/30',
  orange: 'bg-signal-yellow/20 text-signal-yellow border-signal-yellow/30',
  rouge: 'bg-coral/20 text-coral border-coral/30',
};

const riskBadgeClass: Record<ActionValidation['niveauRisque'], string> = {
  faible: 'bg-signal-green/20 text-signal-green border-signal-green/30',
  modere: 'bg-signal-yellow/20 text-signal-yellow border-signal-yellow/30',
  eleve: 'bg-coral/20 text-coral border-coral/30',
};

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function PresidentCockpitPage() {
  const [validations, setValidations] = useState<ActionValidation[]>(pendingValidationsMock);
  const [validationHistory, setValidationHistory] = useState<ValidationHistoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'tous' | HealthStatus>('tous');

  const kpiGlobaux = useMemo(() => {
    const alertesTotal = platformsMock.reduce((acc, platform) => acc + platform.alertesOuvertes, 0);
    const utilisateursTotal = platformsMock.reduce((acc, platform) => acc + platform.utilisateursActifs, 0);
    const uptimeMoyen = platformsMock.reduce((acc, platform) => acc + platform.uptime, 0) / platformsMock.length;
    const actionsEnAttente = validations.length;

    return {
      alertesTotal,
      utilisateursTotal,
      uptimeMoyen,
      actionsEnAttente,
    };
  }, [validations.length]);

  const plateformesFiltrees = useMemo(
    () => platformsMock.filter((platform) => statusFilter === 'tous' || platform.healthStatus === statusFilter),
    [statusFilter],
  );

  const rapportDuJour = useMemo(() => {
    const critiques = platformsMock.filter((platform) => platform.healthStatus === 'rouge').map((platform) => platform.nom);
    const sousSurveillance = platformsMock.filter((platform) => platform.healthStatus === 'orange').map((platform) => platform.nom);
    const meilleureProgression = [...platformsMock].sort((a, b) => b.variationHebdo - a.variationHebdo)[0];

    return {
      critiques,
      sousSurveillance,
      meilleureProgression,
    };
  }, []);

  const traiterValidation = (action: ActionValidation, decision: 'approuvee' | 'rejetee') => {
    setValidations((prev) => prev.filter((item) => item.id !== action.id));
    setValidationHistory((prev) => [
      {
        ...action,
        decision,
        decisionLe: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <section className="safe-top px-4 md:px-6 py-4 space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">President Cockpit HQ</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Pilotage centralisé des 7 plateformes SaaS d&apos;EMOTIONSCARE SASU.
        </p>
      </section>

      <section className="px-4 md:px-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="glass border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Uptime moyen</p>
              <p className="text-2xl font-bold">{kpiGlobaux.uptimeMoyen.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card className="glass border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Utilisateurs actifs</p>
              <p className="text-2xl font-bold">{kpiGlobaux.utilisateursTotal.toLocaleString('fr-FR')}</p>
            </CardContent>
          </Card>
          <Card className="glass border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Alertes ouvertes</p>
              <p className="text-2xl font-bold">{kpiGlobaux.alertesTotal}</p>
            </CardContent>
          </Card>
          <Card className="glass border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Actions à valider</p>
              <p className="text-2xl font-bold">{kpiGlobaux.actionsEnAttente}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock3 className="h-5 w-5 text-coral" /> Rapport du jour
            </CardTitle>
            <CardDescription>Synthèse IA quotidienne pour le pilotage exécutif.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Statut critique: {rapportDuJour.critiques.length > 0 ? rapportDuJour.critiques.join(', ') : 'Aucune plateforme en rouge'}.
            </p>
            <p>
              Plateformes sous surveillance: {rapportDuJour.sousSurveillance.length > 0 ? rapportDuJour.sousSurveillance.join(', ') : 'Aucune'}.
            </p>
            <p>
              Meilleure dynamique hebdomadaire: <strong>{rapportDuJour.meilleureProgression.nom}</strong> avec{' '}
              <strong>{rapportDuJour.meilleureProgression.variationHebdo.toFixed(1)}%</strong>.
            </p>
            <p>
              Actions recommandées: valider les déploiements critiques en attente et prioriser la réduction des alertes rouges.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-muted/30">
            <TabsTrigger value="dashboard">Dashboard exécutif</TabsTrigger>
            <TabsTrigger value="validation">Validation présidentielle</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring temps réel</TabsTrigger>
            <TabsTrigger value="veille">Veille stratégique</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={statusFilter === 'tous' ? 'default' : 'outline'} onClick={() => setStatusFilter('tous')}>Tous</Button>
              <Button size="sm" variant={statusFilter === 'vert' ? 'default' : 'outline'} onClick={() => setStatusFilter('vert')}>Vert</Button>
              <Button size="sm" variant={statusFilter === 'orange' ? 'default' : 'outline'} onClick={() => setStatusFilter('orange')}>Orange</Button>
              <Button size="sm" variant={statusFilter === 'rouge' ? 'default' : 'outline'} onClick={() => setStatusFilter('rouge')}>Rouge</Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {plateformesFiltrees.map((platform) => (
                <Card key={platform.id} className="glass border-0">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">{platform.nom}</CardTitle>
                        <CardDescription className="break-all">{platform.url}</CardDescription>
                      </div>
                      <Badge className={healthBadgeClass[platform.healthStatus]}>{platform.healthStatus.toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <p>Modules: <strong>{platform.modules}</strong></p>
                    <p>Uptime: <strong>{platform.uptime}%</strong></p>
                    <p>Utilisateurs: <strong>{platform.utilisateursActifs.toLocaleString('fr-FR')}</strong></p>
                    <p>Alertes: <strong>{platform.alertesOuvertes}</strong></p>
                    <p>Dernière MAJ: <strong>{formatDateTime(platform.derniereMaj)}</strong></p>
                    <p>Var. hebdo: <strong className={platform.variationHebdo >= 0 ? 'text-signal-green' : 'text-coral'}>{platform.variationHebdo.toFixed(1)}%</strong></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="mt-6 space-y-4">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-signal-green" />Actions critiques en attente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validations.length === 0 && <p className="text-sm text-muted-foreground">Aucune action en attente de validation.</p>}
                {validations.map((action) => (
                  <div key={action.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{action.titre}</p>
                      <Badge className={riskBadgeClass[action.niveauRisque]}>{action.niveauRisque}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground">{action.auteur} • {formatDateTime(action.creeLe)}</p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => traiterValidation(action, 'approuvee')}>Approuver</Button>
                      <Button size="sm" variant="outline" onClick={() => traiterValidation(action, 'rejetee')}>Rejeter</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="text-lg">Historique des décisions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationHistory.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de décision enregistrée.</p>}
                {validationHistory.map((item) => (
                  <div key={`${item.id}-${item.decisionLe}`} className="flex items-start gap-3 text-sm">
                    {item.decision === 'approuvee' ? <CheckCircle2 className="h-4 w-4 text-signal-green mt-0.5" /> : <ShieldX className="h-4 w-4 text-coral mt-0.5" />}
                    <div>
                      <p><strong>{item.titre}</strong> — {item.decision === 'approuvee' ? 'approuvée' : 'rejetée'}</p>
                      <p className="text-muted-foreground">{formatDateTime(item.decisionLe)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Siren className="h-5 w-5 text-signal-yellow" />Health check visuel</CardTitle>
                <CardDescription>Indicateur temps réel simplifié (mockable vers Supabase Realtime).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {platformsMock.map((platform) => (
                  <div key={`health-${platform.id}`} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium">{platform.nom}</p>
                      <p className="text-xs text-muted-foreground">Dernière sonde: {formatDateTime(platform.derniereMaj)}</p>
                    </div>
                    <Badge className={healthBadgeClass[platform.healthStatus]}>{platform.healthStatus}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="veille" className="mt-6">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-purple-accent" />Veille concurrentielle et marché</CardTitle>
                <CardDescription>Section prête pour brancher des flux RSS/API sectoriels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategicWatchMock.map((item, index) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{item.tendance}</p>
                      <Badge variant="outline">Impact: {item.impact}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Source: {item.source}</p>
                    <p className="text-sm">{item.resume}</p>
                    {index < strategicWatchMock.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="glass border-0">
          <CardContent className="p-4 text-xs text-muted-foreground flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            Données mockées pour phase initiale. Prévoir migration vers tables Supabase (RLS + journalisation RGPD) pour production.
          </CardContent>
        </Card>
      </section>
    </PageLayout>
  );
}
