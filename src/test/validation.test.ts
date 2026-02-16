import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeText, stripHtml, sanitizeInput, sanitizeEmail, sanitizeUrl, sanitizeDbText } from '@/lib/sanitize';

describe('Sanitization utilities', () => {
  describe('sanitizeText', () => {
    it('should strip script tags and their content', () => {
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeText('')).toBe('');
    });

    it('should handle normal text', () => {
      expect(sanitizeText('Hello World')).toBe('Hello World');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('should handle nested tags', () => {
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML and trim', () => {
      expect(sanitizeInput('  <script>evil</script>Hello  ')).toBe('Hello');
    });

    it('should limit length', () => {
      const longInput = 'a'.repeat(2000);
      expect(sanitizeInput(longInput, 100).length).toBe(100);
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid emails', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
    });

    it('should lowercase emails', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
    });

    it('should accept http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should reject javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBe('');
    });
  });

  describe('sanitizeDbText', () => {
    it('should strip HTML and null bytes', () => {
      expect(sanitizeDbText('<script>test</script>\0evil')).toBe('evil');
    });

    it('should limit length', () => {
      const longText = 'a'.repeat(1000);
      expect(sanitizeDbText(longText, 500).length).toBe(500);
    });
  });
});

describe('Logger', () => {
  it('should be importable', async () => {
    const { logger } = await import('@/lib/logger');
    expect(logger).toBeDefined();
    expect(logger.auth).toBeDefined();
    expect(logger.api).toBeDefined();
    expect(logger.action).toBeDefined();
    expect(logger.ui).toBeDefined();
  });
});

describe('Validation schemas', () => {
  it('should validate email correctly', async () => {
    const { emailSchema } = await import('@/lib/validation');
    
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('').success).toBe(false);
  });

  it('should validate password correctly', async () => {
    const { passwordSchema } = await import('@/lib/validation');
    
    // Valid password (has lowercase, uppercase, number, 6+ chars)
    expect(passwordSchema.safeParse('Password1').success).toBe(true);
    
    // Too short
    expect(passwordSchema.safeParse('Pass1').success).toBe(false);
    
    // Missing uppercase
    expect(passwordSchema.safeParse('password1').success).toBe(false);
    
    // Missing number
    expect(passwordSchema.safeParse('Password').success).toBe(false);
  });

  it('should validate firstName correctly', async () => {
    const { firstNameSchema } = await import('@/lib/validation');
    
    expect(firstNameSchema.safeParse('Jean').success).toBe(true);
    expect(firstNameSchema.safeParse('Marie-Claire').success).toBe(true);
    expect(firstNameSchema.safeParse('François').success).toBe(true);
    expect(firstNameSchema.safeParse('').success).toBe(false);
  });

  it('should check password strength', async () => {
    const { getPasswordStrength } = await import('@/lib/validation');
    
    const weak = getPasswordStrength('abc');
    expect(weak.label).toBe('weak');
    
    const medium = getPasswordStrength('Password');
    expect(medium.label).toBe('medium');
    
    const strong = getPasswordStrength('Password123!');
    expect(strong.label).toBe('strong');
  });
});
