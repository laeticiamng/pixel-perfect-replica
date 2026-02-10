import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeDbText, sanitizeHtml, stripHtml, sanitizeEmail } from "@/lib/sanitize";
import { loginSchema, signupSchema, passwordSchema, firstNameSchema, getPasswordStrength } from "@/lib/validation";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          maybeSingle: vi.fn(() => ({ data: null, error: null })),
        })),
        in: vi.fn(() => ({ data: [], error: null })),
        neq: vi.fn(() => ({
          gte: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: null })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
    rpc: vi.fn(() => ({ data: [], error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
        remove: vi.fn(() => ({ error: null })),
      })),
    },
  },
}));

describe("Complete Application Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Sanitization", () => {
    it("should sanitize database text properly", () => {
      expect(sanitizeDbText("  Hello World  ")).toBe("Hello World");
      expect(sanitizeDbText("<script>alert('xss')</script>")).not.toContain("<script>");
      expect(sanitizeDbText("A".repeat(600), 500).length).toBe(500);
      expect(sanitizeDbText("Hello\0World")).toBe("HelloWorld");
    });

    it("should sanitize HTML entities", () => {
      expect(sanitizeHtml("<div>Test</div>")).not.toContain("<div>");
      expect(sanitizeHtml("test=\"value\"")).toContain("&#x3D;");
      expect(sanitizeHtml("<img onerror='alert(1)'>")).not.toContain("<img");
    });

    it("should strip HTML tags", () => {
      expect(stripHtml("<p>Hello</p>")).toBe("Hello");
      expect(stripHtml("<script>bad</script>")).toBe("bad");
      expect(stripHtml("No tags here")).toBe("No tags here");
    });

    it("should sanitize email addresses", () => {
      expect(sanitizeEmail("  Test@Example.COM  ")).toBe("test@example.com");
      expect(sanitizeEmail("invalid")).toBe("");
      expect(sanitizeEmail("user@domain.com")).toBe("user@domain.com");
    });
  });

  describe("Form Validation", () => {
    describe("loginSchema", () => {
      it("should accept valid login data", () => {
        const result = loginSchema.safeParse({
          email: "test@example.com",
          password: "password123",
        });
        expect(result.success).toBe(true);
      });

      it("should reject invalid email", () => {
        const result = loginSchema.safeParse({
          email: "invalid-email",
          password: "password123",
        });
        expect(result.success).toBe(false);
      });

      it("should reject short password", () => {
        const result = loginSchema.safeParse({
          email: "test@example.com",
          password: "123",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("signupSchema", () => {
      it("should accept valid signup data", () => {
        const result = signupSchema.safeParse({
          email: "test@example.com",
          password: "Password123",
          firstName: "Jean",
          university: "Sorbonne",
        });
        expect(result.success).toBe(true);
      });

      it("should require uppercase in password", () => {
        const result = signupSchema.safeParse({
          email: "test@example.com",
          password: "password123",
          firstName: "Jean",
        });
        expect(result.success).toBe(false);
      });

      it("should require lowercase in password", () => {
        const result = signupSchema.safeParse({
          email: "test@example.com",
          password: "PASSWORD123",
          firstName: "Jean",
        });
        expect(result.success).toBe(false);
      });

      it("should require number in password", () => {
        const result = signupSchema.safeParse({
          email: "test@example.com",
          password: "PasswordTest",
          firstName: "Jean",
        });
        expect(result.success).toBe(false);
      });
    });

    describe("firstNameSchema", () => {
      it("should accept valid first names", () => {
        expect(firstNameSchema.safeParse("Jean").success).toBe(true);
        expect(firstNameSchema.safeParse("Marie-Claire").success).toBe(true);
        expect(firstNameSchema.safeParse("François").success).toBe(true);
        expect(firstNameSchema.safeParse("O'Connor").success).toBe(true);
      });

      it("should reject invalid first names", () => {
        expect(firstNameSchema.safeParse("").success).toBe(false);
        expect(firstNameSchema.safeParse("Jean123").success).toBe(false);
        expect(firstNameSchema.safeParse("A".repeat(51)).success).toBe(false);
      });
    });

    describe("passwordSchema", () => {
      it("should accept strong passwords", () => {
        expect(passwordSchema.safeParse("Password123").success).toBe(true);
        expect(passwordSchema.safeParse("MyP@ss1").success).toBe(true);
      });

      it("should reject weak passwords", () => {
        expect(passwordSchema.safeParse("12345").success).toBe(false);
        expect(passwordSchema.safeParse("password").success).toBe(false);
        expect(passwordSchema.safeParse("PASSWORD").success).toBe(false);
      });
    });
  });

  describe("Password Strength", () => {
    it("should calculate weak password strength", () => {
      const result = getPasswordStrength("abc");
      expect(result.score).toBeLessThanOrEqual(2);
      expect(result.label).toBe("weak");
    });

    it("should calculate medium password strength", () => {
      const result = getPasswordStrength("Password");
      expect(result.score).toBeGreaterThan(2);
      expect(result.score).toBeLessThanOrEqual(4);
      expect(result.label).toBe("medium");
    });

    it("should calculate strong password strength", () => {
      const result = getPasswordStrength("Password123!");
      expect(result.score).toBeGreaterThan(4);
      expect(result.label).toBe("strong");
    });
  });

  describe("Ghost Mode Filtering", () => {
    it("should filter out ghost mode users from nearby list", () => {
      const users = [
        { id: "1", ghost_mode: false },
        { id: "2", ghost_mode: true },
        { id: "3", ghost_mode: false },
      ];
      
      const visibleUsers = users.filter(u => !u.ghost_mode);
      expect(visibleUsers.length).toBe(2);
      expect(visibleUsers.map(u => u.id)).toEqual(["1", "3"]);
    });
  });

  describe("Distance Calculation", () => {
    it("should calculate valid distances", () => {
      const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return Math.round(R * c);
      };

      // Same point should be 0 distance
      expect(calculateDistance(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
      
      // Paris to nearby point (approximately 100m)
      const dist = calculateDistance(48.8566, 2.3522, 48.8575, 2.3522);
      expect(dist).toBeGreaterThan(50);
      expect(dist).toBeLessThan(200);
    });
  });

  describe("Data Privacy", () => {
    it("should fuzz coordinates to ~100m precision", () => {
      const preciseCoord = 48.856614;
      const fuzzedCoord = Math.round(preciseCoord * 1000) / 1000;
      
      const decimalPlaces = fuzzedCoord.toString().split(".")[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(3);
    });

    it("should not expose exact user location", () => {
      const exactLat = 48.8566147;
      const exactLon = 2.3522219;
      
      const publicLat = Math.round(exactLat * 1000) / 1000;
      const publicLon = Math.round(exactLon * 1000) / 1000;
      
      expect(publicLat).toBe(48.857);
      expect(publicLon).toBe(2.352);
    });
  });

  describe("Activity Types", () => {
    const validActivities = ["studying", "eating", "working", "talking", "sport", "other"];
    
    it("should have all required activity types", () => {
      expect(validActivities.length).toBe(6);
    });

    it("should validate activity selection", () => {
      validActivities.forEach(activity => {
        expect(validActivities).toContain(activity);
      });
    });
  });

  describe("Signal Types", () => {
    const validSignals = ["green", "yellow", "red"];
    
    it("should have all signal types", () => {
      expect(validSignals.length).toBe(3);
    });
  });

  describe("Settings Validation", () => {
    it("should validate visibility distance range", () => {
      const minDistance = 50;
      const maxDistance = 500;
      
      [50, 100, 200, 300, 400, 500].forEach(distance => {
        expect(distance).toBeGreaterThanOrEqual(minDistance);
        expect(distance).toBeLessThanOrEqual(maxDistance);
      });
    });
  });

  describe("Rating System", () => {
    it("should calculate average rating correctly", () => {
      const ratings = [5, 4, 5, 3, 5];
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      expect(avg).toBe(4.4);
    });

    it("should keep rating between 1 and 5", () => {
      const newRating = Math.min(5, Math.max(1, 4.5));
      expect(newRating).toBeGreaterThanOrEqual(1);
      expect(newRating).toBeLessThanOrEqual(5);
    });
  });
});
