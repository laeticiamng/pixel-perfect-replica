/**
 * Input sanitization utilities using DOMPurify for robust XSS prevention
 */
import DOMPurify from 'dompurify';

// Sanitize text: strip all HTML tags, return plain text
export function sanitizeText(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Remove any HTML tags completely (alias for sanitizeText)
export function stripHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Sanitize for safe text input (trim, strip HTML, limit length)
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  let cleaned = stripHtml(input.trim());

  // Limit length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}

// Validate and sanitize email
export function sanitizeEmail(email: string): string {
  if (!email) return '';

  // Trim and lowercase
  const cleaned = email.trim().toLowerCase();

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return '';
  }

  return cleaned;
}

// Sanitize URL (only allow http/https, block data: and javascript: URIs)
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Block dangerous protocols
  const lower = trimmed.toLowerCase().replace(/\s/g, '');
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:')
  ) {
    return '';
  }

  // Only allow http and https protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      // Re-check protocol after parsing (prevents bypass via URL parsing quirks)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  return '';
}

// Sanitize for database text fields
export function sanitizeDbText(input: string, maxLength: number = 500): string {
  if (!input) return '';

  // Strip HTML, trim, and limit length
  let cleaned = stripHtml(input.trim());

  // Remove any null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Limit length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}

// Sanitize HTML - allow safe subset of HTML tags via DOMPurify
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input);
}

// Escape string for use in URLs
export function escapeForUrl(input: string): string {
  if (!input) return '';
  return encodeURIComponent(input);
}
