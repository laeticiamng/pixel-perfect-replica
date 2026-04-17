import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wifi,
  AlertTriangle,
  Check,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { VerificationBadges } from '@/components/social/VerificationBadges';
import { TooltipProvider } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/BottomNav';
import toast from 'react-hot-toast';
import { track, report, audit } from '@/lib/observability';
import { useConnections } from '@/hooks/useConnections';

interface DiscoveredUser {
  user_id: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
  favorite_activities: string[] | null;
  last_active_at: string;
  is_online_now: boolean;
  current_activity: string | null;
}

type SortMode = 'smart' | 'online' | 'recent' | 'campus';

interface RankedUser extends DiscoveredUser {
  matchScore: number;
  reasons: string[];
}

export default function DiscoverPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dateLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;
  const { connections, requestConnection } = useConnections();

  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('smart');
  const [pendingTargets, setPendingTargets] = useState<Set<string>>(new Set());

  /** Map<targetUserId, status> derived from existing connections */
  const connectionStatus = useMemo(() => {
    const map = new Map<string, 'pending' | 'accepted' | 'declined'>();
    if (!user) return map;
    for (const c of connections) {
      const other = c.user_a === user.id ? c.user_b : c.user_a;
      map.set(other, c.status as 'pending' | 'accepted' | 'declined');
    }
    return map;
  }, [connections, user]);

  const handleSendInterest = useCallback(
    async (targetUserId: string, fallbackActivity: ActivityType | null) => {
      if (!user) return;
      const activity = (selectedActivity ?? fallbackActivity) as ActivityType | null;
      if (!activity) {
        toast.error(t('discover.selectActivityFirst'));
        return;
      }
      setPendingTargets((prev) => new Set(prev).add(targetUserId));
      audit('discover.send_interest', { type: 'connection', id: targetUserId }, { activity });
      const result = await requestConnection(targetUserId, null, activity);
      if (result.success) {
        toast.success(t('discover.interestSent'));
        track('discover.interest_sent', { activity }, { category: 'discovery' });
      } else {
        report(result.error, { component: 'DiscoverPage.handleSendInterest', severity: 'warn' });
        toast.error(t('discover.interestError'));
        setPendingTargets((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      }
    },
    [user, selectedActivity, requestConnection, t]
  );

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setFetchError(false);
    const startedAt = performance.now();
    try {
      const { data, error } = await supabase.rpc('discover_users', {
        p_activity: selectedActivity,
        p_university: selectedUniversity,
        p_search: searchQuery || null,
        p_limit: 30,
      });
      if (error) throw error;
      const results = (data ?? []) as DiscoveredUser[];
      setUsers(results);
      track('discover.search', {
        result_count: results.length,
        has_activity_filter: !!selectedActivity,
        has_university_filter: !!selectedUniversity,
        has_search: !!searchQuery,
        duration_ms: Math.round(performance.now() - startedAt),
      }, { category: 'discovery' });
    } catch (err) {
      report(err, { component: 'DiscoverPage.fetchUsers', severity: 'error' });
      setFetchError(true);
      toast.error(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedActivity, selectedUniversity, searchQuery, t]);

  useEffect(() => {
    const timer = window.setTimeout(fetchUsers, searchQuery ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchUsers, searchQuery]);

  useEffect(() => {
    const unis = [...new Set(users.map((item) => item.university).filter(Boolean))] as string[];
    setUniversities(unis.sort());
  }, [users]);

  const rankedUsers = useMemo<RankedUser[]>(() => {
    return users.map((item) => {
      const reasons: string[] = [];
      let score = 0;

      if (item.is_online_now) {
        score += 40;
        reasons.push(t('discover.reasonOnline'));
      }

      if (selectedUniversity && item.university === selectedUniversity) {
        score += 18;
        reasons.push(t('discover.reasonCampus'));
      } else if (!selectedUniversity && item.university) {
        score += 8;
      }

      if (selectedActivity && item.current_activity === selectedActivity) {
        score += 25;
        reasons.push(t('discover.reasonActivityLive'));
      } else if (selectedActivity && item.favorite_activities?.includes(selectedActivity)) {
        score += 12;
        reasons.push(t('discover.reasonActivityAffinity'));
      }

      if (searchQuery && item.first_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        score += 10;
      }

      const lastActive = new Date(item.last_active_at).getTime();
      if (!Number.isNaN(lastActive)) {
        const freshnessHours = Math.max(0, 24 - (Date.now() - lastActive) / 3_600_000);
        score += Math.min(20, freshnessHours);
      }

      return { ...item, matchScore: Math.round(score), reasons };
    });
  }, [users, selectedUniversity, selectedActivity, searchQuery, t]);

  const sortedUsers = useMemo(() => {
    const copy = [...rankedUsers];

    switch (sortMode) {
      case 'online':
        return copy.sort((a, b) => Number(b.is_online_now) - Number(a.is_online_now) || b.matchScore - a.matchScore);
      case 'recent':
        return copy.sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime());
      case 'campus':
        return copy.sort((a, b) => (a.university ?? '').localeCompare(b.university ?? '') || b.matchScore - a.matchScore);
      case 'smart':
      default:
        return copy.sort((a, b) => b.matchScore - a.matchScore || Number(b.is_online_now) - Number(a.is_online_now));
    }
  }, [rankedUsers, sortMode]);

  const summary = useMemo(() => {
    const onlineCount = sortedUsers.filter((item) => item.is_online_now).length;
    const campuses = new Set(sortedUsers.map((item) => item.university).filter(Boolean)).size;
    const liveActivities = sortedUsers.filter((item) => item.current_activity).length;
    return {
      onlineCount,
      campuses,
      liveActivities,
      strongestMatch: sortedUsers[0] ?? null,
    };
  }, [sortedUsers]);

  const sortOptions: Array<{ value: SortMode; label: string; icon: typeof Sparkles }> = [
    { value: 'smart', label: t('discover.sortSmart'), icon: Sparkles },
    { value: 'online', label: t('discover.sortOnline'), icon: Wifi },
    { value: 'recent', label: t('discover.sortRecent'), icon: TrendingUp },
    { value: 'campus', label: t('discover.sortCampus'), icon: GraduationCap },
  ];

  return (
    <TooltipProvider>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageLayout className="pb-28">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-6">
          <PageHeader
            title={t('discover.title')}
            subtitle={t('discover.subtitle')}
            showBack={false}
          />

          <section className="mt-6 premium-3d-card overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-coral/10">
            <div className="premium-3d-surface space-y-5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <Badge variant="outline" className="border-coral/30 bg-coral/10 text-coral">
                    {t('discover.liveTitle')}
                  </Badge>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{t('discover.intelligentSortingTitle')}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{t('discover.intelligentSortingDesc')}</p>
                  </div>
                </div>

                {summary.strongestMatch && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t('discover.bestMatch')}</p>
                    <p className="mt-2 font-semibold text-foreground">{summary.strongestMatch.first_name}</p>
                    <p className="mt-1 text-coral">{summary.strongestMatch.matchScore} {t('discover.compatibilityScore')}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t('discover.onlineStat')}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{summary.onlineCount}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t('discover.onlineStatDesc')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t('discover.campusStat')}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{summary.campuses}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t('discover.campusStatDesc')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{t('discover.activityStat')}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{summary.liveActivities}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t('discover.activityStatDesc')}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('discover.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-2xl border-border/50 bg-muted/50 pl-10"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="icon"
                className="h-12 w-12 rounded-2xl shrink-0"
                onClick={() => setShowFilters((current) => !current)}
                aria-label={showFilters ? t('discover.hideFilters') : t('discover.showFilters')}
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl shrink-0" onClick={fetchUsers} aria-label={t('common.retry')}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                const active = sortMode === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    className={cn('rounded-2xl gap-2', active && 'bg-coral text-primary-foreground')}
                    onClick={() => setSortMode(option.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>

            {summary.onlineCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-signal-green"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal-green" />
                </span>
                {t('discover.onlineNow', { count: summary.onlineCount })}
              </motion.div>
            )}

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="premium-3d-card space-y-4 rounded-[1.75rem] border border-white/10 bg-card/70 p-4">
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t('discover.filterActivity')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={selectedActivity === null ? 'default' : 'outline'}
                          className={cn('cursor-pointer transition-all', selectedActivity === null && 'border-coral bg-coral text-white')}
                          onClick={() => setSelectedActivity(null)}
                        >
                          {t('activityFilter.all')}
                        </Badge>
                        {ACTIVITIES.map((activity) => (
                          <Badge
                            key={activity.id}
                            variant={selectedActivity === activity.id ? 'default' : 'outline'}
                            className={cn('cursor-pointer transition-all', selectedActivity === activity.id && 'border-coral bg-coral text-white')}
                            onClick={() => setSelectedActivity(selectedActivity === activity.id ? null : activity.id)}
                          >
                            {activity.emoji} {t(activity.labelKey)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {universities.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {t('discover.filterUniversity')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={selectedUniversity === null ? 'default' : 'outline'}
                            className={cn('cursor-pointer transition-all', selectedUniversity === null && 'border-coral bg-coral text-white')}
                            onClick={() => setSelectedUniversity(null)}
                          >
                            {t('activityFilter.all')}
                          </Badge>
                          {universities.map((university) => (
                            <Badge
                              key={university}
                              variant={selectedUniversity === university ? 'default' : 'outline'}
                              className={cn('cursor-pointer transition-all', selectedUniversity === university && 'border-coral bg-coral text-white')}
                              onClick={() => setSelectedUniversity(selectedUniversity === university ? null : university)}
                            >
                              <GraduationCap className="mr-1 h-3 w-3" />
                              {university}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-3xl bg-muted/30 p-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : fetchError ? (
              <div className="space-y-4 py-12 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <p className="font-medium text-foreground">{t('errors.generic')}</p>
                <Button variant="outline" onClick={fetchUsers} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('common.retry')}
                </Button>
              </div>
            ) : sortedUsers.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title={t('discover.noResults')}
                description={t('discover.noResultsDesc')}
              />
            ) : (
              sortedUsers.map((item, index) => (
                <UserCard
                  key={item.user_id}
                  user={item}
                  index={index}
                  dateLocale={dateLocale}
                  t={t}
                  onViewProfile={() => navigate(`/reveal/${item.user_id}`)}
                />
              ))
            )}
          </div>
        </div>
        <BottomNav />
      </PageLayout>
    </TooltipProvider>
  );
}

interface UserCardProps {
  user: RankedUser;
  index: number;
  dateLocale: typeof enUS;
  t: (key: string, vars?: Record<string, unknown>) => string;
  onViewProfile: () => void;
}

function UserCard({ user, index, dateLocale, t, onViewProfile }: UserCardProps) {
  const activity = user.current_activity
    ? ACTIVITIES.find((item) => item.id === user.current_activity)
    : null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onViewProfile}
      aria-label={`${t('discover.viewProfile')} ${user.first_name || ''}`}
      className="premium-3d-card group w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-card/80 text-left transition-all"
    >
      <div className="premium-3d-surface flex items-center gap-4 p-4">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm transition-shadow group-hover:shadow-md">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.first_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-foreground">
                {(user.first_name ?? '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {user.is_online_now && (
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-signal-green">
              <div className="absolute inset-0 animate-ping rounded-full bg-signal-green opacity-40" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{user.first_name}</h3>
            <VerificationBadges userId={user.user_id} />
            <Badge variant="outline" className="border-coral/20 bg-coral/10 text-coral">
              {user.matchScore} {t('discover.compatibilityScore')}
            </Badge>
            {user.is_online_now && activity && (
              <Badge variant="outline" className="shrink-0 border-signal-green/30 bg-signal-green/10 text-xs text-signal-green">
                {activity.emoji} {t(activity.labelKey)}
              </Badge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {user.university && (
              <span className="flex items-center gap-1 truncate">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                {user.university}
              </span>
            )}
            {!user.is_online_now && user.last_active_at && (
              <span className="flex shrink-0 items-center gap-1">
                <Wifi className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true, locale: dateLocale })}
              </span>
            )}
          </div>

          {user.reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.reasons.slice(0, 3).map((reason) => (
                <Badge key={reason} variant="secondary" className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {reason}
                </Badge>
              ))}
            </div>
          )}

          {user.favorite_activities && user.favorite_activities.length > 0 && !user.is_online_now && (
            <div className="mt-2 flex items-center gap-1.5">
              {user.favorite_activities.slice(0, 4).map((activityId) => {
                const favoriteActivity = ACTIVITIES.find((item) => item.id === activityId);
                return favoriteActivity ? (
                  <span key={activityId} className="text-sm" title={t(favoriteActivity.labelKey)}>
                    {favoriteActivity.emoji}
                  </span>
                ) : null;
              })}
              {user.favorite_activities.length > 4 && (
                <span className="text-xs text-muted-foreground">+{user.favorite_activities.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl text-muted-foreground transition-all group-hover:bg-coral/10 group-hover:text-coral"
            onClick={(event) => {
              event.stopPropagation();
              onViewProfile();
            }}
            aria-label={t('discover.viewProfile')}
          >
            <UserPlus className="h-5 w-5" />
          </Button>
          <div className="hidden rounded-full border border-white/10 bg-white/5 p-2 text-muted-foreground md:flex">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
