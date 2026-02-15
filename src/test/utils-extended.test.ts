import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeInput,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeDbText,
  sanitizeHtml,
  escapeForUrl,
} from '@/lib/sanitize';
import {
  calculateDistance,
  getDistanceBetweenPoints,
  formatDistance,
} from '@/utils/distance';
import {
  emailSchema,
  passwordSchema,
  firstNameSchema,
  loginSchema,
  registerSchema,
  getPasswordStrength,
  validateEmail,
  validatePassword,
} from '@/lib/validation';

// ---------------------------------------------------------------------------
// Sanitization — DOMPurify edge cases
// ---------------------------------------------------------------------------
describe('Sanitization — XSS edge cases', () => {
  it('should strip SVG-based XSS', () => {
    const input = '<svg onload="alert(1)"><circle r="50"/></svg>';
    const result = sanitizeText(input);
    expect(result).not.toContain('onload');
    expect(result).not.toContain('<svg');
  });

  it('should strip event handler attributes', () => {
    expect(sanitizeText('<img onerror="alert(1)" src=x>')).not.toContain('onerror');
    expect(sanitizeText('<div onmouseover="steal()">Hi</div>')).not.toContain('onmouseover');
  });

  it('should strip data: URIs in sanitizeUrl', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(sanitizeUrl('DATA:text/html,test')).toBe('');
  });

  it('should strip javascript: with unicode escapes', () => {
    expect(sanitizeUrl('java\tscript:alert(1)')).toBe('');
    expect(sanitizeUrl('  javascript:alert(1)')).toBe('');
  });

  it('should handle vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:MsgBox("XSS")')).toBe('');
  });

  it('should strip nested HTML injection in sanitizeInput', () => {
    expect(sanitizeInput('Hello <b>World</b> <script>evil()</script>!')).toBe('Hello World !');
  });

  it('sanitizeHtml should keep safe tags but strip scripts', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert(1)</script>');
    expect(result).toContain('<p>Hello</p>');
    expect(result).not.toContain('<script>');
  });

  it('sanitizeDbText should remove null bytes', () => {
    expect(sanitizeDbText('hello\0world')).toBe('helloworld');
  });

  it('escapeForUrl should encode angle brackets', () => {
    expect(escapeForUrl('<script>')).toBe('%3Cscript%3E');
  });
});

// ---------------------------------------------------------------------------
// Haversine — edge cases
// ---------------------------------------------------------------------------
describe('Haversine — edge cases', () => {
  it('same point returns 0', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
    expect(calculateDistance(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it('antipodal points should be ~20 000 km (half Earth circumference)', () => {
    // North pole to South pole
    const d = calculateDistance(90, 0, -90, 0);
    expect(d).toBeGreaterThan(19_900_000);
    expect(d).toBeLessThan(20_100_000);
  });

  it('equator — 1 degree longitude ≈ 111 km', () => {
    const d = calculateDistance(0, 0, 0, 1);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it('crossing international date line', () => {
    // 179°E to 179°W should be ~2° ≈ 222 km at equator
    const d = calculateDistance(0, 179, 0, -179);
    expect(d).toBeGreaterThan(220_000);
    expect(d).toBeLessThan(224_000);
  });

  it('getDistanceBetweenPoints returns unrounded value', () => {
    const d = getDistanceBetweenPoints(
      { latitude: 48.8566, longitude: 2.3522 },
      { latitude: 48.8576, longitude: 2.3522 },
    );
    // Should be a floating point number, not rounded
    expect(d).not.toBe(Math.round(d));
  });

  it('formatDistance handles edge case of exactly 1000m', () => {
    expect(formatDistance(1000)).toBe('1.0km');
  });

  it('formatDistance handles 0m', () => {
    expect(formatDistance(0)).toBe('0m');
  });
});

// ---------------------------------------------------------------------------
// Validation schemas — i18n-powered messages
// ---------------------------------------------------------------------------
describe('Validation schemas — i18n messages', () => {
  it('emailSchema rejects non-email and returns translated message', () => {
    const result = emailSchema.safeParse('not-an-email');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBeTruthy();
      expect(result.error.issues[0].message).not.toContain('invalide'); // not French-only anymore
    }
  });

  it('emailSchema rejects too-long emails', () => {
    const result = emailSchema.safeParse('a'.repeat(250) + '@x.com');
    expect(result.success).toBe(false);
  });

  it('passwordSchema rejects missing lowercase', () => {
    const result = passwordSchema.safeParse('PASSWORD1');
    expect(result.success).toBe(false);
  });

  it('passwordSchema rejects missing uppercase', () => {
    const result = passwordSchema.safeParse('password1');
    expect(result.success).toBe(false);
  });

  it('passwordSchema rejects missing number', () => {
    const result = passwordSchema.safeParse('Password');
    expect(result.success).toBe(false);
  });

  it('passwordSchema rejects too short', () => {
    const result = passwordSchema.safeParse('Ab1');
    expect(result.success).toBe(false);
  });

  it('passwordSchema rejects too long', () => {
    const result = passwordSchema.safeParse('Ab1' + 'x'.repeat(100));
    expect(result.success).toBe(false);
  });

  it('passwordSchema accepts valid password', () => {
    expect(passwordSchema.safeParse('MyP4ssw0rd').success).toBe(true);
  });

  it('firstNameSchema rejects empty', () => {
    expect(firstNameSchema.safeParse('').success).toBe(false);
  });

  it('firstNameSchema rejects special chars', () => {
    expect(firstNameSchema.safeParse('John<script>').success).toBe(false);
  });

  it('firstNameSchema accepts accented names', () => {
    expect(firstNameSchema.safeParse('François').success).toBe(true);
    expect(firstNameSchema.safeParse("Marie-Claire d'Arc").success).toBe(true);
  });

  it('loginSchema rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'abc' });
    expect(result.success).toBe(false);
  });

  it('registerSchema accepts valid data', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'MyP4ssw0rd',
      firstName: 'Test',
    });
    expect(result.success).toBe(true);
  });

  it('getPasswordStrength returns correct labels', () => {
    expect(getPasswordStrength('ab').label).toBe('weak');
    expect(getPasswordStrength('Password').label).toBe('medium');
    expect(getPasswordStrength('P@ssw0rd123!').label).toBe('strong');
  });

  it('validateEmail helper works', () => {
    expect(validateEmail('a@b.com')).toBe(true);
    expect(validateEmail('not-email')).toBe(false);
  });

  it('validatePassword helper works', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
  });
});
