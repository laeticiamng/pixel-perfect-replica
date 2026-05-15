import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gotoLanding, setHighContrast } from './_helpers';

/**
 * Real-browser axe-core audit — validates WCAG 2.1 A/AA *including*
 * color-contrast (impossible in jsdom). Runs in both viewports via the
 * project matrix (chromium-mobile + chromium-desktop) and both modes.
 */
for (const hc of [false, true] as const) {
  test(`axe: landing has no WCAG 2.1 A/AA violations — high-contrast=${hc}`, async ({ page }) => {
    await gotoLanding(page);
    await setHighContrast(page, hc);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // The R3F canvas + decorative veil aren't landmarks; skip region check.
      .disableRules(['region'])
      .analyze();

    if (results.violations.length) {
      console.log(JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations, 'axe violations on landing').toEqual([]);
  });
}
