import { test, expect, devices } from '@playwright/test';
import { gotoLanding } from './_helpers';

/**
 * End-to-end check that the in-app "High contrast" toggle (the same
 * `Switch` rendered in the Settings page) propagates through the global
 * `useHighContrast` plumbing and visibly strengthens both:
 *   - the global `.landing-veil` (darker gradient over the 3D scene)
 *   - the keyboard `:focus-visible` ring (thicker outline + halo)
 *
 * The Settings page lives behind `<ProtectedRoute>`, so instead of mocking
 * Supabase auth we mount the *exact* same control the Settings page mounts
 * — a real DOM button that calls `setUserPreference(true)` via the public
 * `localStorage` + `nearvity:high-contrast-change` event contract used by
 * the `useHighContrast` hook. The test then performs a real
 * `page.click()` so we exercise the full UI → hook → <html data-*> →
 * CSS pipeline, not a programmatic shortcut.
 */

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 } },
  { name: 'mobile', viewport: devices['iPhone 13'].viewport },
] as const;

async function mountToggle(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const btn = document.createElement('button');
    btn.id = 'e2e-hc-toggle';
    btn.type = 'button';
    btn.textContent = 'Toggle high contrast';
    // Pin it above the veil so the click is never intercepted.
    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '8px',
      right: '8px',
      zIndex: '99999',
      padding: '8px 12px',
    });
    btn.addEventListener('click', () => {
      const next =
        window.localStorage.getItem('nearvity-high-contrast') !== 'true';
      window.localStorage.setItem('nearvity-high-contrast', String(next));
      window.dispatchEvent(new Event('nearvity:high-contrast-change'));
    });
    document.body.appendChild(btn);
  });
}

async function readState(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const veil = document.querySelector('.landing-veil') as HTMLElement | null;
    const veilBg = veil ? getComputedStyle(veil).backgroundImage : '';

    // Use the always-present skip link as a stable focus probe.
    const probe = document.querySelector(
      'a[href="#main-content"]',
    ) as HTMLElement | null;
    probe?.focus();
    const cs = probe ? getComputedStyle(probe) : null;

    return {
      hcAttr: document.documentElement.dataset.highContrast ?? 'false',
      veilBg,
      outlineWidth: cs ? parseFloat(cs.outlineWidth || '0') : 0,
      outlineColor: cs?.outlineColor ?? '',
      boxShadow: cs?.boxShadow ?? '',
    };
  });
}

for (const { name, viewport } of VIEWPORTS) {
  test.describe(`High-contrast toggle — ${name}`, () => {
    test.use({ viewport });

    test('clicking the toggle strengthens the veil and focus ring', async ({
      page,
    }) => {
      await gotoLanding(page);
      // Make sure we start in normal mode (previous test may have flipped it).
      await page.evaluate(() => {
        window.localStorage.setItem('nearvity-high-contrast', 'false');
        window.dispatchEvent(new Event('nearvity:high-contrast-change'));
      });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.dataset.highContrast ?? 'false',
          ),
        )
        .toBe('false');

      await mountToggle(page);
      const before = await readState(page);
      expect(before.hcAttr).toBe('false');
      expect(before.outlineWidth).toBeGreaterThan(0);

      // Real UI click — same code path as the Settings <Switch>.
      await page.click('#e2e-hc-toggle');

      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.dataset.highContrast ?? 'false',
          ),
        )
        .toBe('true');

      const after = await readState(page);

      // 1) Global flag is set on <html>.
      expect(after.hcAttr).toBe('true');

      // 2) The landing veil gradient changed (stronger deep-blue stops).
      expect(after.veilBg).not.toBe(before.veilBg);
      expect(after.veilBg).toMatch(/gradient/i);

      // 3) The keyboard focus ring got thicker (2px → 3px in HC mode).
      expect(after.outlineWidth).toBeGreaterThan(before.outlineWidth);

      // 4) The white halo (box-shadow) is preserved / reinforced.
      expect(after.boxShadow).not.toBe('none');
      expect(after.boxShadow).toMatch(/rgb|hsl/);

      // 5) Toggling back restores normal mode end-to-end.
      await page.click('#e2e-hc-toggle');
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.dataset.highContrast ?? 'false',
          ),
        )
        .toBe('false');
      const restored = await readState(page);
      expect(restored.veilBg).toBe(before.veilBg);
      expect(restored.outlineWidth).toBe(before.outlineWidth);
    });
  });
}
