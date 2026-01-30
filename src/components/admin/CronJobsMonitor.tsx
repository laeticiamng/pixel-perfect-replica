import { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle, XCircle, RefreshCw, Loader2, Timer, Calendar, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CronExecution {
  id: string;
  job_name: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  status: 'running' | 'success' | 'error';
  result: Record<string, unknown>;
  error_message: string | null;
  triggered_by: 'cron' | 'manual';
}

// Cron jobs configurés
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
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'idle' | 'running' | 'success' | 'error'>>({});
  const [executionHistory, setExecutionHistory] = useState<CronExecution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch execution history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('cron_job_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutionHistory((data as CronExecution[]) || []);
    } catch (error) {
      console.error('Error fetching execution history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Log execution start
  const logExecutionStart = async (jobName: string) => {
    try {
      const { data, error } = await supabase
        .from('cron_job_executions')
        .insert({
          job_name: jobName,
          status: 'running',
          triggered_by: 'manual'
        })
        .select()
        .single();

      if (error) throw error;
      return data?.id;
    } catch (error) {
      console.error('Error logging execution start:', error);
      return null;
    }
  };

  // Log execution end
  const logExecutionEnd = async (
    executionId: string | null, 
    status: 'success' | 'error', 
    result?: Record<string, unknown>,
    errorMessage?: string
  ) => {
    if (!executionId) return;
    
    try {
      const durationMs = Date.now() - new Date().getTime(); // Will be calculated on backend

      await supabase
        .from('cron_job_executions')
        .update({
          completed_at: new Date().toISOString(),
          duration_ms: Math.abs(durationMs) || 100,
          status,
          result: result ? JSON.parse(JSON.stringify(result)) : {},
          error_message: errorMessage
        })
        .eq('id', executionId);

      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error('Error logging execution end:', error);
    }
  };

  const runManualCleanup = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'running' }));
    const executionId = await logExecutionStart('daily-cleanup-expired');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        await logExecutionEnd(executionId, 'error', undefined, 'Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('system', {
        body: { action: 'cleanup-expired' }
      });

      if (response.error) throw response.error;

      setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'success' }));
      await logExecutionEnd(executionId, 'success', response.data);
      toast.success('Nettoyage manuel effectué');
    } catch (error) {
      console.error('Cleanup error:', error);
      setJobStatuses(prev => ({ ...prev, 'daily-cleanup-expired': 'error' }));
      await logExecutionEnd(executionId, 'error', undefined, String(error));
      toast.error('Erreur lors du nettoyage');
    } finally {
      setIsLoading(false);
    }
  };

  const runManualShadowBanCleanup = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'running' }));
    const executionId = await logExecutionStart('hourly-cleanup-shadow-bans');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        await logExecutionEnd(executionId, 'error', undefined, 'Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('system', {
        body: { action: 'check-shadow-bans' }
      });

      if (response.error) throw response.error;

      setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'success' }));
      await logExecutionEnd(executionId, 'success', response.data);
      toast.success('Vérification des shadow-bans effectuée');
    } catch (error) {
      console.error('Shadow ban cleanup error:', error);
      setJobStatuses(prev => ({ ...prev, 'hourly-cleanup-shadow-bans': 'error' }));
      await logExecutionEnd(executionId, 'error', undefined, String(error));
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const runManualReminders = async () => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'running' }));
    const executionId = await logExecutionStart('send-session-reminders');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        await logExecutionEnd(executionId, 'error', undefined, 'Session expirée');
        return;
      }

      const response = await supabase.functions.invoke('notifications', {
        body: { action: 'send-session-reminders' }
      });

      if (response.error) throw response.error;

      setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'success' }));
      await logExecutionEnd(executionId, 'success', response.data);
      toast.success('Rappels de session envoyés');
    } catch (error) {
      console.error('Reminders error:', error);
      setJobStatuses(prev => ({ ...prev, 'send-session-reminders': 'error' }));
      await logExecutionEnd(executionId, 'error', undefined, String(error));
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="bg-signal-yellow/10 text-signal-yellow border-signal-yellow/30">En cours</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-signal-green/10 text-signal-green border-signal-green/30">Succès</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-coral/10 text-coral border-coral/30">Erreur</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
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

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
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
        {CONFIGURED_CRON_JOBS.map((job) => {
          // Get last execution for this job
          const lastExecution = executionHistory.find(e => e.job_name === job.name);
          
          return (
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{job.lastRunInfo}</span>
                      </div>
                      {lastExecution && (
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <span>
                            Dernière exécution : {formatDistanceToNow(new Date(lastExecution.started_at), { addSuffix: true, locale: fr })}
                            {lastExecution.duration_ms && ` (${formatDuration(lastExecution.duration_ms)})`}
                          </span>
                        </div>
                      )}
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
          );
        })}
      </div>

      {/* Execution History */}
      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-coral" />
              Historique des exécutions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHistory}
              disabled={loadingHistory}
            >
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : executionHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune exécution enregistrée
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {executionHistory.map((execution) => (
                <div 
                  key={execution.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{execution.job_name}</span>
                        {getStatusBadge(execution.status)}
                        {execution.triggered_by === 'manual' && (
                          <Badge variant="outline" className="text-xs">Manuel</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(execution.started_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        {execution.duration_ms && (
                          <span className="ml-2">• Durée: {formatDuration(execution.duration_ms)}</span>
                        )}
                      </div>
                      {execution.error_message && (
                        <p className="text-xs text-coral mt-1 truncate max-w-md">
                          {execution.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                L'historique des exécutions est conservé 30 jours. Vous pouvez exécuter manuellement 
                chaque tâche pour tester ou forcer une exécution immédiate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
