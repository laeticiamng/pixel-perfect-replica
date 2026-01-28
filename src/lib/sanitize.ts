/**
 * Input sanitization utilities for XSS prevention
 */

// Basic HTML entity encoding to prevent XSS
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Remove any HTML tags completely
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
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

// Sanitize URL (only allow http/https)
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Only allow http and https protocols
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
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

// Sanitize HTML - escape all HTML entities
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/=/g, '&#x3D;')
    .replace(/`/g, '&#x60;');
}

// Escape string for use in URLs
export function escapeForUrl(input: string): string {
  if (!input) return '';
  return encodeURIComponent(input);
}
