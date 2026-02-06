import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Loader2, Sparkles, ExternalLink, ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocationRecommendations } from '@/hooks/useLocationRecommendations';
import { ActivityType, ACTIVITY_CONFIG } from '@/types/signal';
import { useTranslation } from '@/lib/i18n';

interface SmartLocationRecommenderProps {
  activity: ActivityType;
  city?: string;
  onSelectLocation?: (name: string, address: string) => void;
  className?: string;
}

export function SmartLocationRecommender({ activity, city = 'Paris', onSelectLocation, className = '' }: SmartLocationRecommenderProps) {
  const { t } = useTranslation();
  const { getRecommendations, refreshRecommendations, recommendations, citations, isLoading, error, isFromCache } = useLocationRecommendations();
  const [showRecommendations, setShowRecommendations] = useState(false);

  const activityConfig = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG.other;

  const handleGetRecommendations = async () => {
    setShowRecommendations(true);
    await getRecommendations(activity, city);
  };

  const handleRefresh = async () => {
    await refreshRecommendations(activity, city);
  };

  return (
    <div className={className}>
      {!showRecommendations ? (
        <Button onClick={handleGetRecommendations} disabled={isLoading} variant="outline" className="w-full gap-2 h-12 border-dashed border-coral/50 hover:border-coral hover:bg-coral/5">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-coral" />}
          <span>{t('locationRecommender.suggestButton').replace('{activity}', activityConfig.label)}</span>
        </Button>
      ) : (
        <Card className="overflow-hidden border-coral/20">
          <CardHeader className="pb-2 bg-gradient-to-r from-coral/10 to-transparent">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-coral" />
                {t('locationRecommender.title').replace('{city}', city)}
                {isFromCache && (
                  <Badge variant="secondary" className="text-xs gap-1"><Zap className="h-3 w-3" />Cache</Badge>
                )}
              </div>
              {!isLoading && recommendations.length > 0 && (
                <Button onClick={handleRefresh} variant="ghost" size="sm" className="h-7 w-7 p-0" title={t('locationRecommender.refresh')}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-coral" />
                <span className="ml-2 text-muted-foreground">{t('locationRecommender.analyzing')}</span>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-destructive text-sm">{error}</p>
                <Button onClick={handleGetRecommendations} variant="ghost" size="sm" className="mt-2">{t('locationRecommender.retry')}</Button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div key={rec.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group p-3 rounded-lg border border-border hover:border-coral/30 hover:bg-coral/5 transition-all cursor-pointer" onClick={() => onSelectLocation?.(rec.name, rec.address)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground truncate">{rec.name}</h4>
                            {rec.rating && <span className="flex items-center text-xs text-signal-yellow"><Star className="h-3 w-3 mr-0.5 fill-current" />{rec.rating}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{rec.address}</p>
                          <p className="text-sm text-foreground/80 mt-1">{rec.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {rec.best_for.map((tag) => <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">{tag}</Badge>)}
                          </div>
                          {rec.tips.length > 0 && <p className="text-xs text-coral mt-2 italic">💡 {rec.tips[0]}</p>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                  {citations.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-1">{t('locationRecommender.sources')}</p>
                      <div className="flex flex-wrap gap-1">
                        {citations.slice(0, 3).map((citation, i) => (
                          <a key={i} href={citation} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-coral hover:underline">
                            <ExternalLink className="h-3 w-3" />Source {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            )}
            <Button onClick={() => setShowRecommendations(false)} variant="ghost" size="sm" className="w-full mt-3">{t('locationRecommender.hide')}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
