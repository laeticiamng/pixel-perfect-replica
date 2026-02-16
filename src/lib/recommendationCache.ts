/**
 * Client-side cache for AI location recommendations
 * Reduces Perplexity API calls by caching results for 24 hours
 */
import { logger } from '@/lib/logger';

interface CachedRecommendation {
  data: {
    recommendations: LocationRecommendation[];
    citations: string[];
  };
  timestamp: number;
  expiresAt: number;
}

interface LocationRecommendation {
  name: string;
  address: string;
  type: string;
  rating?: number;
  description: string;
  tips: string[];
  best_for: string[];
}

const CACHE_KEY_PREFIX = 'easy_location_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a cache key from activity and city
 */
function generateCacheKey(activity: string, city: string): string {
  const normalizedCity = city.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedActivity = activity.toLowerCase().trim();
  return `${CACHE_KEY_PREFIX}${normalizedActivity}_${normalizedCity}`;
}

/**
 * Get cached recommendations if they exist and are not expired
 */
export function getCachedRecommendations(
  activity: string,
  city: string
): { recommendations: LocationRecommendation[]; citations: string[] } | null {
  try {
    const key = generateCacheKey(activity, city);
    const cached = localStorage.getItem(key);
    
    if (!cached) {
      return null;
    }
    
    const parsed: CachedRecommendation = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (error) {
    logger.ui.error('RecommendationCache', 'Error reading cache: ' + String(error));
    return null;
  }
}

/**
 * Cache recommendations for future use
 */
export function cacheRecommendations(
  activity: string,
  city: string,
  recommendations: LocationRecommendation[],
  citations: string[]
): void {
  try {
    const key = generateCacheKey(activity, city);
    const cacheEntry: CachedRecommendation = {
      data: { recommendations, citations },
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    logger.ui.error('RecommendationCache', 'Error caching: ' + String(error));
    // If localStorage is full, clear old entries
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearExpiredCache();
    }
  }
}

/**
 * Clear all expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed: CachedRecommendation = JSON.parse(cached);
            if (Date.now() > parsed.expiresAt) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    logger.ui.error('RecommendationCache', 'Error clearing cache: ' + String(error));
  }
}

/**
 * Clear all recommendation cache entries
 */
export function clearAllRecommendationCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    logger.ui.error('RecommendationCache', 'Error clearing all cache: ' + String(error));
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { count: number; oldestTimestamp: number | null; newestTimestamp: number | null } {
  let count = 0;
  let oldestTimestamp: number | null = null;
  let newestTimestamp: number | null = null;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        count++;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            const parsed: CachedRecommendation = JSON.parse(cached);
            if (oldestTimestamp === null || parsed.timestamp < oldestTimestamp) {
              oldestTimestamp = parsed.timestamp;
            }
            if (newestTimestamp === null || parsed.timestamp > newestTimestamp) {
              newestTimestamp = parsed.timestamp;
            }
          } catch {
            // Invalid entry
          }
        }
      }
    }
  } catch (error) {
    logger.ui.error('RecommendationCache', 'Error getting stats: ' + String(error));
  }
  
  return { count, oldestTimestamp, newestTimestamp };
}
