import { test, expect } from '@playwright/test';
import { gotoLanding, setHighContrast } from './_helpers';

/**
 * Pixel-perfect visual regression for normal vs high-contrast.
 * The 3D <canvas> is hidden by `freezeForVisual` (non-deterministic frames),
 * but the `.landing-veil` is intentionally preserved — that's the layer
 * we need to validate visually.
 *
 * Two snapshots per project (mobile + desktop):
 *   - landing-normal.png
 *   - landing-high-contrast.png
 *
 * Baselines live next to the spec under
 * tests/e2e/landing-visual.spec.ts-snapshots/<name>-<project>-<platform>.png
 * Re-baseline with: `bun run test:e2e:update`.
 */
test.describe('Landing visual regression — veil + tokens', () => {
  test('normal mode hero+veil', async ({ page }) => {
    await gotoLanding(page);
    await setHighContrast(page, false);
    // First viewport-height capture (hero + veil first paint).
    await expect(page).toHaveScreenshot('landing-normal.png', { fullPage: false });
  });

  test('high-contrast mode hero+veil', async ({ page }) => {
    await gotoLanding(page);
    await setHighContrast(page, true);
    await expect(page).toHaveScreenshot('landing-high-contrast.png', { fullPage: false });
  });

  test('veil is present and aria-hidden in both modes', async ({ page }) => {
    await gotoLanding(page);
    const veil = page.locator('.landing-veil');
    await expect(veil).toHaveCount(1);
    await expect(veil).toHaveAttribute('aria-hidden', 'true');

    await setHighContrast(page, true);
    await expect(veil).toHaveCount(1);
    await expect(veil).toHaveAttribute('aria-hidden', 'true');
  });
});
