/**
 * Verifies that the global reduced-motion accessibility mode neutralizes
 * Framer Motion animations on every protected route — including the
 * Lenis-disabled ones (/map, /binome, /proximity).
 *
 * Two activation paths are covered:
 *   1. The OS preference `prefers-reduced-motion: reduce`
 *   2. The in-app toggle (localStorage `nearvity-reduce-motion=true`)
 *
 * Because the actual /map, /binome, /proximity pages are heavy
 * (Mapbox, Supabase, Zustand), we mount the same provider stack used in
 * App.tsx and a sentinel <motion.div> at each path — that's exactly what
 * Framer Motion sees in production.
 */
import { useContext } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { motion, MotionConfigContext } from 'framer-motion';
import { MotionAccessibilityProvider } from '@/components/MotionAccessibilityProvider';
import { SmoothScroll } from '@/components/SmoothScroll';

const PROTECTED_ROUTES = ['/map', '/binome', '/binome/check-in', '/proximity', '/proximity/123'];

let capturedReducedMotion: string | undefined;

function Probe() {
  const ctx = useContext(MotionConfigContext as React.Context<{ reducedMotion?: string }>);
  capturedReducedMotion = ctx.reducedMotion;
  return (
    <motion.div
      data-testid="sentinel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
}

function renderAt(path: string) {
  capturedReducedMotion = undefined;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <MotionAccessibilityProvider>
        <SmoothScroll />
        <Probe />
      </MotionAccessibilityProvider>
    </MemoryRouter>
  );
}

function setMatchMedia(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce') ? reduce : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe('Accessibility — reduced motion neutralizes Framer Motion site-wide', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-reduce-motion');
    setMatchMedia(false);
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('via OS preference (prefers-reduced-motion: reduce)', () => {
    beforeEach(() => setMatchMedia(true));

    PROTECTED_ROUTES.forEach((path) => {
      it(`neutralizes motion on ${path}`, () => {
        renderAt(path);

        // 1) Provider mirrors state to <html data-reduce-motion="true"> so
        //    plain CSS / Tailwind animate-* utilities are also defused.
        expect(document.documentElement.dataset.reduceMotion).toBe('true');

        // 2) The framer-motion runtime under this subtree is configured
        //    with reducedMotion="always" — every <motion.*> child skips
        //    transform/opacity transitions.
        expect(capturedReducedMotion).toBe('always');
      });
    });
  });

  describe('via in-app toggle (localStorage)', () => {
    beforeEach(() => {
      window.localStorage.setItem('nearvity-reduce-motion', 'true');
    });

    PROTECTED_ROUTES.forEach((path) => {
      it(`neutralizes motion on ${path}`, () => {
        renderAt(path);

        expect(document.documentElement.dataset.reduceMotion).toBe('true');
        expect(capturedReducedMotion).toBe('always');
      });
    });
  });

  describe('control — neither preference set', () => {
    PROTECTED_ROUTES.forEach((path) => {
      it(`leaves motion enabled on ${path}`, () => {
        renderAt(path);

        expect(document.documentElement.dataset.reduceMotion).toBe('false');
        expect(capturedReducedMotion).toBe('never');
      });
    });
  });

  describe('toggle propagation across the app', () => {
    it('updates the html attribute when the in-app toggle changes', async () => {
      renderAt('/map');
      expect(document.documentElement.dataset.reduceMotion).toBe('false');

      await act(async () => {
        window.localStorage.setItem('nearvity-reduce-motion', 'true');
        window.dispatchEvent(new Event('nearvity:reduce-motion-change'));
      });

      expect(document.documentElement.dataset.reduceMotion).toBe('true');
    });
  });
});
