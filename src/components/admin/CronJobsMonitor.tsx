import { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle, XCircle, RefreshCw, Loader2, Timer, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CronJob {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

interface CronJobRun {
  runid: number;
  jobid: number;
  job_pid: number | null;
  database: string;
  username: string;
  command: string;
  status: string;
  return_message: string | null;
  start_time: string;
  end_time: string | null;
}

// Cron jobs configurés (hardcodés car pg_cron n'est pas accessible via RLS)
const CONFIGURED_CRON_JOBS = [
  {
    name: 'daily-cleanup-expired',
    schedule: '0 3 * * *',
    description: 'Purge des données expirées (signaux, locations, logs)',
    action: 'cleanup-expired',
    lastRunInfo: 'Exécution quotidienne à 3h00 UTC'
  },
  {
    name: 'hourly-cleanup-shadow-bans',
    schedule: '0 * * * *',
    description: 'Lever les shadow-bans expirés',
    action: 'cleanup-shadow-bans',
    lastRunInfo: 'Exécution toutes les heures'
  },
  {
    name: 'send-session-reminders',
    schedule: '*/5 * * * *',
    description: 'Envoi des rappels de session (1h et 15min avant)',
    action: 'send-session-reminders',
    lastRunInfo: 'Exécution toutes les 5 minutes'
  }
];

export function CronJobsMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastCleanupResult, setLastCleanupResult] = useState<string | null>(null);
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'idle' | 'running' | 'success' | 'error'>>({});

  const runManualCleanup = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'running' }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('system', {
        body: { action: 'cleanup-expired' }
      });

      if (response.error) throw response.error;

      setLastCleanupResult(JSON.stringify(response.data, null, 2));
      setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'success' }));
      toast.success('Nettoyage manuel effectué');
    } catch (error) {
      console.error('Cleanup error:', error);
      setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'error' }));
      toast.error('Erreur lors du nettoyage');
    } finally {
      setIsLoading(false);
    }
  };

  const runManualShadowBanCleanup = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'running' }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('system', {
        body: { action: 'check-shadow-bans' }
      });

      if (response.error) throw response.error;

      setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'success' }));
      toast.success('Vérification des shadow-bans effectuée');
    } catch (error) {
      console.error('Shadow ban cleanup error:', error);
      setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'error' }));
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const runManualReminders = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'running' }));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('notifications', {
        body: { action: 'send-session-reminders' }
      });

      if (response.error) throw response.error;

      setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'success' }));
      toast.success('Rappels de session envoyés');
    } catch (error) {
      console.error('Reminders error:', error);
      setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'error' }));
      toast.error('Erreur lors de l\'envoi des rappels');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-signal-yellow" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-signal-green" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-coral" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionHandler = (action: string) => {
    switch (action) {
      case 'cleanup-expired':
        return runManualCleanup;
      case 'cleanup-shadow-bans':
        return runManualShadowBanCleanup;
      case 'send-session-reminders':
        return runManualReminders;
      default:
        return () => {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-coral" />
            Tâches Planifiées (Cron Jobs)
          </CardTitle>
          <CardDescription>
            Surveillance et exécution manuelle des tâches de maintenance automatique
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {CONFIGURED_CRON_JOBS.map((job) => (
          <Card key={job.name} className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(jobStatuses[job.name] || 'idle')}
                    <h3 className="font-semibold text-foreground">{job.name}</h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      {job.schedule}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {job.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{job.lastRunInfo}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getActionHandler(job.action)}
                  disabled={isLoading}
                  className="shrink-0"
                >
                  {isLoading && jobStatuses[job.name] === 'running' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Exécuter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Result */}
      {lastCleanupResult && (
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-signal-green" />
              Dernier résultat de nettoyage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted/30 p-3 rounded-lg overflow-x-auto text-muted-foreground">
              {lastCleanupResult}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="glass border-0 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-coral/20">
              <Clock className="h-4 w-4 text-coral" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">À propos des Cron Jobs</h4>
              <p className="text-sm text-muted-foreground">
                Les tâches planifiées s'exécutent automatiquement via PostgreSQL pg_cron. 
                Les logs détaillés sont disponibles dans la table <code className="bg-muted px-1 rounded">cron.job_run_details</code>.
                Vous pouvez exécuter manuellement chaque tâche pour tester ou forcer une exécution immédiate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
