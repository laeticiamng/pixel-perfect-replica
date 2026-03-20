import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  ShieldAlert,
  Siren,
  TrendingUp,
  Users,
  Wifi,
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useSystemStats } from '@/hooks/useSystemStats';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface UniversityMetrics {
  university: string;
  students_total: number;
  isolated_pct: number;
  avg_integration_days: number | null;
  international_local_ratio: number;
}

interface CronExecution {
  id: string;
  job_name: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  status: 'running' | 'success' | 'error';
  triggered_by: 'cron' | 'manual';
  error_message: string | null;
}

interface AlertLog {
  id: string;
  alert_type: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
  metadata: Record<string, unknown> | null;
}

interface AnalyticsEventLite {
  page_path: string | null;
  event_name: string;
  event_category: string | null;
  created_at: string;
}

const companyInfo = {
  name: 'EMOTIONSCARE SASU',
  siren: '944 505 445',
  headquarters: '80000 Amiens, France',
  email: 'contact@emotionscare.com',
  website: 'https://nearvity.lovable.app',
};

const statusTone = {
  success: 'bg-signal-green/15 text-signal-green border-signal-green/30',
  error: 'bg-coral/15 text-coral border-coral/30',
  running: 'bg-signal-yellow/15 text-signal-yellow border-signal-yellow/30',
} as const;

const alertTone: Record<string, string> = {
  error_spike: 'bg-coral/15 text-coral border-coral/30',
  high_reports: 'bg-signal-yellow/15 text-signal-yellow border-signal-yellow/30',
  new_user: 'bg-signal-green/15 text-signal-green border-signal-green/30',
};

