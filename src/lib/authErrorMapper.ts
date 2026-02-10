const PWNED_PATTERNS = ['pwned', 'have i been pwned', 'breach', 'compromised'];
const WEAK_PATTERNS = ['weak_password', 'password strength', 'password does not meet', 'password should'];

const includesPattern = (value: string, patterns: string[]) => {
  const lower = value.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
};

export const isPwnedPasswordError = (message: string) => includesPattern(message, PWNED_PATTERNS);
export const isWeakPasswordError = (message: string) => includesPattern(message, WEAK_PATTERNS);

type TranslateFn = (key: string, replacements?: Record<string, string | number>) => string;

export function getPasswordPolicyErrorMessage(message: string, t: TranslateFn): string {
  if (isPwnedPasswordError(message)) {
    return t('auth.pwnedPassword');
  }

  if (isWeakPasswordError(message)) {
    return [
      t('auth.weakPassword'),
      `• ${t('auth.passwordRequirementMin')}`,
      `• ${t('auth.passwordRequirementLower')}`,
      `• ${t('auth.passwordRequirementUpper')}`,
      `• ${t('auth.passwordRequirementNumber')}`,
    ].join('\n');
  }

  return message;
}
