import { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle, XCircle, RefreshCw, Loader2, Timer, Calendar, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { logger } from '@/lib/logger';

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

export function CronJobsMonitor() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobStatuses, setJobStatuses] = useState<Record<string, 'idle' | 'running' | 'success' | 'error'>>({});
  const [executionHistory, setExecutionHistory] = useState<CronExecution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;

  const CONFIGURED_CRON_JOBS = [
    {
      name: 'daily-cleanup-expired',
      schedule: '0 3 * * *',
      description: t('cronJobs.cleanupExpiredDesc'),
      action: 'cleanup-expired',
      lastRunInfo: t('cronJobs.cleanupExpiredSchedule'),
    },
    {
      name: 'hourly-cleanup-shadow-bans',
      schedule: '0 * * * *',
      description: t('cronJobs.shadowBanDesc'),
      action: 'cleanup-shadow-bans',
      lastRunInfo: t('cronJobs.shadowBanSchedule'),
    },
    {
      name: 'send-session-reminders',
      schedule: '*/5 * * * *',
      description: t('cronJobs.remindersDesc'),
      action: 'send-session-reminders',
      lastRunInfo: t('cronJobs.remindersSchedule'),
    },
  ];

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
      logger.api.error('cron_executions', 'fetch', String(error));
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const logExecutionStart = async (jobName: string) => {
    try {
      const { data, error } = await supabase
        .from('cron_job_executions')
        .insert({ job_name: jobName, status: 'running', triggered_by: 'manual' })
        .select()
        .single();
      if (error) throw error;
      return data?.id;
    } catch (error) {
      logger.api.error('cron_executions', 'log-start', String(error));
      return null;
    }
  };

  const logExecutionEnd = async (
    executionId: string | null, status: 'success' | 'error',
    result?: Record<string, unknown>, errorMessage?: string
  ) => {
    if (!executionId) return;
    try {
      await supabase.from('cron_job_executions').update({
        completed_at: new Date().toISOString(),
        duration_ms: 100,
        status,
        result: result ? JSON.parse(JSON.stringify(result)) : {},
        error_message: errorMessage,
      }).eq('id', executionId);
      fetchHistory();
    } catch (error) {
      logger.api.error('cron_executions', 'log-end', String(error));
    }
  };

  const runJob = async (jobName: string, action: string, invokeTarget: string, successKey: string, errorKey: string) => {
    setIsLoading(true);
    setJobStatuses(prev => ({ ...prev, [jobName]: 'running' }));
    const executionId = await logExecutionStart(jobName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('cronJobs.sessionExpired'));
        await logExecutionEnd(executionId, 'error', undefined, 'Session expired');
        return;
      }
      const response = await supabase.functions.invoke(invokeTarget, { body: { action } });
      if (response.error) throw response.error;
      setJobStatuses(prev => ({ ...prev, [jobName]: 'success' }));
      await logExecutionEnd(executionId, 'success', response.data);
      toast.success(t(successKey));
    } catch (error) {
      logger.api.error('cron_jobs', jobName, String(error));
      setJobStatuses(prev => ({ ...prev, [jobName]: 'error' }));
      await logExecutionEnd(executionId, 'error', undefined, String(error));
      toast.error(t(errorKey));
    } finally {
      setIsLoading(false);
    }
  };

  const getActionHandler = (action: string) => {
    switch (action) {
      case 'cleanup-expired':
        return () => runJob('daily-cleanup-expired', 'cleanup-expired', 'system', 'cronJobs.cleanupDone', 'cronJobs.cleanupFailed');
      case 'cleanup-shadow-bans':
        return () => runJob('hourly-cleanup-shadow-bans', 'check-shadow-bans', 'system', 'cronJobs.shadowBanDone', 'cronJobs.shadowBanFailed');
      case 'send-session-reminders':
        return () => runJob('send-session-reminders', 'send-session-reminders', 'notifications', 'cronJobs.remindersDone', 'cronJobs.remindersFailed');
      default:
        return () => {};
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-signal-yellow" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-signal-green" />;
      case 'error': return <XCircle className="h-4 w-4 text-coral" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge variant="outline" className="bg-signal-yellow/10 text-signal-yellow border-signal-yellow/30">{t('cronJobs.running')}</Badge>;
      case 'success': return <Badge variant="outline" className="bg-signal-green/10 text-signal-green border-signal-green/30">{t('cronJobs.success')}</Badge>;
      case 'error': return <Badge variant="outline" className="bg-coral/10 text-coral border-coral/30">{t('cronJobs.errorStatus')}</Badge>;
      default: return <Badge variant="outline">{t('cronJobs.unknown')}</Badge>;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-coral" />
            {t('cronJobs.title')}
          </CardTitle>
          <CardDescription>{t('cronJobs.description')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {CONFIGURED_CRON_JOBS.map((job) => {
          const lastExecution = executionHistory.find(e => e.job_name === job.name);
          return (
            <Card key={job.name} className="glass border-0">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(jobStatuses[job.name] || 'idle')}
                      <h3 className="font-semibold text-foreground">{job.name}</h3>
                      <Badge variant="outline" className="text-xs font-mono">{job.schedule}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{job.lastRunInfo}</span>
                      </div>
                      {lastExecution && (
                        <div className="flex items-center gap-1">
                          <History className="h-3 w-3" />
                          <span>
                            {t('signalHistory.lastExecution', { time: formatDistanceToNow(new Date(lastExecution.started_at), { addSuffix: true, locale: dateLocale }) })}
                            {lastExecution.duration_ms && ` (${formatDuration(lastExecution.duration_ms)})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={getActionHandler(job.action)} disabled={isLoading} className="shrink-0">
                    {isLoading && jobStatuses[job.name] === 'running' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Play className="h-4 w-4 mr-1" />{t('cronJobs.execute')}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-coral" />
              {t('cronJobs.executionHistory')}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={loadingHistory}>
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
            <p className="text-sm text-muted-foreground text-center py-8">{t('cronJobs.noExecutions')}</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {executionHistory.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{execution.job_name}</span>
                        {getStatusBadge(execution.status)}
                        {execution.triggered_by === 'manual' && (
                          <Badge variant="outline" className="text-xs">{t('cronJobs.manual')}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(execution.started_at), 'dd/MM/yyyy HH:mm:ss', { locale: dateLocale })}
                        {execution.duration_ms && (
                          <span className="ml-2">• {t('cronJobs.duration')}: {formatDuration(execution.duration_ms)}</span>
                        )}
                      </div>
                      {execution.error_message && (
                        <p className="text-xs text-coral mt-1 truncate max-w-md">{execution.error_message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-0 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-coral/20">
              <Clock className="h-4 w-4 text-coral" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">{t('cronJobs.aboutCronJobs')}</h4>
              <p className="text-sm text-muted-foreground">{t('cronJobs.aboutCronDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