function formatDateTime(dateString: string, locale: string) {
  return new Date(dateString).toLocaleString(locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(durationMs: number | null) {
  if (!durationMs || durationMs < 1000) return durationMs ? `${durationMs} ms` : '—';
  return `${(durationMs / 1000).toFixed(1)} s`;
}

function CockpitMetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
      <CardContent className="premium-3d-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_12px_30px_-16px_hsl(var(--coral)/0.85)]">
            <Icon className="h-5 w-5 text-coral" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PresidentCockpitPage() {
  const { t, locale } = useTranslation();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const {
    stats: systemStats,
    errorRate,
    isLoading: systemLoading,
    refetch: refetchSystemStats,
  } = useSystemStats(isAdmin);

  const [institutionalMetrics, setInstitutionalMetrics] = useState<UniversityMetrics[]>([]);
  const [cronExecutions, setCronExecutions] = useState<CronExecution[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEventLite[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadCockpitData = useCallback(async () => {
    if (!isAdmin) return;

    setIsRefreshing(true);
    setDataError(null);

    const lastSevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      const [institutionalResponse, cronResponse, alertResponse, analyticsResponse] = await Promise.all([
        supabase.rpc('get_institutional_metrics'),
        supabase
          .from('cron_job_executions')
          .select('id, job_name, started_at, completed_at, duration_ms, status, triggered_by, error_message')
          .order('started_at', { ascending: false })
          .limit(12),
        supabase
          .from('alert_logs')
          .select('id, alert_type, recipient_email, subject, sent_at, metadata')
          .order('sent_at', { ascending: false })
          .limit(8),
        supabase
          .from('analytics_events')
          .select('page_path, event_name, event_category, created_at')
          .gte('created_at', lastSevenDays)
          .order('created_at', { ascending: false })
          .limit(400),
      ]);

      if (institutionalResponse.error) throw institutionalResponse.error;
      if (cronResponse.error) throw cronResponse.error;
      if (alertResponse.error) throw alertResponse.error;
      if (analyticsResponse.error) throw analyticsResponse.error;

      setInstitutionalMetrics((institutionalResponse.data as UniversityMetrics[] | null) ?? []);
      setCronExecutions((cronResponse.data as CronExecution[] | null) ?? []);
      setAlertLogs((alertResponse.data as AlertLog[] | null) ?? []);
      setAnalyticsEvents((analyticsResponse.data as AnalyticsEventLite[] | null) ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors.generic');
      setDataError(message);
      toast.error(message);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAdmin, t]);

  useEffect(() => {
    void loadCockpitData();
  }, [loadCockpitData]);

  const pageInsights = useMemo(() => {
    const pageCounts = new Map<string, number>();
    const eventCounts = new Map<string, number>();

    analyticsEvents.forEach((event) => {
      if (event.page_path) {
        pageCounts.set(event.page_path, (pageCounts.get(event.page_path) ?? 0) + 1);
      }
      eventCounts.set(event.event_name, (eventCounts.get(event.event_name) ?? 0) + 1);
    });

    return {
      topPages: [...pageCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count })),
      topEvents: [...eventCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };
  }, [analyticsEvents]);

  const cronSummary = useMemo(() => {
    const latestByJob = new Map<string, CronExecution>();
    cronExecutions.forEach((execution) => {
      if (!latestByJob.has(execution.job_name)) {
        latestByJob.set(execution.job_name, execution);
      }
    });

    const latestJobs = [...latestByJob.values()];
    const healthy = latestJobs.filter((job) => job.status === 'success').length;
    const failing = latestJobs.filter((job) => job.status === 'error').length;
    const running = latestJobs.filter((job) => job.status === 'running').length;

    return { latestJobs, healthy, failing, running };
  }, [cronExecutions]);

  const campusSummary = useMemo(() => {
    const totalStudents = institutionalMetrics.reduce((acc, metric) => acc + metric.students_total, 0);
    const highestIsolation = [...institutionalMetrics].sort((a, b) => b.isolated_pct - a.isolated_pct)[0] ?? null;
    const fastestCampus = [...institutionalMetrics]
      .filter((metric) => metric.avg_integration_days !== null)
      .sort((a, b) => (a.avg_integration_days ?? Number.POSITIVE_INFINITY) - (b.avg_integration_days ?? Number.POSITIVE_INFINITY))[0] ?? null;

    return {
      campuses: institutionalMetrics.length,
      totalStudents,
      highestIsolation,
      fastestCampus,
    };
  }, [institutionalMetrics]);

  const handleRefresh = async () => {
    await Promise.all([refetchSystemStats(), loadCockpitData()]);
    toast.success(t('admin.dataRefreshed'));
  };

  if (adminLoading) return <FullPageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <Helmet>
        <title>President Cockpit HQ — NEARVITY</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageLayout className="pb-8 safe-bottom">
        <section className="safe-top px-4 md:px-6 py-4 space-y-4">
          <div className="premium-3d-card overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-coral/10">
            <div className="premium-3d-surface space-y-4 p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-coral/30 bg-coral/10 text-coral">
                      Live operations
                    </Badge>
                    <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground">
                      0 mock data
                    </Badge>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">President Cockpit HQ</h1>
                    <p className="mt-2 max-w-3xl text-sm md:text-base text-muted-foreground">
                      {t('admin.presidentCockpitSubtitle')}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing || systemLoading}
                  className="gap-2 rounded-2xl bg-coral text-primary-foreground shadow-[0_16px_36px_-20px_hsl(var(--coral)/0.9)]"
                >
                  {(isRefreshing || systemLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {t('admin.refreshData')}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {companyInfo.name}</span>
                <span className="inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> SIREN {companyInfo.siren}</span>
                <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> {companyInfo.headquarters}</span>
                <a href={`mailto:${companyInfo.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"><Mail className="h-3.5 w-3.5" /> {companyInfo.email}</a>
                <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"><ExternalLink className="h-3.5 w-3.5" /> Nearvity</a>
              </div>
            </div>
          </div>

          <div className="premium-3d-grid grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <CockpitMetricCard
              icon={Users}
              label={t('admin.totalUsers')}
              value={String(systemStats?.total_users ?? 0)}
              hint={t('admin.presidentUsersHint')}
            />
            <CockpitMetricCard
              icon={Wifi}
              label={t('admin.activeSignals')}
              value={String(systemStats?.active_signals ?? 0)}
              hint={t('admin.presidentSignalsHint')}
            />
            <CockpitMetricCard
              icon={Activity}
              label={t('admin.interactions')}
              value={String(systemStats?.total_interactions ?? 0)}
              hint={t('admin.presidentInteractionsHint')}
            />
            <CockpitMetricCard
              icon={Building2}
              label={t('admin.institutionalDashboard') || 'Campuses'}
              value={String(campusSummary.campuses)}
              hint={t('admin.presidentCampusesHint')}
            />
          </div>

          {(errorRate || dataError) && (
            <div className={cn(
              'glass rounded-2xl border px-4 py-3 text-sm',
              errorRate?.health_status === 'critical' || dataError
                ? 'border-coral/30 text-coral'
                : errorRate?.health_status === 'warning'
                  ? 'border-signal-yellow/30 text-signal-yellow'
                  : 'border-signal-green/30 text-signal-green'
            )}>
              <div className="flex flex-wrap items-center gap-2">
                {errorRate?.health_status === 'healthy' && <CheckCircle2 className="h-4 w-4" />}
                {(errorRate?.health_status === 'warning' || errorRate?.health_status === 'critical' || dataError) && <AlertTriangle className="h-4 w-4" />}
                <span className="font-medium">
                  {dataError
                    ? dataError
                    : t('admin.errorRate')
                        .replace('{rate}', errorRate ? errorRate.error_rate_percent.toFixed(2) : '0')
                        .replace('{errors}', String(errorRate?.error_count ?? 0))
                        .replace('{total}', String(errorRate?.total_events ?? 0))}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="px-4 md:px-6">
          <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted/30 p-1 md:grid-cols-4">
              <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
              <TabsTrigger value="monitoring">{t('admin.monitoringTab')}</TabsTrigger>
              <TabsTrigger value="campuses">{t('admin.campusesTab')}</TabsTrigger>
              <TabsTrigger value="alerts">{t('admin.alerts')}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-coral" />
                      {t('admin.executiveSummaryTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.executiveSummaryDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em]">{t('admin.openReports')}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{systemStats?.reports_last_24h ?? 0}</p>
                        <p className="mt-2">{t('admin.executiveReportsHint')}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.24em]">{t('admin.analyticsEvents')}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{analyticsEvents.length}</p>
                        <p className="mt-2">{t('admin.executiveAnalyticsHint')}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p>
                        <strong className="text-foreground">{campusSummary.campuses}</strong> {t('admin.executiveCampusCoverage')}
                      </p>
                      <p>
                        <strong className="text-foreground">{campusSummary.totalStudents}</strong> {t('admin.executiveStudentsObserved')}
                      </p>
                      <p>
                        {campusSummary.highestIsolation
                          ? t('admin.executiveHighestIsolation')
                              .replace('{campus}', campusSummary.highestIsolation.university)
                              .replace('{pct}', campusSummary.highestIsolation.isolated_pct.toFixed(2))
                          : t('admin.executiveNoIsolationData')}
                      </p>
                      <p>
                        {campusSummary.fastestCampus
                          ? t('admin.executiveFastestCampus')
                              .replace('{campus}', campusSummary.fastestCampus.university)
                              .replace('{days}', String(campusSummary.fastestCampus.avg_integration_days ?? '—'))
                          : t('admin.executiveNoCampusData')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Server className="h-5 w-5 text-coral" />
                      {t('admin.systemPulseTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.systemPulseDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="text-muted-foreground">{t('admin.activeSignals')}</span>
                      <span className="font-semibold text-foreground">{systemStats?.active_signals ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="text-muted-foreground">{t('admin.recentErrors')}</span>
                      <span className="font-semibold text-foreground">{alertLogs.filter((log) => log.alert_type === 'error_spike').length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="text-muted-foreground">{t('admin.cronJobs')}</span>
                      <span className="font-semibold text-foreground">{cronSummary.latestJobs.length}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                      <span className="text-muted-foreground">{t('admin.activeUsers14d')}</span>
                      <span className="font-semibold text-foreground">{systemStats?.daily_active_users?.length ?? 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock3 className="h-5 w-5 text-coral" />
                      {t('admin.cronHealthTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.cronHealthDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Success</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{cronSummary.healthy}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Running</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{cronSummary.running}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Error</p>
                        <p className="mt-2 text-xl font-semibold text-foreground">{cronSummary.failing}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {cronSummary.latestJobs.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                          {t('admin.noData')}
                        </p>
                      ) : (
                        cronSummary.latestJobs.map((job) => (
                          <div key={job.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-foreground">{job.job_name}</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(job.started_at, locale)}</p>
                              </div>
                              <Badge className={statusTone[job.status]}>{job.status}</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              <span>{t('admin.durationLabel').replace('{value}', formatDuration(job.duration_ms))}</span>
                              <span>{t('admin.triggeredByLabel').replace('{value}', job.triggered_by)}</span>
                            </div>
                            {job.error_message && <p className="mt-2 text-xs text-coral">{job.error_message}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="h-5 w-5 text-coral" />
                      {t('admin.trafficLensTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.trafficLensDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Top pages</p>
                      <div className="space-y-2">
                        {pageInsights.topPages.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{t('admin.noPageViews')}</p>
                        ) : pageInsights.topPages.map((page) => (
                          <div key={page.path} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <span className="truncate text-sm text-foreground">{page.path}</span>
                            <Badge variant="outline" className="border-white/10 bg-white/5">{page.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">Top events</p>
                      <div className="space-y-2">
                        {pageInsights.topEvents.length === 0 ? (
                          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{t('admin.noEventsRecorded')}</p>
                        ) : pageInsights.topEvents.map((event) => (
                          <div key={event.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                            <span className="truncate text-sm text-foreground">{event.name}</span>
                            <Badge variant="outline" className="border-white/10 bg-white/5">{event.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="campuses" className="space-y-4">
              <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-coral" />
                    {t('admin.campusesTitle')}
                  </CardTitle>
                  <CardDescription>{t('admin.campusesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {institutionalMetrics.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                      {t('admin.noUniversityData') || 'No university data available yet'}
                    </p>
                  ) : (
                    institutionalMetrics.map((campus) => (
                      <div key={campus.university} className="premium-3d-card overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                        <div className="premium-3d-surface grid gap-4 p-4 md:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{campus.university}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t('admin.totalStudents') || 'Students'}: {campus.students_total}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Isolation</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{campus.isolated_pct.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Integration</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{campus.avg_integration_days ?? '—'} d</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Intl / Local</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{campus.international_local_ratio}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5 text-coral" />
                      {t('admin.alertTimelineTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.alertTimelineDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {alertLogs.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">{t('admin.noData')}</p>
                    ) : (
                      alertLogs.map((alert) => (
                        <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{alert.subject}</p>
                              <p className="text-xs text-muted-foreground">{alert.recipient_email}</p>
                            </div>
                            <Badge className={alertTone[alert.alert_type] ?? 'border-white/10 bg-white/5 text-foreground'}>
                              {alert.alert_type}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDateTime(alert.sent_at, locale)}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="premium-3d-card overflow-hidden border-white/10 bg-card/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Siren className="h-5 w-5 text-coral" />
                      {t('admin.responseChecklistTitle')}
                    </CardTitle>
                    <CardDescription>{t('admin.responseChecklistDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-foreground">1. {t('admin.responseStepOneTitle')}</p>
                      <p className="mt-2">{t('admin.responseStepOneDesc')}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-foreground">2. {t('admin.responseStepTwoTitle')}</p>
                      <p className="mt-2">{t('admin.responseStepTwoDesc')}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-medium text-foreground">3. {t('admin.responseStepThreeTitle')}</p>
                      <p className="mt-2">{t('admin.responseStepThreeDesc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </PageLayout>
    </>
  );
}
