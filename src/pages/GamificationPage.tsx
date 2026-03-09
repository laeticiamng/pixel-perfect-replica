import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Flame, Trophy, Medal, Crown, Star, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { useGamification, ACHIEVEMENTS } from '@/hooks/useGamification';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DAY_LABELS_KEY = ['gamification.mon', 'gamification.tue', 'gamification.wed', 'gamification.thu', 'gamification.fri', 'gamification.sat', 'gamification.sun'] as const;

function StreakCard({ streak, t }: { streak: any; t: (k: string) => string }) {
  const weekActivity = streak?.week_activity || [false, false, false, false, false, false, false];

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-coral/20">
            <Flame className="h-6 w-6 text-coral" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">{t('gamification.currentStreak')}</h2>
            <p className="text-sm text-muted-foreground">{t('gamification.keepGoing')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black bg-gradient-to-r from-coral to-coral-light bg-clip-text text-transparent">
            {streak?.current_streak || 0}
          </p>
          <p className="text-xs text-muted-foreground">{t('gamification.days')}</p>
        </div>
      </div>

      {/* Week visualization */}
      <div className="flex items-center justify-between gap-1">
        {weekActivity.map((active: boolean, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                active
                  ? "bg-coral text-white shadow-[0_0_12px_hsl(var(--coral)/0.4)]"
                  : "bg-muted/40 text-muted-foreground"
              )}
            >
              {active ? <Flame className="h-4 w-4" /> : <span className="text-xs">·</span>}
            </motion.div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {t(DAY_LABELS_KEY[i])}
            </span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-around pt-2 border-t border-border/30">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{streak?.longest_streak || 0}</p>
          <p className="text-xs text-muted-foreground">{t('gamification.longestStreak')}</p>
        </div>
        <div className="w-px h-8 bg-border/30" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{streak?.total_active_days || 0}</p>
          <p className="text-xs text-muted-foreground">{t('gamification.totalDays')}</p>
        </div>
      </div>
    </div>
  );
}

function AchievementsGrid({ unlockedKeys, t }: { unlockedKeys: Set<string>; t: (k: string) => string }) {
  const unlocked = ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key));
  const locked = ACHIEVEMENTS.filter(a => !unlockedKeys.has(a.key));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-signal-yellow" />
        <h2 className="font-bold text-foreground">{t('gamification.achievements')}</h2>
        <span className="text-sm text-muted-foreground">
          {unlocked.length}/{ACHIEVEMENTS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted/30 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-signal-yellow to-coral rounded-full h-2"
          initial={{ width: 0 }}
          animate={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {[...unlocked, ...locked].map((ach, idx) => {
            const isUnlocked = unlockedKeys.has(ach.key);
            return (
              <motion.div
                key={ach.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "glass rounded-xl p-4 transition-all",
                  isUnlocked
                    ? "border border-signal-yellow/30 shadow-[0_0_20px_hsl(var(--signal-yellow)/0.1)]"
                    : "opacity-50 grayscale"
                )}
              >
                <div className="text-2xl mb-2">{ach.icon}</div>
                <p className={cn(
                  "text-sm font-semibold",
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {t(ach.titleKey)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(ach.descKey)}</p>
                {isUnlocked && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 text-signal-yellow fill-signal-yellow" />
                    <span className="text-[10px] text-signal-yellow font-bold">{t('gamification.unlocked')}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LeaderboardView({
  leaderboard, leaderboardLoading, fetchLeaderboard, userId, profile, t
}: {
  leaderboard: any[]; leaderboardLoading: boolean; fetchLeaderboard: (u?: string) => void;
  userId?: string; profile: any; t: (k: string) => string;
}) {
  const [filter, setFilter] = useState<'global' | 'campus'>('global');

  const handleFilterChange = (val: string) => {
    setFilter(val as 'global' | 'campus');
    if (val === 'campus' && profile?.university) {
      fetchLeaderboard(profile.university);
    } else {
      fetchLeaderboard();
    }
  };

  // Load on first render
  useEffect(() => { fetchLeaderboard(); }, []);

  const RANK_STYLES = [
    'bg-gradient-to-r from-signal-yellow/20 to-signal-yellow/5 border-signal-yellow/40',
    'bg-gradient-to-r from-muted/40 to-muted/10 border-muted-foreground/30',
    'bg-gradient-to-r from-coral/15 to-coral/5 border-coral/30',
  ];

  const RANK_ICONS = [
    <Crown className="h-5 w-5 text-signal-yellow" />,
    <Medal className="h-5 w-5 text-muted-foreground" />,
    <Medal className="h-5 w-5 text-coral" />,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-coral" />
        <h2 className="font-bold text-foreground">{t('gamification.leaderboard')}</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => handleFilterChange('global')}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
            filter === 'global'
              ? "bg-coral text-white border-coral"
              : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
          )}
        >
          🌍 {t('gamification.global')}
        </button>
        {profile?.university && (
          <button
            onClick={() => handleFilterChange('campus')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
              filter === 'campus'
                ? "bg-coral text-white border-coral"
                : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
            )}
          >
            🏫 {profile.university}
          </button>
        )}
      </div>

      {leaderboardLoading ? (
        <LoadingSkeleton variant="list" count={5} />
      ) : leaderboard.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">{t('gamification.noLeaderboard')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('gamification.noLeaderboardDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const isMe = entry.user_id === userId;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  index < 3 ? RANK_STYLES[index] : "glass border-border/20",
                  isMe && "ring-2 ring-coral/50"
                )}
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {index < 3 ? RANK_ICONS[index] : (
                    <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-coral/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-coral font-bold text-sm">
                      {entry.first_name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", isMe ? "text-coral" : "text-foreground")}>
                    {entry.first_name} {isMe && `(${t('gamification.you')})`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>🔥 {entry.current_streak}</span>
                    <span>👥 {entry.interactions}</span>
                    <span>📅 {entry.sessions_completed}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-foreground">{entry.score}</p>
                  <p className="text-[10px] text-muted-foreground">{t('gamification.pts')}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GamificationPage() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const {
    streak, unlockedKeys, leaderboard, isLoading, leaderboardLoading, fetchLeaderboard,
  } = useGamification();

  if (isLoading) {
    return (
      <PageLayout className="pb-28">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          <PageHeader title={t('gamification.title')} subtitle={t('gamification.subtitle')} showBack />
          <LoadingSkeleton variant="card" count={3} />
        </div>
        <BottomNav />
      </PageLayout>
    );
  }

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <PageLayout className="pb-28">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <PageHeader
          title={t('gamification.title')}
          subtitle={t('gamification.subtitle')}
          showBack
        />

        <Tabs defaultValue="streaks" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 rounded-xl">
            <TabsTrigger value="streaks" className="rounded-lg">
              <Flame className="h-4 w-4 mr-1.5" /> {t('gamification.tabStreaks')}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg">
              <Trophy className="h-4 w-4 mr-1.5" /> {t('gamification.tabBadges')}
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg">
              <Crown className="h-4 w-4 mr-1.5" /> {t('gamification.tabRanking')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaks" className="space-y-4">
            <StreakCard streak={streak} t={t} />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsGrid unlockedKeys={unlockedKeys} t={t} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardView
              leaderboard={leaderboard}
              leaderboardLoading={leaderboardLoading}
              fetchLeaderboard={fetchLeaderboard}
              userId={user?.id}
              profile={profile}
              t={t}
            />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </PageLayout>
    </>
  );
}
