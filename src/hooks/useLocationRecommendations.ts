import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCachedRecommendations, 
  cacheRecommendations, 
  clearExpiredCache,
  getCacheStats 
} from '@/lib/recommendationCache';

interface LocationRecommendation {
  name: string;
  address: string;
  type: string;
  rating?: number;
  description: string;
  tips: string[];
  best_for: string[];
}

interface RecommendationsResponse {
  success: boolean;
  activity: string;
  city: string;
  recommendations: LocationRecommendation[];
  citations: string[];
  error?: string;
}

export function useLocationRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<LocationRecommendation[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  const [isFromCache, setIsFromCache] = useState(false);

  // Clear expired cache on mount
  useEffect(() => {
    clearExpiredCache();
  }, []);

  const getRecommendations = useCallback(async (
    activity: string,
    city: string,
    context?: string,
    bypassCache = false
  ): Promise<LocationRecommendation[]> => {
    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = getCachedRecommendations(activity, city);
      if (cached) {
        setRecommendations(cached.recommendations);
        setCitations(cached.citations);
        setIsFromCache(true);
        setIsLoading(false);
        return cached.recommendations;
      }
    }

    try {
      const { data, error: fnError } = await supabase.functions.invoke<RecommendationsResponse>(
        'recommend-locations',
        {
          body: { activity, city, context },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to get recommendations');
      }

      // Cache the successful response
      cacheRecommendations(activity, city, data.recommendations, data.citations || []);

      setRecommendations(data.recommendations);
      setCitations(data.citations || []);
      return data.recommendations;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useLocationRecommendations] Error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
    setCitations([]);
    setError(null);
    setIsFromCache(false);
  }, []);

  const refreshRecommendations = useCallback(async (
    activity: string,
    city: string,
    context?: string
  ): Promise<LocationRecommendation[]> => {
    // Force bypass cache to get fresh results
    return getRecommendations(activity, city, context, true);
  }, [getRecommendations]);

  return {
    getRecommendations,
    refreshRecommendations,
    clearRecommendations,
    recommendations,
    citations,
    isLoading,
    error,
    isFromCache,
    getCacheStats,
  };
}
