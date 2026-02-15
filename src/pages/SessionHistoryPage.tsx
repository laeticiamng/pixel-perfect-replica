import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, XCircle, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { PageLayout } from '@/components/PageLayout';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BottomNav } from '@/components/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, LoadingSkeleton } from '@/components/shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { exportSessionToCalendar } from '@/lib/calendarExport';
import toast from 'react-hot-toast';

interface PastSession {
  id: string;
  activity: string;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  city: string;
  location_name?: string;
  status: string;
  creator_id: string;
  creator_name?: string;
  checked_in: boolean;
  checked_out: boolean;
  was_creator: boolean;
}

const activityEmojis: Record<string, string> = {
  studying: '📚', eating: '🍽️', working: '💻', talking: '💬', sport: '🏃', other: '✨'
};

export default function SessionHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'created' | 'joined'>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // PERF-05 FIX: Parallelize queries with Promise.all
        const [createdRes, participationsRes] = await Promise.all([
          supabase.from('scheduled_sessions').select('*').eq('creator_id', user.id)
            .lt('scheduled_date', new Date().toISOString().split('T')[0])
            .order('scheduled_date', { ascending: false }).limit(50),
          supabase.from('session_participants').select('session_id, checked_in, checked_out').eq('user_id', user.id),
        ]);

        if (createdRes.error) throw createdRes.error;
        if (participationsRes.error) throw participationsRes.error;

        const participationMap = new Map(participationsRes.data?.map(p => [p.session_id, p]) || []);
        const participatedSessionIds = participationsRes.data?.map(p => p.session_id) || [];

        let joinedSessions: any[] = [];
        if (participatedSessionIds.length > 0) {
          const { data: joinedData, error: joinedError } = await supabase
            .from('scheduled_sessions').select('*').in('id', participatedSessionIds)
            .lt('scheduled_date', new Date().toISOString().split('T')[0])
            .order('scheduled_date', { ascending: false });
          if (joinedError) throw joinedError;
          joinedSessions = joinedData || [];
        }

        const allSessions: PastSession[] = [];
        const seen = new Set<string>();

        (createdRes.data || []).forEach(s => {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            const part = participationMap.get(s.id);
            allSessions.push({ ...s, was_creator: true, checked_in: part?.checked_in || false, checked_out: part?.checked_out || false });
          }
        });

        joinedSessions.forEach(s => {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            const part = participationMap.get(s.id);
            allSessions.push({ ...s, was_creator: s.creator_id === user.id, checked_in: part?.checked_in || false, checked_out: part?.checked_out || false });
          }
        });

        allSessions.sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());
        setSessions(allSessions);
      } catch (err) {
        logger.api.error('scheduled_sessions', 'fetch-history', String(err));
        toast.error(t('sessionHistory.loadError'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const filteredSessions = sessions.filter(s => {
    if (filter === 'created' && !s.was_creator) return false;
    if (filter === 'joined' && s.was_creator) return false;
    if (activityFilter !== 'all' && s.activity !== activityFilter) return false;
    return true;
  });

  const handleExport = (session: PastSession) => {
    exportSessionToCalendar(session);
    toast.success(t('sessionHistory.exported'));
  };

  if (isLoading) {
    return (
      <PageLayout className="pb-24 safe-bottom">
        <header className="safe-top px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="h-6 w-6" /></button>
            <h1 className="text-xl font-bold">{t('sessionHistory.title')}</h1>
          </div>
        </header>
        <div className="px-6 space-y-4"><LoadingSkeleton variant="card" count={4} /></div>
        <BottomNav />
      </PageLayout>
    );
  }

  const activityKeys = ['studying', 'eating', 'working', 'talking', 'sport', 'other'];

  return (
    <PageLayout className="pb-24 safe-bottom">
      <header className="safe-top px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label={t('back')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('sessionHistory.title')}</h1>
        </div>
        <Breadcrumbs className="px-2" />
      </header>

      <div className="px-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sessionHistory.all')}</SelectItem>
              <SelectItem value="created">{t('sessionHistory.created')}</SelectItem>
              <SelectItem value="joined">{t('sessionHistory.joined')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder={t('sessionHistory.activityPlaceholder')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sessionHistory.all')}</SelectItem>
              {activityKeys.map(key => (
                <SelectItem key={key} value={key}>{activityEmojis[key]} {t(`activities.${key}` as any)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-coral">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">{t('sessionHistory.total')}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-signal-green">{sessions.filter(s => s.checked_out).length}</p>
            <p className="text-xs text-muted-foreground">{t('sessionHistory.completed')}</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{sessions.filter(s => s.was_creator).length}</p>
            <p className="text-xs text-muted-foreground">{t('sessionHistory.created')}</p>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <EmptyState icon={Calendar} title={t('sessionHistory.noHistory')} description={t('sessionHistory.noHistoryDesc')} />
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <Card key={session.id} className="glass border-0">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activityEmojis[session.activity]}</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {t(`activities.${session.activity}` as any)} {t('sessionHistory.atCity').replace('{city}', session.city)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.scheduled_date), 'EEEE d MMMM yyyy', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {session.was_creator && <Badge variant="outline" className="text-xs">{t('sessionHistory.creator')}</Badge>}
                      {session.checked_out ? (
                        <Badge className="bg-signal-green/20 text-signal-green border-0"><CheckCircle className="h-3 w-3 mr-1" />{t('sessionHistory.statusCompleted')}</Badge>
                      ) : session.status === 'cancelled' ? (
                        <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('sessionHistory.statusCancelled')}</Badge>
                      ) : (
                        <Badge variant="secondary">{t('sessionHistory.statusIncomplete')}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.start_time?.slice(0, 5)} ({session.duration_minutes}min)</span>
                    {session.location_name && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{session.location_name}</span>}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => handleExport(session)} className="text-coral hover:text-coral hover:bg-coral/10">
                    <Download className="h-4 w-4 mr-2" />{t('sessionHistory.exportIcs')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </PageLayout>
  );
}