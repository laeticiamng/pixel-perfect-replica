import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const getRecommendations = useCallback(async (
    activity: string,
    city: string,
    context?: string
  ): Promise<LocationRecommendation[]> => {
    setIsLoading(true);
    setError(null);

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
  }, []);

  return {
    getRecommendations,
    clearRecommendations,
    recommendations,
    citations,
    isLoading,
    error,
  };
}
