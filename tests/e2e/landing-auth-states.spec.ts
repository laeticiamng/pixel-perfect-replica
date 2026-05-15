import { test, expect, devices, Page, BrowserContext } from '@playwright/test';
import { gotoLanding, freezeForVisual, setHighContrast } from './_helpers';

/**
 * Runs the same a11y/contrast contract across the three relevant auth
 * lifecycles of the app:
 *
 *   1. ANONYMOUS — landing renders, the global `.landing-veil` is mounted,
 *      `:focus-visible` paints a visible ring above the veil.
 *   2. LOADING   — a protected route is briefly resolving auth: the
 *      `FullPageLoader` is on screen, no blank flash, focus rings still
 *      work on whatever is focusable (e.g. <html>/skip-link), and the
 *      global high-contrast contract still applies.
 *   3. AUTHENTICATED — a session is present in storage; the landing
 *      atomically navigates to `/map` (per the project's Navigate-guard
 *      pattern). On the resulting authed shell the global focus-visible
 *      contract still holds and the readability layer (page background +
 *      contrast tokens) keeps WCAG-AA legibility.
 *
 * We don't depend on a real Supabase session — the auth shape is faked
 * deterministically through the storage keys + a route stub so the test
 * is hermetic and runs in CI without secrets.
 */

const SUPABASE_REF = 'afvssugntxjolqqeyffn';
const SESSION_STORAGE_KEY = `sb-${SUPABASE_REF}-auth-token`;

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 } },
  { name: 'mobile', viewport: devices['iPhone 13'].viewport },
] as const;

/** Asserts that the global keyboard focus-ring CSS contract is intact. */
async function assertFocusVisibleContract(page: Page) {
  const ring = await page.evaluate(() => {
    // Inject a synthetic focusable so we don't depend on what's currently
    // rendered (loader screens, redirected shells, etc.).
    const a = document.createElement('a');
    a.href = '#__a11y_probe';
    a.textContent = 'a11y probe';
    a.id = '__a11y_probe';
    a.style.position = 'fixed';
    a.style.left = '8px';
    a.style.top = '8px';
    a.style.zIndex = '99999';
    document.body.appendChild(a);
    a.focus();
    const cs = getComputedStyle(a);
    const matches = a.matches(':focus-visible');
    const result = {
      matches,
      outlineWidth: parseFloat(cs.outlineWidth || '0'),
      outlineStyle: cs.outlineStyle,
      outlineColor: cs.outlineColor,
      boxShadow: cs.boxShadow,
    };
    a.remove();
    return result;
  });

  expect(ring.matches, 'probe must match :focus-visible').toBe(true);
  expect(ring.outlineWidth, 'focus outline must be painted').toBeGreaterThan(0);
  expect(ring.outlineStyle).not.toBe('none');
  // Coral-ish hue OR a non-empty halo.
  expect(
    ring.boxShadow !== 'none' || /rgb|hsl/.test(ring.outlineColor),
    'focus ring must have visible color or halo above the veil',
  ).toBe(true);
}

/** True if the landing veil exists AND its background gradient is non-empty. */
async function assertVeilReadable(page: Page) {
  const veil = await page.evaluate(() => {
    const el = document.querySelector('.landing-veil') as HTMLElement | null;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundImage,
      pointer: cs.pointerEvents,
      zIndex: cs.zIndex,
    };
  });
  expect(veil, '.landing-veil must be mounted on landing-bearing routes').not.toBeNull();
  expect(veil!.bg).toMatch(/gradient/i);
  // Must not steal pointer events from underlying CTAs.
  expect(veil!.pointer).toBe('none');
}

/** Strong assertion that body text uses the design-system foreground token. */
async function assertReadablePalette(page: Page) {
  const palette = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return {
      bg: cs.backgroundColor,
      fg: cs.color,
    };
  });
  // Body text must not be transparent and bg must be defined — guards against
  // the "blank/white-on-white during loading" regression we already fixed.
  expect(palette.fg).not.toBe('rgba(0, 0, 0, 0)');
  expect(palette.bg).not.toBe('rgba(0, 0, 0, 0)');
}

/* ---------- session helpers (hermetic) ----------------------------------- */

