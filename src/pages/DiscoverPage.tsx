import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Wifi, GraduationCap, UserPlus, AlertTriangle, RefreshCw } from 'lucide-react';
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
import { ACTIVITIES } from '@/types/signal';
import { VerificationBadges } from '@/components/social/VerificationBadges';
import { TooltipProvider } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/BottomNav';
import toast from 'react-hot-toast';

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

export default function DiscoverPage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dateLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  const [users, setUsers] = useState<DiscoveredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setFetchError(false);
    try {
      const { data, error } = await supabase.rpc('discover_users', {
        p_activity: selectedActivity,
        p_university: selectedUniversity,
        p_search: searchQuery || null,
        p_limit: 30,
      });
      if (error) throw error;
      setUsers((data ?? []) as DiscoveredUser[]);
    } catch (err) {
      console.error('Error fetching users:', err);
      setFetchError(true);
      toast.error(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedActivity, selectedUniversity, searchQuery]);

  // Initial load + refetch on filter change
  useEffect(() => {
    const timer = setTimeout(fetchUsers, searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Derive unique universities from current results
  useEffect(() => {
    const unis = [...new Set(users.map(u => u.university).filter(Boolean))] as string[];
    setUniversities(unis.sort());
  }, [users]);

  const onlineCount = users.filter(u => u.is_online_now).length;

  return (
    <TooltipProvider>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageLayout className="pb-28">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">
          {/* Header */}
          <PageHeader
            title={t('discover.title')}
            subtitle={t('discover.subtitle')}
            showBack={false}
          />

          {/* Search + filter bar */}
          <div className="mt-6 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('discover.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-muted/50 border-border/50"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="icon"
                className="h-12 w-12 rounded-xl shrink-0"
                onClick={() => setShowFilters(!showFilters)}
                aria-label={showFilters ? t('discover.hideFilters') : t('discover.showFilters')}
                aria-expanded={showFilters}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Online counter */}
            {onlineCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-signal-green"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal-green" />
                </span>
                {t('discover.onlineNow', { count: onlineCount })}
              </motion.div>
            )}

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 py-2">
                    {/* Activity filter */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        {t('discover.filterActivity')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={selectedActivity === null ? 'default' : 'outline'}
                          className={cn(
                            "cursor-pointer transition-all",
                            selectedActivity === null && "bg-coral text-white border-coral"
                          )}
                          onClick={() => setSelectedActivity(null)}
                        >
                          {t('activityFilter.all')}
                        </Badge>
                        {ACTIVITIES.map(act => (
                          <Badge
                            key={act.id}
                            variant={selectedActivity === act.id ? 'default' : 'outline'}
                            className={cn(
                              "cursor-pointer transition-all",
                              selectedActivity === act.id && "bg-coral text-white border-coral"
                            )}
                            onClick={() => setSelectedActivity(selectedActivity === act.id ? null : act.id)}
                          >
                            {act.emoji} {t(act.labelKey)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* University filter */}
                    {universities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          {t('discover.filterUniversity')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={selectedUniversity === null ? 'default' : 'outline'}
                            className={cn(
                              "cursor-pointer transition-all",
                              selectedUniversity === null && "bg-coral text-white border-coral"
                            )}
                            onClick={() => setSelectedUniversity(null)}
                          >
                            {t('activityFilter.all')}
                          </Badge>
                          {universities.map(uni => (
                            <Badge
                              key={uni}
                              variant={selectedUniversity === uni ? 'default' : 'outline'}
                              className={cn(
                                "cursor-pointer transition-all",
                                selectedUniversity === uni && "bg-coral text-white border-coral"
                              )}
                              onClick={() => setSelectedUniversity(selectedUniversity === uni ? null : uni)}
                            >
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {uni}
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

          {/* Results */}
          <div className="mt-6 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))
            ) : fetchError ? (
              <div className="text-center py-12 space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-foreground font-medium">{t('errors.generic')}</p>
                <Button variant="outline" onClick={fetchUsers} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('common.retry')}
                </Button>
              </div>
            ) : users.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title={t('discover.noResults')}
                description={t('discover.noResultsDesc')}
              />
            ) : (
              users.map((u, i) => (
                <UserCard
                  key={u.user_id}
                  user={u}
                  index={i}
                  dateLocale={dateLocale}
                  t={t}
                  onViewProfile={() => navigate(`/reveal/${u.user_id}`)}
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
  user: DiscoveredUser;
  index: number;
  dateLocale: typeof enUS;
  t: (key: string, vars?: Record<string, unknown>) => string;
  onViewProfile: () => void;
}

function UserCard({ user, index, dateLocale, t, onViewProfile }: UserCardProps) {
  const activity = user.current_activity
    ? ACTIVITIES.find(a => a.id === user.current_activity)
    : null;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onViewProfile}
      aria-label={`${t('discover.viewProfile')} ${user.first_name || ''}`}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-coral/30 hover:shadow-md transition-all cursor-pointer group text-left"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-background shadow-sm group-hover:shadow-md transition-shadow">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.first_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-foreground">
              {(user.first_name ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {/* Online indicator */}
        {user.is_online_now && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-signal-green border-2 border-background">
            <div className="absolute inset-0 rounded-full bg-signal-green animate-ping opacity-40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground truncate">{user.first_name}</h3>
          <VerificationBadges userId={user.user_id} />
          {user.is_online_now && activity && (
            <Badge variant="outline" className="text-xs bg-signal-green/10 text-signal-green border-signal-green/30 shrink-0">
              {activity.emoji} {t(activity.labelKey)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          {user.university && (
            <span className="flex items-center gap-1 truncate">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              {user.university}
            </span>
          )}
          {!user.is_online_now && user.last_active_at && (
            <span className="flex items-center gap-1 shrink-0">
              <Wifi className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true, locale: dateLocale })}
            </span>
          )}
        </div>

        {/* Favorite activities */}
        {user.favorite_activities && user.favorite_activities.length > 0 && !user.is_online_now && (
          <div className="flex items-center gap-1.5 mt-2">
            {user.favorite_activities.slice(0, 4).map(actId => {
              const act = ACTIVITIES.find(a => a.id === actId);
              return act ? (
                <span key={actId} className="text-sm" title={t(act.labelKey)}>
                  {act.emoji}
                </span>
              ) : null;
            })}
            {user.favorite_activities.length > 4 && (
              <span className="text-xs text-muted-foreground">+{user.favorite_activities.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 rounded-xl text-muted-foreground group-hover:text-coral group-hover:bg-coral/10 transition-all"
        onClick={(e) => { e.stopPropagation(); onViewProfile(); }}
        aria-label={t('discover.viewProfile')}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    </motion.button>
  );
}
