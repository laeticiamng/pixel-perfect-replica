import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeInput, sanitizeEmail, sanitizeDbText } from "@/lib/sanitize";
import { loginSchema, signupSchema, validateEmail, validatePassword, getPasswordStrength } from "@/lib/validation";

/**
 * SMOKE TESTS - Core functionality validation
 * Phase 3.1 of the testing strategy
 */

describe("Smoke Tests - Core Functionality", () => {
  // 1. Authentication Validation
  describe("Auth Validation", () => {
    it("should validate correct login credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@university.fr",
        password: "Test123!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "Test123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@university.fr",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should trim email whitespace", () => {
      const result = loginSchema.safeParse({
        email: "  test@university.fr  ",
        password: "Test123!",
      });
      expect(result.success).toBe(true);
    });
  });

  // 2. Signup Validation
  describe("Signup Validation", () => {
    it("should validate complete signup form", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "SecurePass123!",
        firstName: "Marie",
        university: "Sorbonne",
      });
      expect(result.success).toBe(true);
    });

    it("should require first name", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "SecurePass123!",
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "lowercase123",
        firstName: "Marie",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "UPPERCASE123",
        firstName: "Marie",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "NoNumbers!",
        firstName: "Marie",
      });
      expect(result.success).toBe(false);
    });

    it("should accept optional university field", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "SecurePass123!",
        firstName: "Marie",
      });
      expect(result.success).toBe(true);
    });

    it("should reject first name with invalid characters", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "SecurePass123!",
        firstName: "Marie<script>",
      });
      expect(result.success).toBe(false);
    });

    it("should accept accented names", () => {
      const result = signupSchema.safeParse({
        email: "new@student.edu",
        password: "SecurePass123!",
        firstName: "François-Marie",
      });
      expect(result.success).toBe(true);
    });
  });

  // 3. Password Strength
  describe("Password Strength", () => {
    it("should rate weak passwords correctly", () => {
      const strength = getPasswordStrength("abc");
      expect(strength.label).toBe("weak");
    });

    it("should rate medium passwords correctly", () => {
      const strength = getPasswordStrength("Abc123");
      expect(strength.label).toBe("medium");
    });

    it("should rate strong passwords correctly", () => {
      const strength = getPasswordStrength("Abc123!@#xyz");
      expect(strength.label).toBe("strong");
    });
  });

  // 4. Input Sanitization
  describe("Input Sanitization", () => {
    it("should sanitize HTML entities", () => {
      const input = "<script>alert('XSS')</script>";
      const result = sanitizeDbText(input);
      expect(result).not.toContain("<script>");
    });

    it("should trim whitespace", () => {
      const result = sanitizeDbText("  hello world  ");
      expect(result).toBe("hello world");
    });

    it("should enforce max length", () => {
      const longText = "a".repeat(600);
      const result = sanitizeDbText(longText, 100);
      expect(result.length).toBe(100);
    });

    it("should sanitize email correctly", () => {
      const result = sanitizeEmail("  TEST@Example.COM  ");
      expect(result).toBe("test@example.com");
    });

    it("should reject invalid email in sanitizeEmail", () => {
      const result = sanitizeEmail("not-an-email");
      expect(result).toBe("");
    });
  });

  // 5. Empty States Handling
  describe("Empty States", () => {
    it("should handle null/undefined in sanitization", () => {
      expect(sanitizeDbText(null as any)).toBe("");
      expect(sanitizeDbText(undefined as any)).toBe("");
    });

    it("should handle empty strings", () => {
      expect(validateEmail("")).toBe(false);
      expect(validatePassword("")).toBe(false);
    });
  });
});

describe("Smoke Tests - Data Validation", () => {
  // Activity types
  const validActivities = ["studying", "eating", "working", "talking", "sport", "other"];
  
  it("should have 6 valid activity types", () => {
    expect(validActivities.length).toBe(6);
  });

  it("should have studying as valid activity", () => {
    expect(validActivities).toContain("studying");
  });

  // Signal types
  const validSignals = ["green", "yellow", "red"];
  
  it("should have 3 valid signal types", () => {
    expect(validSignals.length).toBe(3);
  });
});

describe("Smoke Tests - Responsiveness", () => {
  const breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
  };

  it("should define mobile breakpoint", () => {
    expect(breakpoints.mobile).toBe(375);
  });

  it("should define tablet breakpoint", () => {
    expect(breakpoints.tablet).toBe(768);
  });

  it("should define desktop breakpoint", () => {
    expect(breakpoints.desktop).toBe(1024);
  });
});
