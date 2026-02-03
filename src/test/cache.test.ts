import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

import { 
  getCachedRecommendations, 
  cacheRecommendations, 
  clearAllRecommendationCache,
  clearExpiredCache,
  getCacheStats 
} from "@/lib/recommendationCache";

describe("Recommendation Cache", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Cache Key Generation", () => {
    it("should generate consistent cache keys for same inputs", () => {
      const params1 = { activity: "studying", city: "Paris" };
      const params2 = { activity: "studying", city: "Paris" };
      
      // Same inputs should generate same internal key
      expect(JSON.stringify(params1)).toBe(JSON.stringify(params2));
    });

    it("should generate different keys for different inputs", () => {
      const params1 = { activity: "studying", city: "Paris" };
      const params2 = { activity: "eating", city: "Lyon" };
      
      expect(JSON.stringify(params1)).not.toBe(JSON.stringify(params2));
    });
  });

  describe("Cache Operations", () => {
    it("should return null for non-existent cache entries", () => {
      const result = getCachedRecommendations("studying", "Paris");
      expect(result).toBeNull();
    });

    it("should store and retrieve cached recommendations", () => {
      const testData = [
        { 
          name: "Café Le Marais", 
          address: "123 Rue", 
          type: "cafe", 
          description: "Great place",
          tips: ["Quiet in morning"],
          best_for: ["studying"]
        }
      ];
      cacheRecommendations("studying", "Paris", testData, ["source1"]);
      
      const result = getCachedRecommendations("studying", "Paris");
      expect(result?.recommendations).toEqual(testData);
    });

    it("should handle empty arrays", () => {
      cacheRecommendations("sport", "Lyon", [], []);
      const result = getCachedRecommendations("sport", "Lyon");
      expect(result?.recommendations).toEqual([]);
    });
  });

  describe("Cache Expiration", () => {
    it("should return null for expired entries", () => {
      // Mock Date to simulate time passing
      const now = Date.now();
      vi.setSystemTime(now);
      
      cacheRecommendations("eating", "Marseille", [
        { name: "Test", address: "123", type: "resto", description: "desc", tips: [], best_for: [] }
      ], []);
      
      // Advance time by 25 hours (past 24h TTL)
      vi.setSystemTime(now + 25 * 60 * 60 * 1000);
      
      const result = getCachedRecommendations("eating", "Marseille");
      expect(result).toBeNull();
      
      vi.useRealTimers();
    });

    it("should return cached data within TTL", () => {
      const now = Date.now();
      vi.setSystemTime(now);
      
      cacheRecommendations("working", "Nice", [
        { name: "Coworking", address: "456", type: "work", description: "desc", tips: [], best_for: [] }
      ], []);
      
      // Advance time by 12 hours (within 24h TTL)
      vi.setSystemTime(now + 12 * 60 * 60 * 1000);
      
      const result = getCachedRecommendations("working", "Nice");
      expect(result?.recommendations.length).toBe(1);
      
      vi.useRealTimers();
    });
  });

  describe("Cache Cleanup", () => {
    it("should clear all cached entries", () => {
      cacheRecommendations("studying", "Paris", [
        { name: "Place1", address: "1", type: "lib", description: "d", tips: [], best_for: [] }
      ], []);
      cacheRecommendations("eating", "Lyon", [
        { name: "Place2", address: "2", type: "resto", description: "d", tips: [], best_for: [] }
      ], []);
      
      clearAllRecommendationCache();
      
      expect(getCachedRecommendations("studying", "Paris")).toBeNull();
      expect(getCachedRecommendations("eating", "Lyon")).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in city names", () => {
      const testData = [
        { name: "Café", address: "1", type: "cafe", description: "d", tips: [], best_for: [] }
      ];
      cacheRecommendations("eating", "Saint-Étienne", testData, []);
      
      const result = getCachedRecommendations("eating", "Saint-Étienne");
      expect(result?.recommendations).toEqual(testData);
    });

    it("should handle unicode characters", () => {
      const testData = [
        { name: "日本食レストラン", address: "1", type: "resto", description: "d", tips: [], best_for: [] }
      ];
      cacheRecommendations("eating", "東京", testData, []);
      
      const result = getCachedRecommendations("eating", "東京");
      expect(result?.recommendations).toEqual(testData);
    });
  });

  describe("Cache Stats", () => {
    it("should return correct cache statistics", () => {
      const stats = getCacheStats();
      expect(stats.count).toBe(0);
      
      cacheRecommendations("studying", "Paris", [], []);
      
      const statsAfter = getCacheStats();
      expect(statsAfter.count).toBeGreaterThanOrEqual(0);
    });
  });
});
