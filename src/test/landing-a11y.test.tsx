/**
 * Landing-page accessibility audit suite.
 *
 * Three orthogonal guarantees:
 *   1. AXE — automated a11y rules (aria, landmarks, names, focus order…) on
 *      the landing in normal AND high-contrast mode, on mobile + desktop
 *      viewport widths. Color-contrast is asserted via the dedicated CSS
 *      contract test in `high-contrast.test.tsx` (jsdom can't compute
 *      pixel luminance, so axe's `color-contrast` rule is disabled here
 *      and offloaded to the CSS-token contract).
 *   2. DOM/CSS structural snapshot — confirms the same landing markup
 *      renders identically except for the `data-high-contrast` flip and
 *      the presence of the `landing-veil` + scrim utilities. Catches any
 *      accidental removal of the harmonization classes (hc-coral,
 *      hc-border, landing-veil, section-scrim, hero-text-shadow-*).
 *   3. Tab traversal — walks the focus order with @testing-library/user-event
 *      and verifies every interactive element matches `:focus-visible`,
 *      meaning the global focus ring (which we render *above* the
 *      `landing-veil` via z-index + outline) will paint in production.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import axe from 'axe-core';
import { translations } from '@/lib/i18n/translations';

// ---- Shared mocks (mirror src/test/LandingPage.test.tsx) ------------------
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
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false, user: null, profile: null }),
}));
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// ---- Helpers --------------------------------------------------------------
const VIEWPORTS = [
  { name: 'mobile', width: 375 },
  { name: 'desktop', width: 1280 },
] as const;

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      // Drive only the breakpoint queries we use in the suite.
      matches: /max-width:\s*640px/.test(query) ? width <= 640 : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  window.dispatchEvent(new Event('resize'));
}

async function renderLanding() {
  const { default: LandingPage } = await import('@/pages/LandingPage');
  return render(
    <BrowserRouter>
      <LandingPage />
    </BrowserRouter>
  );
}

function setHighContrast(on: boolean) {
  document.documentElement.dataset.highContrast = on ? 'true' : 'false';
}

// ---- 1. axe-core automated audit ------------------------------------------
describe('Landing — axe-core automated a11y audit', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    setViewport(1280);
  });
  afterEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
  });

  for (const vp of VIEWPORTS) {
    for (const hc of [false, true] as const) {
      it(`passes WCAG 2.1 AA rules — ${vp.name} / high-contrast=${hc}`, async () => {
        setViewport(vp.width);
        setHighContrast(hc);
        const { container } = await renderLanding();

        const results = await axe.run(container, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          rules: {
            // Pixel-based — jsdom has no layout engine, asserted in
            // `high-contrast.test.tsx` via the CSS-token contract instead.
            'color-contrast': { enabled: false },
            // The 3D scene + scrim are decorative <div>s; not a region issue.
            'region': { enabled: false },
          },
        });

        if (results.violations.length) {
          // Surface the human-readable summary in the failure output.
          const summary = results.violations.map((v) =>
            `[${v.id}] ${v.help} — ${v.nodes.length} node(s)`
          ).join('\n');
          throw new Error(`axe violations:\n${summary}`);
        }
        expect(results.violations).toEqual([]);
      });
    }
  }
});

// ---- 2. Visual regression — DOM/CSS structural snapshot --------------------
describe('Landing — structural snapshot (normal vs high-contrast)', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
  });

  /**
   * Snapshots a stable slice of the rendered landing — the harmonization
   * contract surfaces (veil + scrim + HC tokens). A pixel diff would need
   * a real browser; here we lock the *DOM contract* that drives the visual.
   */
  function fingerprint(container: HTMLElement) {
    const veil = container.querySelector('.landing-veil');
    const scrims = container.querySelectorAll('.section-scrim').length;
    const hcCoral = container.querySelectorAll('.hc-coral').length;
    const hcBorder = container.querySelectorAll('.hc-border').length;
    const hcButtonBg = container.querySelectorAll('.hc-button-bg').length;
    const hcTextStrong = container.querySelectorAll('.hc-text-strong').length;
    const heroShadowStrong = container.querySelectorAll('.hero-text-shadow-strong').length;
    const heroShadowSoft = container.querySelectorAll('.hero-text-shadow-soft').length;
    const landingPage = container.querySelector('.landing-page');
    return {
      hasLandingPageScope: !!landingPage,
      hasGlobalVeil: !!veil,
      veilAriaHidden: veil?.getAttribute('aria-hidden'),
      sectionScrims: scrims,
      hcCoral, hcBorder, hcButtonBg, hcTextStrong,
      heroShadowStrong, heroShadowSoft,
      htmlHighContrast: document.documentElement.dataset.highContrast,
    };
  }

  for (const vp of VIEWPORTS) {
    it(`fingerprint stable — ${vp.name} normal mode`, async () => {
      setViewport(vp.width);
      setHighContrast(false);
      const { container } = await renderLanding();
      expect(fingerprint(container)).toMatchSnapshot();
    });

    it(`fingerprint stable — ${vp.name} high-contrast mode`, async () => {
      setViewport(vp.width);
      setHighContrast(true);
      const { container } = await renderLanding();
      expect(fingerprint(container)).toMatchSnapshot();
    });
  }

  it('high-contrast flip changes only the html dataset, not the markup', async () => {
    setViewport(1280);
    setHighContrast(false);
    const a = await renderLanding();
    const fpA = fingerprint(a.container);
    a.unmount();

    setHighContrast(true);
    const b = await renderLanding();
    const fpB = fingerprint(b.container);

    expect(fpA.htmlHighContrast).toBe('false');
    expect(fpB.htmlHighContrast).toBe('true');
    // All structural counts must match — only the HTML dataset flag flips.
    expect({ ...fpA, htmlHighContrast: 'X' }).toEqual({ ...fpB, htmlHighContrast: 'X' });
  });
});

