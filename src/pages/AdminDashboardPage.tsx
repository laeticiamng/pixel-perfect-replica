import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Activity, TrendingUp, Calendar,
  BarChart3, Clock, Eye, MousePointer, Shield, Bell,
  RefreshCw, AlertTriangle, CheckCircle, Loader2, Timer, Search
} from 'lucide-react';
import { AlertPreferencesCard } from '@/components/admin/AlertPreferencesCard';
import { AlertHistoryCard } from '@/components/admin/AlertHistoryCard';
import { CronJobsMonitor } from '@/components/admin/CronJobsMonitor';
import { EventScraperCard } from '@/components/admin/EventScraperCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemStats } from '@/hooks/useSystemStats';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface DailyActiveUsers {
  date: string;
  active_users: number;
}

interface EventCounts {
  event_name: string;
  count: number;
}

interface CategoryCounts {
  event_category: string;
  count: number;
}

interface PageViewCounts {
  page_path: string;
  count: number;
}

const CHART_COLORS = [
  'hsl(var(--coral))',
  'hsl(var(--signal-green))',
  'hsl(var(--signal-yellow))',
  'hsl(var(--purple-accent))',
  'hsl(200, 100%, 50%)',
  'hsl(340, 82%, 52%)',
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // System stats from edge function
  const { 
    stats: systemStats, 
    errorRate, 
    isLoading: statsLoading, 
    refetch: refetchStats,
    triggerCleanup 
  } = useSystemStats(isAdmin);
  
  // Stats (fallback to local queries)
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalSignals, setTotalSignals] = useState(0);
  const [totalInteractions, setTotalInteractions] = useState(0);
  
  // Charts data
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUsers[]>([]);
  const [eventCounts, setEventCounts] = useState<EventCounts[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts[]>([]);
  const [pageViewCounts, setPageViewCounts] = useState<PageViewCounts[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<{ hour: string; count: number }[]>([]);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/');
        return;
      }

      const { data } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (!data) {
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
    };

    checkAdmin();
  }, [user, navigate]);

  // Sync system stats when available
  useEffect(() => {
    if (systemStats) {
      setTotalUsers(systemStats.total_users);
      setTotalSignals(systemStats.active_signals);
      setTotalInteractions(systemStats.total_interactions);
    }
  }, [systemStats]);

  const handleCleanup = async () => {
    const success = await triggerCleanup();
    if (success) {
      toast.success(t('admin.cleanupSuccess'));
      refetchStats();
    } else {
      toast.error(t('admin.cleanupError'));
    }
  };

  const handleRefresh = () => {
    refetchStats();
    loadAnalytics();
    toast.success(t('admin.dataRefreshed'));
  };

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!isAdmin) return;
    
    setIsLoading(true);
    
    try {
      // Get daily active users using database function
      const { data: dauData } = await supabase
        .rpc('get_daily_active_users', { days_back: 14 });
      
      if (dauData) {
        const formatted = dauData.map((d: DailyActiveUsers) => ({
          date: new Date(d.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit' }),
          active_users: Number(d.active_users),
        })).reverse();
        setDailyActiveUsers(formatted);
      }

      // Get total counts from analytics_events
      const { count: eventsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });
      setTotalEvents(eventsCount || 0);

      // Get active signals count
      const { count: signalsCount } = await supabase
        .from('active_signals')
        .select('*', { count: 'exact', head: true })
        .gt('expires_at', new Date().toISOString());
      setTotalSignals(signalsCount || 0);

      // Get total interactions
      const { count: interactionsCount } = await supabase
        .from('interactions')
        .select('*', { count: 'exact', head: true });
      setTotalInteractions(interactionsCount || 0);

      // Get unique users from analytics
      const { data: uniqueUsersData } = await supabase
        .from('analytics_events')
        .select('user_id')
        .not('user_id', 'is', null);
      
      if (uniqueUsersData) {
        const uniqueUsers = new Set(uniqueUsersData.map(e => e.user_id));
        setTotalUsers(uniqueUsers.size);
      }

      // Get event counts by name
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('event_name');
      
      if (eventsData) {
        const counts: Record<string, number> = {};
        eventsData.forEach(e => {
          counts[e.event_name] = (counts[e.event_name] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([event_name, count]) => ({ event_name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setEventCounts(sorted);
      }

      // Get event counts by category
      const { data: categoryData } = await supabase
        .from('analytics_events')
        .select('event_category');
      
      if (categoryData) {
        const counts: Record<string, number> = {};
        categoryData.forEach(e => {
          counts[e.event_category] = (counts[e.event_category] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .map(([event_category, count]) => ({ event_category, count }))
          .sort((a, b) => b.count - a.count);
        setCategoryCounts(sorted);
      }

      // Get page view counts
      const { data: pageData } = await supabase
        .from('analytics_events')
        .select('page_path')
        .eq('event_name', 'page_view');
      
      if (pageData) {
        const counts: Record<string, number> = {};
        pageData.forEach(e => {
          if (e.page_path) {
            counts[e.page_path] = (counts[e.page_path] || 0) + 1;
          }
        });
        const sorted = Object.entries(counts)
          .map(([page_path, count]) => ({ page_path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setPageViewCounts(sorted);
      }

      // Get hourly activity distribution
      const { data: hourlyData } = await supabase
        .from('analytics_events')
        .select('created_at');
      
      if (hourlyData) {
        const hourCounts: Record<number, number> = {};
        for (let h = 0; h < 24; h++) hourCounts[h] = 0;
        
        hourlyData.forEach(e => {
          const hour = new Date(e.created_at).getHours();
          hourCounts[hour]++;
        });
        
        const hourlyChartData = Object.entries(hourCounts)
          .map(([hour, count]) => ({
            hour: `${hour}h`,
            count,
          }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
        setHourlyActivity(hourlyChartData);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    
    setIsLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg px-3 py-2 text-sm border border-border">
          <p className="text-foreground font-semibold">{label}</p>
          <p className="text-coral">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (!isAdmin) {
    return (
      <PageLayout className="pb-8 safe-bottom">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t('admin.restrictedAccess')}</h2>
            <p className="text-muted-foreground">
              {t('admin.restrictedDesc')}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('admin.dashboard')}</h1>
              <p className="text-sm text-muted-foreground">{t('admin.analyticsEngagement')}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={statsLoading}
          >
            {statsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* System Health Indicator */}
        {errorRate && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mt-4 ${
            errorRate.health_status === 'healthy' 
              ? 'bg-signal-green/10 text-signal-green' 
              : errorRate.health_status === 'warning'
              ? 'bg-signal-yellow/10 text-signal-yellow'
              : 'bg-coral/10 text-coral'
          }`}>
            {errorRate.health_status === 'healthy' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <div className="flex-1">
              <p className="font-medium capitalize">
                {errorRate.health_status === 'healthy' ? t('admin.systemHealthy') : errorRate.health_status === 'warning' ? t('admin.systemWarning') : t('admin.systemCritical')}
              </p>
              <p className="text-xs opacity-80">
                {t('admin.errorRate').replace('{rate}', errorRate.error_rate_percent.toFixed(2)).replace('{errors}', String(errorRate.error_count)).replace('{total}', String(errorRate.total_events))}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCleanup}
              className="text-xs"
            >
              {t('admin.cleanup')}
            </Button>
          </div>
        )}
      </header>

      <div className="px-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-coral/20">
                  <Users className="h-4 w-4 text-coral" />
                </div>
                <span className="text-sm text-muted-foreground">{t('admin.users')}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-signal-green/20">
                  <Activity className="h-4 w-4 text-signal-green" />
                </div>
                <span className="text-sm text-muted-foreground">{t('admin.activeSignals')}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalSignals}</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-signal-yellow/20">
                  <MousePointer className="h-4 w-4 text-signal-yellow" />
                </div>
                <span className="text-sm text-muted-foreground">{t('admin.analyticsEvents')}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalEvents}</p>
            </CardContent>
          </Card>
          
          <Card className="glass border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-purple-accent/20">
                  <TrendingUp className="h-4 w-4 text-purple-accent" />
                </div>
                <span className="text-sm text-muted-foreground">{t('admin.interactions')}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalInteractions}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-muted/30">
            <TabsTrigger value="overview">{t('admin.overview')}</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="scraper" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Scraper
            </TabsTrigger>
            <TabsTrigger value="cron" className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Cron
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {t('admin.alerts')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Daily Active Users Chart */}
            <Card className="glass border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-coral" />
                  {t('admin.activeUsers14d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dailyActiveUsers.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyActiveUsers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--coral))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--coral))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 10 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 10 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="active_users" 
                          stroke="hsl(var(--coral))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('admin.noData')}</p>
                )}
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="glass border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-signal-green" />
                  {t('admin.categoryDistribution')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryCounts.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryCounts}
                            dataKey="count"
                            nameKey="event_category"
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={50}
                            strokeWidth={0}
                          >
                            {categoryCounts.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {categoryCounts.map((item, index) => (
                        <div key={item.event_category} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm text-foreground flex-1 capitalize">{item.event_category}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('admin.noData')}</p>
                )}
              </CardContent>
            </Card>

            {/* Hourly Activity */}
            <Card className="glass border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-signal-yellow" />
                  {t('admin.hourlyActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hourlyActivity.length > 0 ? (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyActivity} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                        <XAxis 
                          dataKey="hour" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 10 }}
                          interval={3}
                        />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          radius={[4, 4, 0, 0]}
                          fill="hsl(var(--signal-yellow))"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('admin.noData')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-6">
            {/* Top Events */}
            <Card className="glass border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t('admin.topEvents')}</CardTitle>
                <CardDescription>{t('admin.mostFrequent')}</CardDescription>
              </CardHeader>
              <CardContent>
                {eventCounts.length > 0 ? (
                  <div className="space-y-3">
                    {eventCounts.map((event, index) => (
                      <div key={event.event_name} className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{event.event_name}</p>
                          <div className="w-full bg-muted/30 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-coral rounded-full h-1.5 transition-all duration-500"
                              style={{ width: `${(event.count / eventCounts[0].count) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">
                          {event.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('admin.noEventsRecorded')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6 mt-6">
            {/* Top Pages */}
            <Card className="glass border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-coral" />
                  {t('admin.mostVisitedPages')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pageViewCounts.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={pageViewCounts} 
                        layout="vertical"
                        margin={{ top: 10, right: 10, left: 60, bottom: 0 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="page_path" 
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(240 5% 64.9%)', fontSize: 11 }}
                          width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="count" 
                          radius={[0, 4, 4, 0]}
                          fill="hsl(var(--coral))"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">{t('admin.noPageViews')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scraper" className="space-y-6 mt-6">
            <EventScraperCard />
          </TabsContent>

          <TabsContent value="cron" className="space-y-6 mt-6">
            <CronJobsMonitor />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AlertPreferencesCard />
              <AlertHistoryCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
