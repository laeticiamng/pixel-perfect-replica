import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .email({ message: "Email invalide" })
  .max(255, { message: "Email trop long (max 255 caractères)" });

export const passwordSchema = z
  .string()
  .min(6, { message: "Mot de passe trop court (min 6 caractères)" })
  .max(100, { message: "Mot de passe trop long (max 100 caractères)" })
  .regex(/[a-z]/, { message: "Doit contenir au moins une minuscule" })
  .regex(/[A-Z]/, { message: "Doit contenir au moins une majuscule" })
  .regex(/[0-9]/, { message: "Doit contenir au moins un chiffre" });

export const firstNameSchema = z
  .string()
  .trim()
  .min(1, { message: "Prénom requis" })
  .max(50, { message: "Prénom trop long (max 50 caractères)" })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Caractères invalides dans le prénom" });

export const universitySchema = z
  .string()
  .trim()
  .max(100, { message: "Nom d'université trop long" })
  .optional();

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }),
  password: z.string().min(4, { message: "Mot de passe requis" }),
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

  if (score <= 2) return { score, label: 'Faible', color: 'bg-signal-red' };
  if (score <= 4) return { score, label: 'Moyen', color: 'bg-signal-yellow' };
  return { score, label: 'Fort', color: 'bg-signal-green' };
}
