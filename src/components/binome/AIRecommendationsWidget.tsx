import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Clock, ChevronRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { ACTIVITIES, ActivityType } from '@/types/signal';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface SessionRecommendation {
  activity: ActivityType;
  reason: string;
  best_time: string;
  tip: string;
}

interface CachedRecommendations {
  recommendations: SessionRecommendation[];
  motivation: string;
  timestamp: number;
  userId: string;
}

const CACHE_KEY = 'ai_recommendations_cache';
const CACHE_DURATION_MS = 30 * 60 * 1000;

function getCachedRecommendations(userId: string): CachedRecommendations | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: CachedRecommendations = JSON.parse(cached);
    if (Date.now() - data.timestamp > CACHE_DURATION_MS || data.userId !== userId) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function setCachedRecommendations(userId: string, recommendations: SessionRecommendation[], motivation: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ recommendations, motivation, timestamp: Date.now(), userId }));
  } catch {}
}

export function AIRecommendationsWidget() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { getSessionRecommendations, isLoading, error } = useAIAssistant();
  const [recommendations, setRecommendations] = useState<SessionRecommendation[]>([]);
  const [motivation, setMotivation] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchRecommendations = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    if (!forceRefresh) {
      const cached = getCachedRecommendations(user.id);
      if (cached) {
        setRecommendations(cached.recommendations);
        setMotivation(cached.motivation);
        setHasFetched(true);
        setIsFromCache(true);
        return;
      }
    }
    setIsFromCache(false);
    const result = await getSessionRecommendations(user.id, {
      favorite_activities: (profile as any)?.favorite_activities || [],
    });
    if (result) {
      const recs = result.recommendations || [];
      const mot = result.motivation || '';
      setRecommendations(recs);
      setMotivation(mot);
      setHasFetched(true);
      setCachedRecommendations(user.id, recs, mot);
    }
  }, [user, profile, getSessionRecommendations]);

  useEffect(() => {
    if (user && !hasFetched && !isLoading) { fetchRecommendations(); }
  }, [user, hasFetched, isLoading, fetchRecommendations]);

  const getActivityData = (activityId: ActivityType) => ACTIVITIES.find(a => a.id === activityId);

  if (!user) return null;

  return (
    <motion.div className="glass rounded-xl overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-coral/20 to-signal-green/20">
            <Sparkles className="h-4 w-4 text-coral" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground text-sm">{t('aiRecommendations.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('aiRecommendations.subtitle')}</p>
          </div>
        </div>
        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              {motivation && (
                <div className="p-3 rounded-lg bg-coral/10 border border-coral/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{motivation}</p>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && recommendations.length > 0 && (
                <div className="space-y-2">
                  {recommendations.map((rec, idx) => {
                    const activityData = getActivityData(rec.activity);
                    return (
                      <motion.div key={rec.activity} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">{activityData?.emoji || '🎯'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground text-sm">{t(activityData?.labelKey || 'activities.other')}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-deep-blue-light text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{rec.best_time}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                            {rec.tip && <p className="text-xs text-coral mt-1 italic">💡 {rec.tip}</p>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {!isLoading && recommendations.length === 0 && !error && hasFetched && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{t('aiRecommendations.empty')}</p>
                </div>
              )}

              {error && (
                <div className="text-center py-4">
                  <p className="text-sm text-destructive mb-2">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                {isFromCache && <span className="text-xs text-muted-foreground">{t('aiRecommendations.fromCache')}</span>}
                <Button variant="ghost" size="sm" onClick={() => fetchRecommendations(true)} disabled={isLoading} className={cn("flex-1", !isFromCache && "w-full")}>
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  {isFromCache ? t('aiRecommendations.refresh') : t('aiRecommendations.refreshSuggestions')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
