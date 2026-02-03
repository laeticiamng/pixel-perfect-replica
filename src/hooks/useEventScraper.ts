import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ScrapedEvent {
  id: string;
  name: string;
  description: string | null;
  location_name: string;
  starts_at: string;
  ends_at: string;
}

interface ScrapeEventsResponse {
  success: boolean;
  scraped_pages: number;
  events_found: number;
  events_imported: number;
  events: ScrapedEvent[];
  error?: string;
}

export function useEventScraper() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeEventsResponse | null>(null);

  const scrapeEvents = useCallback(async (
    universityUrl: string,
    city: string
  ): Promise<ScrapeEventsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<ScrapeEventsResponse>(
        'scrape-events',
        {
          body: { university_url: universityUrl, city },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to scrape events');
      }

      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[useEventScraper] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    scrapeEvents,
    clearResult,
    result,
    isLoading,
    error,
  };
}
