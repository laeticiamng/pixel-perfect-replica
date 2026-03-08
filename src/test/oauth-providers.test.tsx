import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { isProviderEnabled } from '@/config/authProviders';

// Mock modules
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signInWithOAuthSupabase: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock('@/stores/locationStore', () => ({
  useLocationStore: () => ({
    startWatching: vi.fn(),
    position: null,
    error: null,
  }),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'en',
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
    isEnglish: true,
    isFrench: false,
  }),
}));

vi.mock('@/integrations/lovable', () => ({
  lovable: {
    auth: {
      signInWithOAuth: vi.fn().mockRejectedValue(new Error('test')),
    },
  },
}));

describe('Auth providers config', () => {
  it('returns true for enabled providers', () => {
    expect(isProviderEnabled('google')).toBe(true);
    expect(isProviderEnabled('apple')).toBe(true);
  });

  it('returns false for unknown providers', () => {
    // @ts-expect-error testing invalid provider
    expect(isProviderEnabled('github')).toBe(false);
  });
});

describe('OAuth button rendering', () => {
  it('Apple button maps to apple provider and is present when enabled', async () => {
    const { default: OnboardingPage } = await import('@/pages/OnboardingPage');

    const { getByText } = render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(getByText('auth.continueWithApple')).toBeInTheDocument();
    expect(getByText('auth.continueWithGoogle')).toBeInTheDocument();
  });
});
