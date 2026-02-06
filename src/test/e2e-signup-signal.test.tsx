/**
 * E2E Tests: Complete Signup and Signal Activation Flow
 * Tests the full user journey from signup to signal activation on the map
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSignalStore } from '@/stores/signalStore';
import { 
  validateEmail, 
  validatePassword, 
  getPasswordStrength,
  emailSchema,
  passwordSchema,
  firstNameSchema,
} from '@/lib/validation';
import { sanitizeInput } from '@/lib/sanitize';
import { getDistanceBetweenPoints } from '@/utils/distance';

// =============================================================================
// SUITE 1: Signup Flow Validation
// =============================================================================
describe('E2E Complete Signup Flow', () => {
  describe('CP-SIGNUP-001: Form Validation Schemas', () => {
    it('should validate email format correctly', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user@university.edu')).toBe(true);
      expect(validateEmail('name.surname@domain.fr')).toBe(true);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@')).toBe(false);
      expect(validateEmail('@nodomain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('CP-SIGNUP-002: Email Schema Edge Cases', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'simple@example.com',
        'very.common@example.com',
        'user+tag@example.com',
        'user@sub.domain.com',
      ];
      
      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missinglocal.com',
        'missing@.com',
        'spaces in@email.com',
      ];
      
      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should trim whitespace from emails', () => {
      const result = emailSchema.safeParse('  test@example.com  ');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
    });
  });

  describe('CP-SIGNUP-003: Password Strength Indicator', () => {
    it('should return weak score for short passwords', () => {
      const result = getPasswordStrength('abc');
      expect(result.score).toBeLessThanOrEqual(2);
      expect(result.label).toBe('Faible');
      expect(result.color).toBe('bg-signal-red');
    });

    it('should return medium score for moderate passwords', () => {
      const result = getPasswordStrength('Passw1');
      expect(result.score).toBeGreaterThan(2);
      expect(result.score).toBeLessThanOrEqual(4);
    });

    it('should return strong score for complex passwords', () => {
      const result = getPasswordStrength('MyP@ssw0rd!Strong');
      expect(result.score).toBeGreaterThan(4);
      expect(result.label).toBe('Fort');
      expect(result.color).toBe('bg-signal-green');
    });

    it('should increase score with special characters', () => {
      const withoutSpecial = getPasswordStrength('Password1');
      const withSpecial = getPasswordStrength('Password1!');
      expect(withSpecial.score).toBeGreaterThan(withoutSpecial.score);
    });
  });

  describe('CP-SIGNUP-004: FirstName Sanitization (XSS Prevention)', () => {
    it('should sanitize script injection attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should sanitize HTML tags', () => {
      const withTags = '<b>Bold</b> <i>Italic</i>';
      const sanitized = sanitizeInput(withTags);
      expect(sanitized).not.toContain('<b>');
      expect(sanitized).not.toContain('<i>');
    });

    it('should preserve valid names', () => {
      const validNames = ['Jean-Pierre', 'Marie-Claire', "O'Connor", 'François'];
      validNames.forEach(name => {
        const sanitized = sanitizeInput(name);
        expect(sanitized.length).toBeGreaterThan(0);
      });
    });

    it('should reject firstName with invalid characters via schema', () => {
      const invalidNames = ['Name123', 'Name@Test', 'Name<>'];
      invalidNames.forEach(name => {
        const result = firstNameSchema.safeParse(name);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('CP-SIGNUP-005: Password Validation Schema', () => {
    it('should require minimum length', () => {
      const result = passwordSchema.safeParse('Ab1');
      expect(result.success).toBe(false);
    });

    it('should require at least one lowercase letter', () => {
      const result = passwordSchema.safeParse('ABCDEF1');
      expect(result.success).toBe(false);
    });

    it('should require at least one uppercase letter', () => {
      const result = passwordSchema.safeParse('abcdef1');
      expect(result.success).toBe(false);
    });

    it('should require at least one digit', () => {
      const result = passwordSchema.safeParse('Abcdefg');
      expect(result.success).toBe(false);
    });

    it('should accept valid passwords', () => {
      const result = passwordSchema.safeParse('Password1');
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// SUITE 2: Signal Store Validation
// =============================================================================
describe('E2E Signal Activation Flow', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useSignalStore.getState();
    store.deactivateSignal();
  });

  describe('CP-SIGNAL-001: Signal Store Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSignalStore());
      
      expect(result.current.mySignal).toBe('red');
      expect(result.current.myActivity).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.activeSince).toBeNull();
      expect(result.current.nearbyUsers).toEqual([]);
    });
  });

  describe('CP-SIGNAL-002: Activity Selection and Activation', () => {
    it('should activate signal with selected activity', () => {
      const { result } = renderHook(() => useSignalStore());
      
      act(() => {
        result.current.activateSignal('studying');
      });
      
      expect(result.current.mySignal).toBe('green');
      expect(result.current.myActivity).toBe('studying');
      expect(result.current.isActive).toBe(true);
      expect(result.current.activeSince).toBeInstanceOf(Date);
    });

    it('should support all activity types', () => {
      const activities = ['studying', 'eating', 'working', 'talking', 'sport', 'other'] as const;
      
      activities.forEach(activity => {
        const { result } = renderHook(() => useSignalStore());
        
        act(() => {
          result.current.activateSignal(activity);
        });
        
        expect(result.current.myActivity).toBe(activity);
        expect(result.current.isActive).toBe(true);
        
        // Reset for next iteration
        act(() => {
          result.current.deactivateSignal();
        });
      });
    });
  });

  describe('CP-SIGNAL-003: Signal Deactivation', () => {
    it('should properly deactivate signal', () => {
      const { result } = renderHook(() => useSignalStore());
      
      // First activate
      act(() => {
        result.current.activateSignal('eating');
      });
      
      expect(result.current.isActive).toBe(true);
      
      // Then deactivate
      act(() => {
        result.current.deactivateSignal();
      });
      
      expect(result.current.mySignal).toBe('red');
      expect(result.current.myActivity).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.activeSince).toBeNull();
    });
  });

  describe('CP-SIGNAL-004: Signal State Transitions', () => {
    it('should handle rapid state transitions', () => {
      const { result } = renderHook(() => useSignalStore());
      
      // Rapid activate/deactivate cycles
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.activateSignal('working');
        });
        expect(result.current.isActive).toBe(true);
        
        act(() => {
          result.current.deactivateSignal();
        });
        expect(result.current.isActive).toBe(false);
      }
    });

    it('should allow changing activity while active', () => {
      const { result } = renderHook(() => useSignalStore());
      
      act(() => {
        result.current.activateSignal('studying');
      });
      expect(result.current.myActivity).toBe('studying');
      
      act(() => {
        result.current.activateSignal('talking');
      });
      expect(result.current.myActivity).toBe('talking');
      expect(result.current.isActive).toBe(true);
    });
  });

  describe('CP-SIGNAL-005: Icebreaker Generation', () => {
    it('should return icebreaker for each activity', () => {
      const { result } = renderHook(() => useSignalStore());
      
      const activities = ['studying', 'eating', 'working', 'talking', 'sport', 'other'] as const;
      
      activities.forEach(activity => {
        const icebreaker = result.current.getIcebreaker(activity);
        expect(typeof icebreaker).toBe('string');
        expect(icebreaker.length).toBeGreaterThan(0);
      });
    });
  });
});

// =============================================================================
// SUITE 3: GPS Coordinates and Distance Validation
// =============================================================================
describe('E2E Map Discovery Flow', () => {
  describe('CP-MAP-001: GPS Coordinates Validation', () => {
    it('should calculate distance correctly between two points', () => {
      // Paris coordinates
      const paris = { latitude: 48.8566, longitude: 2.3522 };
      // Nearby point (~1km away)
      const nearby = { latitude: 48.8656, longitude: 2.3522 };
      
      const distance = getDistanceBetweenPoints(paris, nearby);
      
      expect(distance).toBeGreaterThan(900);
      expect(distance).toBeLessThan(1100);
    });

    it('should return 0 for same coordinates', () => {
      const point = { latitude: 48.8566, longitude: 2.3522 };
      const distance = getDistanceBetweenPoints(point, point);
      
      expect(distance).toBe(0);
    });

    it('should handle edge case coordinates', () => {
      const northPole = { latitude: 90, longitude: 0 };
      const southPole = { latitude: -90, longitude: 0 };
      
      const distance = getDistanceBetweenPoints(northPole, southPole);
      
      // Should be approximately half Earth circumference (~20,000 km)
      expect(distance).toBeGreaterThan(19000000);
      expect(distance).toBeLessThan(21000000);
    });
  });

  describe('CP-MAP-002: Nearby Users Refresh', () => {
    it('should populate nearby users on refresh', () => {
      const { result } = renderHook(() => useSignalStore());
      
      act(() => {
        result.current.refreshNearbyUsers(48.8566, 2.3522);
      });
      
      expect(result.current.nearbyUsers.length).toBeGreaterThan(0);
    });

    it('should calculate distances for nearby users', () => {
      const { result } = renderHook(() => useSignalStore());
      
      act(() => {
        result.current.refreshNearbyUsers(48.8566, 2.3522);
      });
      
      result.current.nearbyUsers.forEach(user => {
        expect(typeof user.distance).toBe('number');
        expect(user.distance).toBeGreaterThanOrEqual(0);
      });
    });

    it('should sort users by distance', () => {
      const { result } = renderHook(() => useSignalStore());
      
      act(() => {
        result.current.refreshNearbyUsers(48.8566, 2.3522);
      });
      
      const distances = result.current.nearbyUsers.map(u => u.distance || 0);
      
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    });
  });

  describe('CP-MAP-003: Distance Updates', () => {
    it('should update distances when user moves', () => {
      const { result } = renderHook(() => useSignalStore());
      
      // Initial position
      act(() => {
        result.current.refreshNearbyUsers(48.8566, 2.3522);
      });
      
      const initialDistances = result.current.nearbyUsers.map(u => u.distance);
      
      // Move user
      act(() => {
        result.current.updateDistances(48.8600, 2.3600);
      });
      
      const updatedDistances = result.current.nearbyUsers.map(u => u.distance);
      
      // Distances should have changed
      expect(updatedDistances).not.toEqual(initialDistances);
    });
  });
});

// =============================================================================
// SUITE 4: Integration Tests
// =============================================================================
describe('E2E Complete User Journey', () => {
  describe('CP-JOURNEY-001: Full Signup to Signal Flow', () => {
    it('should validate a complete valid signup payload', () => {
      const signupData = {
        email: 'newuser@university.edu',
        password: 'SecureP@ss1',
        firstName: 'Alice',
      };
      
      const emailResult = emailSchema.safeParse(signupData.email);
      const passwordResult = passwordSchema.safeParse(signupData.password);
      const nameResult = firstNameSchema.safeParse(signupData.firstName);
      
      expect(emailResult.success).toBe(true);
      expect(passwordResult.success).toBe(true);
      expect(nameResult.success).toBe(true);
    });

    it('should handle signup with sanitized inputs', () => {
      const rawInput = '  Alice  ';
      const sanitized = sanitizeInput(rawInput);
      
      const result = firstNameSchema.safeParse(sanitized);
      expect(result.success).toBe(true);
    });
  });

  describe('CP-JOURNEY-002: Signal Lifecycle', () => {
    it('should complete full signal lifecycle', () => {
      const { result } = renderHook(() => useSignalStore());
      
      // Step 1: Initial state
      expect(result.current.isActive).toBe(false);
      
      // Step 2: Activate
      act(() => {
        result.current.activateSignal('studying');
      });
      expect(result.current.isActive).toBe(true);
      expect(result.current.mySignal).toBe('green');
      
      // Step 3: Get nearby users
      act(() => {
        result.current.refreshNearbyUsers(48.8566, 2.3522);
      });
      expect(result.current.nearbyUsers.length).toBeGreaterThan(0);
      
      // Step 4: Get icebreaker
      const icebreaker = result.current.getIcebreaker('studying');
      expect(icebreaker.length).toBeGreaterThan(0);
      
      // Step 5: Deactivate
      act(() => {
        result.current.deactivateSignal();
      });
      expect(result.current.isActive).toBe(false);
      expect(result.current.mySignal).toBe('red');
    });
  });
});
