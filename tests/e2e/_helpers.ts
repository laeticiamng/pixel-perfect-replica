import { Page, expect } from '@playwright/test';

/** Toggle high-contrast via the in-app pref + dataset, then wait for paint. */
export async function setHighContrast(page: Page, on: boolean) {
  await page.evaluate((value) => {
    window.localStorage.setItem('nearvity-high-contrast', String(value));
    window.dispatchEvent(new Event('nearvity:high-contrast-change'));
    document.documentElement.dataset.highContrast = value ? 'true' : 'false';
  }, on);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.highContrast))
    .toBe(on ? 'true' : 'false');
}

/**
 * Neutralize the 3D scene & shimmer animations so visual snapshots are stable.
 * The veil itself is preserved — that's the very thing we want to capture.
 */
export async function freezeForVisual(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* The R3F canvas isn't deterministic frame-to-frame; hide it but keep
         the veil so we still validate readability. */
      canvas { visibility: hidden !important; }
    `,
  });
  // Wait for fonts so headline metrics match the baseline.
  await page.evaluate(() => (document as any).fonts?.ready);
}

export async function gotoLanding(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await freezeForVisual(page);
}
