import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { translations } from '@/lib/i18n/translations';

// Helper: resolve translation key to French string
function getFrench(key: string): string {
  const keys = key.split('.');
  let current: any = translations;
  for (const k of keys) {
    if (!current) return key;
    current = current[k];
  }
  return current?.fr ?? key;
}

// Mock i18n to return French translations (tests were written with French UI)
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => getFrench(key),
    locale: 'fr',
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
    isEnglish: false,
    isFrench: true,
  }),
}));

// Mock framer-motion — Proxy returns a pass-through component for any motion.* tag
const motionProxy = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      // Return a simple pass-through component for any element name
      return ({ children, ...rest }: any) => {
        // Strip framer-motion specific props to avoid React warnings
        const { initial, animate, exit, variants, whileInView, viewport, transition, whileHover, whileTap, drag, style, ...htmlProps } = rest;
        const Tag = prop as any;
        return <Tag {...htmlProps} style={style}>{children}</Tag>;
      };
    },
  }
);

vi.mock('framer-motion', () => ({
  motion: motionProxy,
  useScroll: () => ({ scrollYProgress: { get: () => 0, current: 0, onChange: () => () => {} } }),
  useTransform: () => ({ get: () => 1, current: 1, onChange: () => () => {} }),
  useSpring: () => ({ get: () => 0, current: 0, onChange: () => () => {} }),
  useInView: () => true,
  useMotionValue: () => ({ get: () => 0, set: () => {}, current: 0, onChange: () => () => {} }),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  AnimatePresence: ({ children }: any) => children,
  MotionValue: class { get() { return 0; } },
  animate: vi.fn(() => ({ stop: vi.fn() })),
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    profile: null,
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render the main title', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getAllByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // The hero title may appear multiple times (desktop + mobile); just ensure it exists
    expect(getAllByText(/Vois qui est/).length).toBeGreaterThan(0);
  });

  it('should render the badge', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // The badge / subheading text — verify key concept is present
    expect(container.textContent).toContain("spontanément IRL");
  });

  it('should render the problem statement', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(container.textContent).toContain("NEARVITY");
  });

  it('should render the signal section', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(container.textContent).toContain("signal");
  });

  it('should render feature cards', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(container.textContent).toContain("solitude");
  });

  it('should render the comparison section', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Comparison section verbiage — "Nos engagements" heading
    expect(container.textContent).toContain("Nos engagements");
  });

  it('should render use cases', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // At least one use-case location should be visible
    const text = container.textContent || '';
    const hasUseCase = ['Bibliothèque', 'Salle de sport', 'Café', 'Coworking'].some(
      loc => text.includes(loc)
    );
    expect(hasUseCase).toBe(true);
  });

  it('should render the CTA buttons', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // CTA text should be present somewhere in the page
    const text = container.textContent || '';
    expect(text).toContain("compte");
  });

  it('should render final CTA', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { container } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const text = container.textContent || '';
    const hasCta = text.includes('Commencer') || text.includes('gratuit');
    expect(hasCta).toBe(true);
  });

  it('should render footer with links', async () => {
    const { default: LandingPage } = await import('@/pages/LandingPage');
    const { getAllByText } = render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(getAllByText('NEARVITY').length).toBeGreaterThan(0);
  });
});
