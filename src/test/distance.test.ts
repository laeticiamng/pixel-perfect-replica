import { describe, it, expect } from 'vitest';
import { calculateDistance, formatDistance, formatTimeSince } from '@/utils/distance';

describe('Distance utilities', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // Paris to Paris (same point) should be 0
      const distance = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
      expect(distance).toBe(0);
    });

    it('should calculate distance correctly for nearby points', () => {
      // Two points ~100m apart in Paris
      const lat1 = 48.8566;
      const lon1 = 2.3522;
      const lat2 = 48.8576; // ~111m north
      const lon2 = 2.3522;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      expect(distance).toBeGreaterThan(100);
      expect(distance).toBeLessThan(120);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(50)).toBe('50m');
      expect(formatDistance(100)).toBe('100m');
      expect(formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1000)).toBe('1.0km');
      expect(formatDistance(1500)).toBe('1.5km');
      expect(formatDistance(2345)).toBe('2.3km');
    });
  });

  describe('formatTimeSince', () => {
    it('should format recent times', () => {
      const now = new Date();
      expect(formatTimeSince(now)).toBe("À l'instant");
    });

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatTimeSince(fiveMinutesAgo)).toBe('Il y a 5min');
    });

    it('should format hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatTimeSince(twoHoursAgo)).toBe('Il y a 2h');
    });
  });
});
