import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useTranslation } from '@/lib/i18n';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UniversityMetrics {
  university: string;
  students_total: number;
  isolated_pct: number;
  avg_integration_days: number;
  international_local_ratio: number;
}

export default function InstitutionalDashboardPage() {
  const { t } = useTranslation();
  const { isAdmin, isLoading: adminLoading } = useAdminCheck();
  const [metrics, setMetrics] = useState<UniversityMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMetrics = async () => {
      setIsLoading(true);
      const { data, error: rpcError } = await supabase.rpc('get_institutional_metrics');
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setMetrics((data as UniversityMetrics[]) || []);
      }
      setIsLoading(false);
    };
    fetchMetrics();
  }, [isAdmin]);

  if (adminLoading) return <FullPageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const getIsolationBadge = (pct: number) => {
    if (pct <= 15) return <Badge className="bg-signal-green/20 text-signal-green border-signal-green/30">{pct}%</Badge>;
    if (pct <= 30) return <Badge className="bg-signal-yellow/20 text-signal-yellow border-signal-yellow/30">{pct}%</Badge>;
    return <Badge className="bg-coral/20 text-coral border-coral/30">{pct}%</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Institutional Dashboard — NEARVITY</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageLayout className="pb-8 safe-bottom">
        <PageHeader title={t('admin.institutionalDashboard') || 'Institutional Dashboard'} backTo="/admin" />

        <div className="px-4 md:px-6 space-y-6">
          {/* Summary */}
          <div className="glass rounded-xl p-4 border-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t('admin.institutionalDesc') || 'Anonymized social integration metrics per university (min. 10 students)'}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-coral" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="h-10 w-10 text-signal-yellow mb-4" />
              <p className="text-foreground font-medium">{t('errors.generic')}</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : metrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">{t('admin.noUniversityData') || 'No university data available yet'}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('admin.noUniversityDataDesc') || 'Universities appear here once they have 10+ registered students.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {metrics.map((uni) => (
                <Card key={uni.university} className="glass border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-coral" />
                      {uni.university}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {t('admin.totalStudents') || 'Students'}
                      </div>
                      <p className="text-2xl font-bold text-foreground">{uni.students_total}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t('admin.isolatedPct') || 'Isolated'}
                      </div>
                      <div className="flex items-center gap-2">
                        {getIsolationBadge(uni.isolated_pct)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {t('admin.avgIntegration') || 'Avg Integration'}
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {uni.avg_integration_days != null ? `${uni.avg_integration_days}d` : '—'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        {t('admin.intlLocalRatio') || 'Intl/Local'}
                      </div>
                      <p className="text-2xl font-bold text-foreground">{uni.international_local_ratio}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}
