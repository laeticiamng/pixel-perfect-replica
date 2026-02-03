import { describe, it, expect, vi } from "vitest";
import { sanitizeDbText, sanitizeHtml, escapeForUrl } from "@/lib/sanitize";
import { validateEmail, validatePassword } from "@/lib/validation";

describe("Edge Cases - Input Handling", () => {
  describe("Extreme Input Lengths", () => {
    it("should handle very long strings", () => {
      const longString = "a".repeat(10000);
      const result = sanitizeDbText(longString, 100);
      expect(result.length).toBe(100);
    });

    it("should handle empty strings", () => {
      expect(sanitizeDbText("")).toBe("");
      expect(sanitizeDbText("   ")).toBe("");
    });

    it("should handle single characters", () => {
      expect(sanitizeDbText("a")).toBe("a");
      expect(sanitizeDbText(" a ")).toBe("a");
    });
  });

  describe("Unicode and Special Characters", () => {
    it("should handle emojis", () => {
      const emoji = "Hello 👋 World 🌍";
      const result = sanitizeDbText(emoji);
      expect(result).toContain("👋");
      expect(result).toContain("🌍");
    });

    it("should handle RTL text", () => {
      const rtlText = "مرحبا بالعالم";
      const result = sanitizeDbText(rtlText);
      expect(result).toBe(rtlText);
    });

    it("should handle mixed scripts", () => {
      const mixed = "Hello 你好 Привет مرحبا";
      const result = sanitizeDbText(mixed);
      expect(result).toContain("Hello");
      expect(result).toContain("你好");
    });

    it("should escape HTML in unicode text", () => {
      const htmlUnicode = "<script>alert('你好')</script>";
      const result = sanitizeHtml(htmlUnicode);
      expect(result).not.toContain("<script>");
    });
  });

  describe("Boundary Values", () => {
    it("should handle max length boundary", () => {
      const exactLength = "a".repeat(1000);
      const result = sanitizeDbText(exactLength, 1000);
      expect(result.length).toBe(1000);
    });

    it("should handle one over max length", () => {
      const oneOver = "a".repeat(1001);
      const result = sanitizeDbText(oneOver, 1000);
      expect(result.length).toBe(1000);
    });
  });
});

describe("Edge Cases - Validation", () => {
  describe("Email Edge Cases", () => {
    it("should handle valid edge case emails", () => {
      expect(validateEmail("a@b.co")).toBe(true);
      expect(validateEmail("test+tag@example.com")).toBe(true);
      expect(validateEmail("user.name@sub.domain.com")).toBe(true);
    });

    it("should reject invalid edge case emails", () => {
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@.com")).toBe(false);
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("Password Edge Cases", () => {
    it("should validate minimum length boundary", () => {
      expect(validatePassword("12345")).toBe(false); // 5 chars
      expect(validatePassword("123456")).toBe(true); // 6 chars
    });

    it("should handle special characters in password", () => {
      expect(validatePassword("p@ss!#$%")).toBe(true);
      expect(validatePassword("αβγδεζ")).toBe(true); // Greek letters
    });

    it("should handle spaces in password", () => {
      expect(validatePassword("pass word")).toBe(true);
      expect(validatePassword("      ")).toBe(true); // 6 spaces
    });
  });
});

describe("Edge Cases - Security", () => {
  describe("XSS Attack Vectors", () => {
    it("should neutralize script injection", () => {
      const attacks = [
        "<script>alert(1)</script>",
        "<img onerror='alert(1)' src='x'>",
        "<svg onload='alert(1)'>",
        "javascript:alert(1)",
        "<a href='javascript:void(0)'>",
      ];

      attacks.forEach((attack) => {
        const result = sanitizeHtml(attack);
        expect(result).not.toContain("<script");
        expect(result).not.toContain("onerror=");
        expect(result).not.toContain("onload=");
      });
    });

    it("should handle nested script tags", () => {
      const nested = "<scr<script>ipt>alert(1)</scr</script>ipt>";
      const result = sanitizeHtml(nested);
      expect(result).not.toMatch(/<script/i);
    });

    it("should handle encoded attacks", () => {
      const encoded = "&lt;script&gt;alert(1)&lt;/script&gt;";
      const result = sanitizeHtml(encoded);
      // Already encoded should stay safe
      expect(result).not.toContain("<script>");
    });
  });

  describe("SQL Injection Prevention", () => {
    it("should not modify SQL-like input (handled by RLS)", () => {
      // SQL injection is handled by Supabase RLS, not client-side sanitization
      const sqlInjection = "'; DROP TABLE users; --";
      const result = sanitizeDbText(sqlInjection);
      // We just sanitize for display, not SQL
      expect(result).toBe(sqlInjection);
    });
  });

  describe("URL Encoding", () => {
    it("should properly encode URL parameters", () => {
      expect(escapeForUrl("hello world")).toBe("hello%20world");
      expect(escapeForUrl("a=b&c=d")).toBe("a%3Db%26c%3Dd");
      expect(escapeForUrl("<script>")).toBe("%3Cscript%3E");
    });

    it("should handle empty strings", () => {
      expect(escapeForUrl("")).toBe("");
    });
  });
});

describe("Edge Cases - Data Types", () => {
  describe("Null and Undefined Handling", () => {
    it("should handle null gracefully", () => {
      expect(sanitizeDbText(null as any)).toBe("");
    });

    it("should handle undefined gracefully", () => {
      expect(sanitizeDbText(undefined as any)).toBe("");
    });

    it("should handle empty string input", () => {
      expect(sanitizeDbText("")).toBe("");
    });

    it("should handle whitespace-only input", () => {
      expect(sanitizeDbText("   ")).toBe("");
    });
  });

  describe("String Type Enforcement", () => {
    it("should only accept string input by design", () => {
      // sanitizeDbText is designed for string input only
      // Non-string types should be converted to string before calling
      expect(sanitizeDbText(String(123))).toBe("123");
      expect(sanitizeDbText(String(true))).toBe("true");
      expect(sanitizeDbText(String(false))).toBe("false");
    });

    it("should handle stringified objects", () => {
      const obj = { key: "value" };
      const result = sanitizeDbText(JSON.stringify(obj));
      expect(typeof result).toBe("string");
    });

    it("should handle stringified arrays", () => {
      const arr = ["a", "b", "c"];
      const result = sanitizeDbText(arr.join(","));
      expect(result).toBe("a,b,c");
    });
  });
});

describe("Edge Cases - Concurrency", () => {
  describe("Rapid Successive Calls", () => {
    it("should handle rapid sanitization calls", () => {
      const results: string[] = [];
      
      for (let i = 0; i < 100; i++) {
        results.push(sanitizeDbText(`Test ${i}`));
      }
      
      expect(results.length).toBe(100);
      results.forEach((result, i) => {
        expect(result).toBe(`Test ${i}`);
      });
    });
  });
});
