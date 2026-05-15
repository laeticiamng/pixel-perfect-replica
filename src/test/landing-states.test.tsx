/**
 * Landing-page a11y across auth/loading states.
 *
 * Re-runs the same axe rules + tab-traversal contract on three orthogonal
 * snapshots of the landing:
 *   - anonymous (default — stays on the landing)
 *   - loading  (auth bootstrap in flight — must not break tab order)
 *   - authenticated (would redirect in production; we assert axe still
 *     passes on whatever paints during the redirect tick, because users
 *     with motion-disabled / slow networks will see this frame)
 *
 * Color-contrast is offloaded to the Playwright runtime suite; jsdom can't
 * compute pixel luminance.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axe from 'axe-core';
import { translations } from '@/lib/i18n/translations';

// ---- i18n mock ------------------------------------------------------------
function getFrench(key: string): string {
  const keys = key.split('.');
  let current: any = translations;
  for (const k of keys) {
    if (!current) return key;
    current = current[k];
  }
  return current?.fr ?? key;
}
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

// ---- framer-motion mock (same as landing-a11y suite) ---------------------
const motionProxy = new Proxy(
  {},
  {
    get: (_t, prop: string) => ({ children, ...rest }: any) => {
      const {
        initial, animate, exit, variants, whileInView, viewport, transition,
        whileHover, whileTap, drag, style, layout, layoutId, ...htmlProps
      } = rest;
      const Tag = prop as any;
      return <Tag {...htmlProps} style={style}>{children}</Tag>;
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
  MotionConfig: ({ children }: any) => children,
  MotionConfigContext: { Provider: ({ children }: any) => children },
}));

// ---- Auth mock: configurable per-state ------------------------------------
type AuthState = 'anonymous' | 'loading' | 'authenticated';
let authState: AuthState = 'anonymous';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => {
    switch (authState) {
      case 'authenticated':
        return {
          isAuthenticated: true, isLoading: false,
          user: { id: 'u1', email: 't@t.fr' }, profile: null,
        };
      case 'loading':
        return { isAuthenticated: false, isLoading: true, user: null, profile: null };
      default:
        return { isAuthenticated: false, isLoading: false, user: null, profile: null };
    }
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ---- helpers --------------------------------------------------------------
function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'matchMedia', {
    writable: true, configurable: true,
    value: (query: string) => ({
      matches: /max-width:\s*640px/.test(query) ? width <= 640 : false,
      media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  window.dispatchEvent(new Event('resize'));
}

async function renderLanding() {
  const { default: LandingPage } = await import('@/pages/LandingPage');
  return render(<BrowserRouter><LandingPage /></BrowserRouter>);
}

const STATES: AuthState[] = ['anonymous', 'loading', 'authenticated'];
const VIEWPORTS = [
  { name: 'mobile', width: 375 },
  { name: 'desktop', width: 1280 },
] as const;

describe('Landing — axe across auth/loading states', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    mockNavigate.mockClear();
    authState = 'anonymous';
    setViewport(1280);
  });
  afterEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
  });

  for (const state of STATES) {
    for (const vp of VIEWPORTS) {
      for (const hc of [false, true] as const) {
        it(`axe clean — state=${state} / ${vp.name} / hc=${hc}`, async () => {
          authState = state;
          setViewport(vp.width);
          document.documentElement.dataset.highContrast = hc ? 'true' : 'false';

          const { container } = await renderLanding();

          const results = await axe.run(container, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
            rules: {
              'color-contrast': { enabled: false },
              'region': { enabled: false },
            },
          });

          if (results.violations.length) {
            const summary = results.violations
              .map((v) => `[${v.id}] ${v.help} — ${v.nodes.length} node(s)`)
              .join('\n');
            throw new Error(`axe violations (state=${state}):\n${summary}`);
          }
          expect(results.violations).toEqual([]);
        });
      }
    }
  }
});

describe('Landing — tab traversal stays usable in every auth state', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    mockNavigate.mockClear();
    authState = 'anonymous';
    setViewport(1280);
  });

  for (const state of STATES) {
    it(`focus order works — state=${state}`, async () => {
      authState = state;
      const { container } = await renderLanding();
      const user = userEvent.setup();

      const focusables = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      // Loading/authenticated frames may render fewer surfaces — but the
      // skip-link + at least one CTA must always be reachable.
      expect(focusables.length).toBeGreaterThan(2);

      const seen = new Set<HTMLElement>();
      for (let i = 0; i < Math.min(focusables.length + 2, 30); i++) {
        await act(async () => { await user.tab(); });
        const a = document.activeElement as HTMLElement | null;
        if (a && a !== document.body && container.contains(a)) {
          expect(a.matches(':focus-visible')).toBe(true);
          seen.add(a);
        }
      }
      expect(seen.size).toBeGreaterThanOrEqual(2);
    });
  }

  it('authenticated state triggers the redirect side-effect', async () => {
    authState = 'authenticated';
    await renderLanding();
    // LandingPage useEffect → navigate('/map') when isAuthenticated.
    expect(mockNavigate).toHaveBeenCalledWith('/map');
  });
});