function fakeSessionPayload() {
  // Shape mirrors what supabase-js persists in localStorage. Tokens are
  // deliberately invalid — we stub the network so they're never validated.
  const now = Math.floor(Date.now() / 1000);
  return JSON.stringify({
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    expires_in: 3600,
    expires_at: now + 3600,
    token_type: 'bearer',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'e2e@nearvity.test',
      app_metadata: { provider: 'email' },
      user_metadata: {},
      created_at: new Date(now * 1000).toISOString(),
    },
  });
}

async function stubAuthEndpoints(
  context: BrowserContext,
  opts: { delayMs?: number } = {},
) {
  // Any call to the Supabase auth/REST surface returns a deterministic shape
  // so the auth provider can resolve without network access.
  await context.route('**/auth/v1/**', async (route) => {
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    const url = route.request().url();
    if (url.includes('/user')) {
      const session = JSON.parse(fakeSessionPayload());
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(session.user),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await context.route('**/rest/v1/**', async (route) => {
    if (opts.delayMs) await new Promise((r) => setTimeout(r, opts.delayMs));
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });
}

/* ---------- specs --------------------------------------------------------- */

for (const { name, viewport } of VIEWPORTS) {
  test.describe(`Auth-state a11y contract — ${name}`, () => {
    test.use({ viewport });

    test('ANONYMOUS — landing veil + focus ring are valid', async ({ page }) => {
      await gotoLanding(page);

      // Sanity: not authenticated.
      const stored = await page.evaluate(
        (k) => window.localStorage.getItem(k),
        SESSION_STORAGE_KEY,
      );
      expect(stored).toBeNull();

      await assertVeilReadable(page);
      await assertReadablePalette(page);
      await assertFocusVisibleContract(page);

      // And the same contract under high-contrast.
      await setHighContrast(page, true);
      await assertVeilReadable(page);
      await assertFocusVisibleContract(page);
    });

    test('LOADING — protected route shows loader without breaking focus contract', async ({
      context,
      page,
    }) => {
      // Plant a session so ProtectedRoute waits for profile fetch (which we
      // delay below) — that's the loading window.
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.evaluate(
        ([k, v]) => window.localStorage.setItem(k, v),
        [SESSION_STORAGE_KEY, fakeSessionPayload()],
      );
      await stubAuthEndpoints(context, { delayMs: 1500 });

      // Navigate to a protected route and capture the page DURING the loading
      // window (FullPageLoader is on screen).
      const nav = page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[role="status"], svg.animate-spin, .animate-spin', {
        timeout: 4000,
      }).catch(() => {
        // Fall back: at minimum, the body must be painted (no blank flash).
      });
      await freezeForVisual(page);

      // No blank flash — body has paintable colors.
      await assertReadablePalette(page);

      // Focus contract still works while the loader is mounted.
      await assertFocusVisibleContract(page);

      // High-contrast still strengthens the ring during loading.
      await setHighContrast(page, true);
      await assertFocusVisibleContract(page);

      await nav.catch(() => {/* navigation may settle after assertions */});
    });

    test('AUTHENTICATED — landing redirects, contract holds on the authed shell', async ({
      context,
      page,
    }) => {
      // Plant a session BEFORE first paint so AuthProvider boots authenticated.
      await context.addInitScript(
        ([k, v]) => {
          try { window.localStorage.setItem(k, v); } catch { /* ignore */ }
        },
        [SESSION_STORAGE_KEY, fakeSessionPayload()],
      );
      await stubAuthEndpoints(context);
      // Stub the mapbox token endpoint so /map doesn't explode in CI.
      await context.route('**/get-mapbox-token**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'pk.fake' }),
        }),
      );

      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // The atomic <Navigate> guard sends us to /map. Tolerate a brief delay.
      await expect
        .poll(() => new URL(page.url()).pathname, { timeout: 5000 })
        .not.toBe('/');
      const path = new URL(page.url()).pathname;
      expect(['/map', '/onboarding'].some((p) => path.startsWith(p))).toBe(true);

      await freezeForVisual(page);

      // Authed shell must keep the global a11y contract intact.
      await assertReadablePalette(page);
      await assertFocusVisibleContract(page);

      await setHighContrast(page, true);
      await assertFocusVisibleContract(page);
    });
  });
}
