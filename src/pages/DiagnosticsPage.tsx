import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trash2, Database, Wifi, User, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationStore } from '@/stores/locationStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { logger, LogEntry } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface ApiLatencyTest {
  name: string;
  latency: number | null;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export default function DiagnosticsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { position, isWatching, lastUpdated } = useLocationStore();
  const { isOnline } = useNetworkStatus();
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [latencyTests, setLatencyTests] = useState<ApiLatencyTest[]>([]);
  const [isTestingLatency, setIsTestingLatency] = useState(false);

  const isDev = import.meta.env.DEV || localStorage.getItem('debug') === 'true';

  useEffect(() => {
    if (!isDev) { navigate('/'); return; }
    refreshLogs();
  }, [isDev, navigate]);

  const refreshLogs = () => { setLogs(logger.getRecentLogs(30)); };
  const clearLogs = () => { logger.clearLogs(); setLogs([]); };

  const runLatencyTests = async () => {
    setIsTestingLatency(true);
    const tests: ApiLatencyTest[] = [
      { name: 'profiles', latency: null, status: 'pending' },
      { name: 'user_stats', latency: null, status: 'pending' },
      { name: 'active_signals', latency: null, status: 'pending' },
    ];
    setLatencyTests(tests);
    for (let i = 0; i < tests.length; i++) {
      const start = performance.now();
      try {
        await supabase.from(tests[i].name as 'profiles' | 'user_stats' | 'active_signals').select('id').limit(1);
        tests[i].latency = Math.round(performance.now() - start);
        tests[i].status = 'success';
      } catch (err) {
        tests[i].status = 'error';
        tests[i].error = err instanceof Error ? err.message : 'Unknown error';
      }
      setLatencyTests([...tests]);
    }
    setIsTestingLatency(false);
  };

  const avgLatency = latencyTests.length > 0
    ? Math.round(latencyTests.filter(t => t.latency !== null).reduce((sum, t) => sum + (t.latency || 0), 0) / latencyTests.filter(t => t.latency !== null).length)
    : null;

  if (!isDev) return null;

  return (
    <PageLayout className="pb-8 safe-bottom">
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/settings')} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('diagnostics.backLabel')}>
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('diagnostics.title')}</h1>
        <span className="ml-auto text-xs bg-signal-yellow/20 text-signal-yellow px-2 py-1 rounded">DEV ONLY</span>
      </header>

      <div className="px-6 space-y-6">
        {/* Quick Health Check */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">✅ {t('diagnostics.systemStatus')}</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className={cn('p-2 rounded-lg', isOnline ? 'bg-signal-green/20' : 'bg-signal-red/20')}>
              <Wifi className={cn('h-5 w-5 mx-auto mb-1', isOnline ? 'text-signal-green' : 'text-signal-red')} />
              <span className="text-xs text-muted-foreground">{t('diagnostics.network')}</span>
            </div>
            <div className={cn('p-2 rounded-lg', isAuthenticated ? 'bg-signal-green/20' : 'bg-signal-red/20')}>
              <User className={cn('h-5 w-5 mx-auto mb-1', isAuthenticated ? 'text-signal-green' : 'text-signal-red')} />
              <span className="text-xs text-muted-foreground">Auth</span>
            </div>
            <div className={cn('p-2 rounded-lg', position ? 'bg-signal-green/20' : 'bg-signal-yellow/20')}>
              <Database className={cn('h-5 w-5 mx-auto mb-1', position ? 'text-signal-green' : 'text-signal-yellow')} />
              <span className="text-xs text-muted-foreground">GPS</span>
            </div>
          </div>
        </div>

        {/* System Details */}
        <div className="glass rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Database className="h-5 w-5 text-coral" />{t('diagnostics.systemDetails')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span className="text-foreground font-mono">{import.meta.env.MODE}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t('diagnostics.network')}</span><span className={cn('font-semibold', isOnline ? 'text-signal-green' : 'text-signal-red')}>{isOnline ? '● Online' : '○ Offline'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Geolocation</span><span className={cn('font-semibold', isWatching ? 'text-signal-green' : 'text-signal-yellow')}>{isWatching ? '● Active' : '○ Inactive'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Position</span><span className="text-foreground font-mono text-xs">{position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Backend URL</span><span className="text-foreground font-mono text-xs truncate max-w-[150px]">{import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').slice(0, 20)}...</span></div>
          </div>
        </div>

        {/* Auth Status */}
        <div className="glass rounded-xl p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><User className="h-5 w-5 text-coral" />{t('diagnostics.authentication')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={cn('font-semibold', authLoading ? 'text-signal-yellow' : isAuthenticated ? 'text-signal-green' : 'text-signal-red')}>{authLoading ? 'Loading...' : isAuthenticated ? 'Authenticated' : 'Not authenticated'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="text-foreground font-mono text-xs truncate max-w-[180px]">{user?.id || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Profile</span><span className="text-foreground">{profile?.first_name || 'N/A'}</span></div>
          </div>
        </div>

        {/* API Latency */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><Wifi className="h-5 w-5 text-coral" />{t('diagnostics.apiLatency')}</h2>
            <Button size="sm" variant="outline" onClick={runLatencyTests} disabled={isTestingLatency} className="h-8"><RefreshCw className={cn("h-4 w-4 mr-1", isTestingLatency && "animate-spin")} />{t('diagnostics.test')}</Button>
          </div>
          {latencyTests.length > 0 ? (
            <div className="space-y-2">
              {latencyTests.map(test => (
                <div key={test.name} className="flex justify-between text-sm"><span className="text-muted-foreground font-mono">{test.name}</span><span className={cn('font-semibold', test.status === 'success' ? 'text-signal-green' : test.status === 'error' ? 'text-signal-red' : 'text-muted-foreground')}>{test.status === 'pending' ? '...' : test.status === 'error' ? 'Error' : `${test.latency}ms`}</span></div>
              ))}
              {avgLatency !== null && (
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2"><span className="text-foreground font-semibold">{t('diagnostics.average')}</span><span className={cn('font-bold', avgLatency < 200 ? 'text-signal-green' : avgLatency < 500 ? 'text-signal-yellow' : 'text-signal-red')}>{avgLatency}ms</span></div>
              )}
            </div>
          ) : (<p className="text-sm text-muted-foreground">{t('diagnostics.testLatency')}</p>)}
        </div>

        {/* Recent Logs */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><Clock className="h-5 w-5 text-coral" />{t('diagnostics.recentLogs')}</h2>
            <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={refreshLogs} className="h-8"><RefreshCw className="h-4 w-4" /></Button><Button size="sm" variant="ghost" onClick={clearLogs} className="h-8 text-signal-red"><Trash2 className="h-4 w-4" /></Button></div>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className={cn('text-xs font-mono p-2 rounded', log.level === 'error' ? 'bg-signal-red/10 text-signal-red' : log.level === 'warn' ? 'bg-signal-yellow/10 text-signal-yellow' : 'bg-muted/50 text-muted-foreground')}>
                <span className="opacity-60">[{log.timestamp.split('T')[1].slice(0, 8)}]</span>{' '}<span className="font-bold">[{log.category}]</span>{' '}{log.message}
              </div>
            )) : (<p className="text-sm text-muted-foreground text-center py-4">{t('diagnostics.noRecentLogs')}</p>)}
          </div>
        </div>

        {/* Recent Errors */}
        {logger.getRecentErrors(5).length > 0 && (
          <div className="glass rounded-xl p-4 border border-signal-red/20">
            <h2 className="font-semibold text-signal-red mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />{t('diagnostics.recentErrors')}</h2>
            <div className="space-y-2">{logger.getRecentErrors(5).map((log, i) => (
              <div key={i} className="text-xs bg-signal-red/10 p-2 rounded"><p className="text-signal-red font-semibold">{log.message}</p>{log.data && (<p className="text-signal-red/70 mt-1">{JSON.stringify(log.data)}</p>)}</div>
            ))}</div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
