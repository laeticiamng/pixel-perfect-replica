import { z } from 'zod';
import { translations, getCurrentLocale } from '@/lib/i18n/translations';

// Helper to get translated validation message at runtime
function tv(key: keyof typeof translations.validation): string {
  const locale = getCurrentLocale();
  return translations.validation[key][locale];
}

export const emailSchema = z
  .string()
  .trim()
  .email({ message: tv('emailInvalid') })
  .max(255, { message: tv('emailTooLong') });

export const passwordSchema = z
  .string()
  .min(6, { message: tv('passwordTooShort') })
  .max(100, { message: tv('passwordTooLong') })
  .regex(/[a-z]/, { message: tv('passwordNeedsLower') })
  .regex(/[A-Z]/, { message: tv('passwordNeedsUpper') })
  .regex(/[0-9]/, { message: tv('passwordNeedsNumber') });

export const firstNameSchema = z
  .string()
  .trim()
  .min(1, { message: tv('firstNameRequired') })
  .max(50, { message: tv('firstNameTooLong') })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: tv('firstNameInvalidChars') });

export const universitySchema = z
  .string()
  .trim()
  .max(100, { message: tv('universityTooLong') })
  .optional();

export const loginSchema = z.object({
  email: z.string().trim().email({ message: tv('emailInvalid') }),
  password: z.string().min(6, { message: tv('passwordRequired') }),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: firstNameSchema,
  university: universitySchema,
});

export const profileUpdateSchema = z.object({
  firstName: firstNameSchema,
  university: universitySchema,
});

// Password strength checker
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: tv('weak'), color: 'bg-signal-red' };
  if (score <= 4) return { score, label: tv('medium'), color: 'bg-signal-yellow' };
  return { score, label: tv('strong'), color: 'bg-signal-green' };
}

// Alias for signupSchema
export const signupSchema = registerSchema;

// Email validation helper
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Password validation helper
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}
