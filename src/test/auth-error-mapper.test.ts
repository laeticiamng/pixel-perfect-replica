import { describe, expect, it } from 'vitest';
import { getPasswordPolicyErrorMessage, isPwnedPasswordError, isWeakPasswordError } from '@/lib/authErrorMapper';

const t = (key: string) => key;

describe('authErrorMapper', () => {
  it('detects pwned password errors and maps to pwned message', () => {
    const message = 'Password rejected: found in Have I Been Pwned breach corpus';
    expect(isPwnedPasswordError(message)).toBe(true);
    expect(getPasswordPolicyErrorMessage(message, t)).toBe('auth.pwnedPassword');
  });

  it('detects weak_password errors and returns requirements list', () => {
    const message = 'weak_password: password does not meet complexity';
    expect(isWeakPasswordError(message)).toBe(true);
    const normalized = getPasswordPolicyErrorMessage(message, t);
    expect(normalized).toContain('auth.weakPassword');
    expect(normalized).toContain('auth.passwordRequirementUpper');
    expect(normalized).toContain('auth.passwordRequirementNumber');
  });
});