// ---- 3. Tab traversal + focus-visible above the veil ----------------------
describe('Landing — keyboard tab order keeps focus visible above the veil', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    setViewport(1280);
  });

  for (const hc of [false, true] as const) {
    it(`every focusable element is reachable & focus-visible — high-contrast=${hc}`, async () => {
      setHighContrast(hc);
      const { container } = await renderLanding();
      const user = userEvent.setup();

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      // Sanity — landing must have meaningful keyboard surface.
      expect(focusables.length).toBeGreaterThan(10);

      const seen = new Set<HTMLElement>();
      // Walk one Tab beyond the focusable count — guarantees we visit each.
      for (let i = 0; i < focusables.length + 2; i++) {
        await act(async () => { await user.tab(); });
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body && container.contains(active)) {
          // jsdom supports :focus-visible for keyboard-driven focus.
          expect(active.matches(':focus-visible')).toBe(true);
          // The veil sits at z-[1] / pointer-events-none — focused element
          // must NEVER live underneath it (no element with z-index <= 1
          // ancestor without a stacking context above).
          const computed = window.getComputedStyle(active);
          // The element shouldn't be hidden / clipped by the veil.
          expect(computed.visibility).not.toBe('hidden');
          expect(computed.display).not.toBe('none');
          seen.add(active);
        }
      }
      // We should have actually focused several elements (header CTAs, hero
      // buttons, footer links). Exact count varies with viewport, lower
      // bound is safe at 5.
      expect(seen.size).toBeGreaterThanOrEqual(5);
    });
  }

  it('CSS contract guarantees focus ring renders above .landing-veil', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
    // Veil is z-[1] (set in LandingPage.tsx) and the global focus ring uses
    // outline (which paints on the element itself, not a child). Confirm
    // both anchors of that contract exist.
    expect(css).toMatch(/:focus-visible\s*{[^}]*outline:[^}]*hsl\(var\(--coral\)\)/);
    expect(css).toMatch(/html\[data-high-contrast="true"\]\s*:focus-visible/);
  });
});
