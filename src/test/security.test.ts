import { describe, it, expect, vi } from "vitest";
import { sanitizeDbText, sanitizeHtml, escapeForUrl } from "@/lib/sanitize";
import { loginSchema, signupSchema, validateEmail, validatePassword } from "@/lib/validation";

describe("Security - Input Sanitization", () => {
  describe("sanitizeDbText", () => {
    it("should trim whitespace", () => {
      expect(sanitizeDbText("  hello  ")).toBe("hello");
    });

    it("should enforce max length", () => {
      const longText = "a".repeat(200);
      expect(sanitizeDbText(longText, 100).length).toBe(100);
    });

    it("should handle empty strings", () => {
      expect(sanitizeDbText("")).toBe("");
      expect(sanitizeDbText("   ")).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      expect(sanitizeDbText(null as any)).toBe("");
      expect(sanitizeDbText(undefined as any)).toBe("");
    });
  });

  describe("sanitizeHtml", () => {
    it("should escape HTML tags", () => {
      expect(sanitizeHtml("<script>alert('xss')</script>")).not.toContain("<script>");
    });

    it("should preserve safe HTML elements", () => {
      const result = sanitizeHtml("<div class=\"test\">&amp;</div>");
      expect(result).toContain("<div");
      expect(result).toContain("&amp;");
    });
  });

  describe("escapeForUrl", () => {
    it("should encode special URL characters", () => {
      expect(escapeForUrl("hello world")).toBe("hello%20world");
      expect(escapeForUrl("test&param=value")).toBe("test%26param%3Dvalue");
    });
  });
});

describe("Security - Input Validation", () => {
  describe("loginSchema", () => {
    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("signupSchema", () => {
    it("should require first name", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "Password123",
        firstName: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject too long first name", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "Password123",
        firstName: "a".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validateEmail", () => {
    it("should validate correct emails", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("user.name@example.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should require minimum length", () => {
      expect(validatePassword("12345")).toBe(false);
      expect(validatePassword("123456")).toBe(true);
    });
  });
});

describe("Security - XSS Prevention", () => {
  it("should strip script tags entirely to prevent XSS", () => {
    const maliciousInput = "<script>alert('xss')</script>";
    const sanitized = sanitizeHtml(maliciousInput);
    // DOMPurify removes script tags and their content entirely
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert");
    expect(sanitized).toBe("");
  });

  it("should strip dangerous attributes from elements", () => {
    const maliciousInput = "<img onerror='alert(1)' src='x'>";
    const sanitized = sanitizeHtml(maliciousInput);
    // DOMPurify keeps the img tag but removes the dangerous onerror attribute
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).toContain("<img");
  });
});
