/**
 * Verifies that the in-app "High Contrast" accessibility toggle:
 *   1. Mirrors to <html data-high-contrast="true"> (drives every CSS override)
 *   2. Reacts to OS preference (prefers-contrast: more / forced-colors: active)
 *   3. Reacts to the localStorage toggle + custom event broadcast
 *   4. Strengthens the global landing veil + scrim utilities (CSS contract)
 *   5. Holds across mobile (≤640px) and desktop viewports — same data attr
 *      drives both, so a single render proves the contract for every BP.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { MotionAccessibilityProvider } from '@/components/MotionAccessibilityProvider';

function setMatchMedia(map: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: Object.entries(map).some(([k, v]) => v && query.includes(k)),
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

function mount() {
  return render(
    <MotionAccessibilityProvider>
      <div data-testid="child" />
    </MotionAccessibilityProvider>
  );
}

describe('Accessibility — High Contrast toggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-high-contrast');
    setMatchMedia({});
  });
  afterEach(() => window.localStorage.clear());

  it('default: no preference → data-high-contrast="false"', () => {
    mount();
    expect(document.documentElement.dataset.highContrast).toBe('false');
  });

  it('OS prefers-contrast: more → data-high-contrast="true"', () => {
    setMatchMedia({ 'prefers-contrast: more': true });
    mount();
    expect(document.documentElement.dataset.highContrast).toBe('true');
  });

  it('OS forced-colors: active → data-high-contrast="true"', () => {
    setMatchMedia({ 'forced-colors: active': true });
    mount();
    expect(document.documentElement.dataset.highContrast).toBe('true');
  });

  it('in-app toggle (localStorage) → data-high-contrast="true"', () => {
    window.localStorage.setItem('nearvity-high-contrast', 'true');
    mount();
    expect(document.documentElement.dataset.highContrast).toBe('true');
  });

  it('toggle event propagates live without remount', async () => {
    mount();
    expect(document.documentElement.dataset.highContrast).toBe('false');
    await act(async () => {
      window.localStorage.setItem('nearvity-high-contrast', 'true');
      window.dispatchEvent(new Event('nearvity:high-contrast-change'));
    });
    expect(document.documentElement.dataset.highContrast).toBe('true');

    await act(async () => {
      window.localStorage.setItem('nearvity-high-contrast', 'false');
      window.dispatchEvent(new Event('nearvity:high-contrast-change'));
    });
    expect(document.documentElement.dataset.highContrast).toBe('false');
  });

  describe('CSS contract — landing veil + scrim selectors exist', () => {
    // jsdom doesn't apply the imported stylesheet, so we inline the contract:
    // confirm the selectors we ship are present in the bundled index.css.
    // This guards against accidental rename of `.landing-veil`, `.section-scrim`
    // or `.landing-page .text-muted-foreground` overrides — any of which would
    // silently drop the contrast guarantees on mobile + desktop.
    let css: string;
    beforeEach(async () => {
      const fs = await import('fs');
      const path = await import('path');
      css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
    });

    it('strengthens .landing-veil under html[data-high-contrast="true"]', () => {
      expect(css).toMatch(/html\[data-high-contrast="true"\]\s*\.landing-veil/);
    });

    it('strengthens .landing-veil on mobile (max-width: 640px)', () => {
      expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[^}]*\.landing-veil/s);
    });

    it('boosts .section-scrim under high-contrast mode', () => {
      expect(css).toMatch(/html\[data-high-contrast="true"\]\s*\.section-scrim/);
    });

    it('lifts muted text inside .landing-page under high-contrast mode', () => {
      expect(css).toMatch(
        /html\[data-high-contrast="true"\]\s*\.landing-page\s*\.text-muted-foreground/
      );
    });

    it('reinforces :focus-visible globally + amplifies it in HC mode', () => {
      expect(css).toMatch(/:focus-visible\s*{[^}]*outline:[^}]*hsl\(var\(--coral\)\)/);
      expect(css).toMatch(
        /html\[data-high-contrast="true"\]\s*:focus-visible[^}]*outline:[^}]*coral-light/
      );
    });

    it('mobile breakpoint also strengthens landing-page text shadows', () => {
      expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[^}]*\.landing-page\s+h1/s);
    });
  });
});
