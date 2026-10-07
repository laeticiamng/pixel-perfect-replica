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
/**
 * Les captures pixel portent le tag @visual : leurs références n'ont jamais
 * été générées sur la plateforme du CI (ubuntu-latest). Elles tournent donc
 * dans le workflow manuel « visual » (.github/workflows/visual.yml), qui sait
 * aussi les (re)générer, et non sur chaque push.
 *
 * Le bandeau cookies apparaît via un minuteur de 2 s : selon le moment de la
 * capture il est présent ou non. On enregistre un choix de consentement avant
 * le chargement pour que la capture ne porte que sur le héros + voile.
 */
const COOKIE_CONSENT_KEY = 'nearvity-cookie-consent';

test.describe('Landing visual regression — veil + tokens', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript((key) => {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({ accepted: false, timestamp: '2026-01-01T00:00:00.000Z', preferences: { analytics: false, functional: true } }),
        );
      } catch { /* stockage indisponible : la capture le révélera */ }
    }, COOKIE_CONSENT_KEY);
  });

  test('normal mode hero+veil', { tag: '@visual' }, async ({ page }) => {
    await gotoLanding(page);
    await setHighContrast(page, false);
    // First viewport-height capture (hero + veil first paint).
    await expect(page).toHaveScreenshot('landing-normal.png', { fullPage: false });
  });

  test('high-contrast mode hero+veil', { tag: '@visual' }, async ({ page }) => {
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
