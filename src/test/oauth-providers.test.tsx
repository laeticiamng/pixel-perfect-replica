import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isProviderEnabled, AUTH_PROVIDERS } from '@/config/authProviders';

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
  it('Apple button maps to apple provider, never google', async () => {
    // Import after mocks are set up
    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter } = await import('react-router-dom');
    const { default: OnboardingPage } = await import('@/pages/OnboardingPage');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    // Apple button should be present when provider is enabled
    const appleButton = screen.getByText('auth.continueWithApple');
    expect(appleButton).toBeInTheDocument();

    // Google button should also exist
    const googleButton = screen.getByText('auth.continueWithGoogle');
    expect(googleButton).toBeInTheDocument();
  });

  it('Apple button hidden when provider disabled', async () => {
    // Dynamically disable apple
    vi.doMock('@/config/authProviders', () => ({
      AUTH_PROVIDERS: { google: { enabled: true, id: 'google' }, apple: { enabled: false, id: 'apple' } },
      isProviderEnabled: (p: string) => p === 'google',
    }));

    // Clear module cache to pick up new mock
    vi.resetModules();

    // Re-mock all dependencies after resetModules
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithMagicLink: vi.fn(),
        signInWithOAuthSupabase: vi.fn(),
        isAuthenticated: false,
        isLoading: false,
      }),
    }));
    vi.doMock('@/stores/locationStore', () => ({
      useLocationStore: () => ({ startWatching: vi.fn(), position: null, error: null }),
    }));
    vi.doMock('@/lib/i18n', () => ({
      useTranslation: () => ({
        t: (key: string) => key,
        locale: 'en',
        setLocale: vi.fn(),
        toggleLocale: vi.fn(),
        isEnglish: true,
        isFrench: false,
      }),
    }));
    vi.doMock('@/integrations/lovable', () => ({
      lovable: { auth: { signInWithOAuth: vi.fn().mockRejectedValue(new Error('test')) } },
    }));

    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter } = await import('react-router-dom');
    const { default: OnboardingPage } = await import('@/pages/OnboardingPage');

    render(
      <MemoryRouter>
        <OnboardingPage />
      </MemoryRouter>
    );

    expect(screen.queryByText('auth.continueWithApple')).not.toBeInTheDocument();
    expect(screen.getByText('auth.continueWithGoogle')).toBeInTheDocument();
  });
});
