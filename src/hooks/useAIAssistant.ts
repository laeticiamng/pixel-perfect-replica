import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityType } from '@/types/signal';

interface IcebreakerContext {
  time_of_day?: string;
  location_type?: string;
  user_interests?: string[];
  other_user_name?: string;
}

interface SessionRecommendation {
  activity: ActivityType;
  reason: string;
  best_time: string;
  tip: string;
}

interface RecommendationsResponse {
  recommendations: SessionRecommendation[];
  motivation: string;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'le matin';
    if (hour < 14) return 'midi';
    if (hour < 18) return "l'après-midi";
    return 'le soir';
  };

  const generateIcebreakers = useCallback(async (
    activity: ActivityType,
    context?: IcebreakerContext
  ): Promise<string[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-assistant', {
        body: {
          activity,
          context: {
            time_of_day: context?.time_of_day || getTimeOfDay(),
            ...context,
          },
          language: 'fr',
        },
      });

      if (fnError) {
        console.error('AI Assistant error:', fnError);
        throw new Error(fnError.message);
      }

      if (data?.icebreakers && Array.isArray(data.icebreakers)) {
        return data.icebreakers;
      }

      throw new Error('Invalid response format');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Icebreaker generation failed:', err);
      
      // Return fallback icebreakers
      return getFallbackIcebreakers(activity);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSessionRecommendations = useCallback(async (
    userId: string,
    preferences?: {
      favorite_activities?: string[];
      preferred_times?: string[];
      city?: string;
    },
    history?: {
      past_activities?: string[];
      successful_sessions?: number;
    }
  ): Promise<RecommendationsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant?action=session-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ user_id: userId, preferences, history }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Session recommendations failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateIcebreakers,
    getSessionRecommendations,
    isLoading,
    error,
  };
}

function getFallbackIcebreakers(activity: ActivityType): string[] {
  const fallbacks: Record<string, string[]> = {
    studying: [
      "Hey ! Tu révises quoi en ce moment ? 📚",
      "Besoin d'un partenaire de révision ?",
      "On se motive ensemble pour bosser ?",
    ],
    eating: [
      "T'as faim ? Je connais un bon spot ! 🍽️",
      "On partage un repas ?",
      "Je cherche quelqu'un pour déjeuner !",
    ],
    working: [
      "Tu bosses sur quoi ? 💻",
      "Envie de co-worker ?",
      "On se motive mutuellement ?",
    ],
    talking: [
      "Hey ! Une pause café ça te dit ? ☕",
      "Je m'ennuie, on papote ?",
      "T'as 5 minutes pour discuter ?",
    ],
    sport: [
      "Prêt·e pour une session ? 🏃",
      "On se motive pour bouger !",
      "Envie de faire du sport ?",
    ],
    other: [
      "Salut ! Qu'est-ce que tu fais ?",
      "Hey, on fait connaissance ?",
      "Envie de passer un moment sympa ?",
    ],
  };

  return fallbacks[activity] || fallbacks.other;
}
