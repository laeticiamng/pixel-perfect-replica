import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CityGuide {
  user_id: string;
  first_name: string;
  avatar_url: string | null;
  university: string | null;
  bio: string | null;
}

export function useCityGuides() {
  const [guides, setGuides] = useState<CityGuide[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGuides = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setIsLoading(true);

    const { data, error } = await supabase.rpc('get_city_guides', {
      p_city: city.trim(),
      p_limit: 5,
    });

    if (!error && data) {
      setGuides(data as CityGuide[]);
    }
    setIsLoading(false);
  }, []);

  return { guides, isLoading, fetchGuides };
}
