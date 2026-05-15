import { test, expect } from '@playwright/test';
import { gotoLanding, setHighContrast } from './_helpers';

/**
 * Walks Tab through every focusable element on the landing and asserts:
 *   - the element receives :focus-visible
 *   - the focus outline is actually painted (non-zero outline-width OR
 *     a visible box-shadow ring) — i.e. visible *above* the global
 *     `landing-veil` (which sits at z-[1] / pointer-events: none).
 */
for (const hc of [false, true] as const) {
  test(`tab traversal keeps focus outline visible above the veil — high-contrast=${hc}`, async ({ page }) => {
    await gotoLanding(page);
    await setHighContrast(page, hc);

    // Start from <body> so the first Tab lands on the skip-link.
    await page.evaluate(() => (document.body as HTMLElement).focus());

    const focusableCount = await page.evaluate(() => {
      return document.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ).length;
    });
    expect(focusableCount, 'landing must expose meaningful keyboard surface').toBeGreaterThan(10);

    const visited: { tag: string; label: string; outlineOk: boolean }[] = [];

    for (let i = 0; i < Math.min(focusableCount + 2, 80); i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outlineW = parseFloat(cs.outlineWidth || '0');
        const hasOutline = outlineW > 0 && cs.outlineStyle !== 'none';
        // Focus ring may also be drawn via box-shadow (we use both).
        const hasShadowRing = /inset|0px|rgb|hsl/.test(cs.boxShadow) && cs.boxShadow !== 'none';
        const isFocusVisible = el.matches(':focus-visible');
        return {
          tag: el.tagName.toLowerCase(),
          label: el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 40) ?? '',
          isFocusVisible,
          outlineOk: isFocusVisible && (hasOutline || hasShadowRing),
        };
      });
      if (info) {
        expect(info.isFocusVisible, `${info.tag} <${info.label}> should match :focus-visible`).toBe(true);
        expect(info.outlineOk, `${info.tag} <${info.label}> must have a visible focus ring`).toBe(true);
        visited.push(info);
      }
    }

    expect(visited.length, 'must visit several real focusable elements').toBeGreaterThanOrEqual(5);
  });
}
