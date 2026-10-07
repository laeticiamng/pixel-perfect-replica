import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — Chromium-only, two device profiles (mobile + desktop),
 * pixel-snapshot tolerant of font sub-pixel jitter. Used by the a11y CI
 * workflow (.github/workflows/a11y.yml).
 *
 * Local: `bun run test:e2e`
 * Update visual baselines: `bun run test:e2e:update`
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  expect: {
    // Visual regression — small tolerance to absorb font hinting & antialias
    // noise across CI runners while still catching real layout shifts.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.012,
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    // 127.0.0.1 explicite : vite.config.ts écoute sur « :: » (IPv6) par défaut,
    // ce qui échoue sur les machines sans IPv6 ; le serveur d'aperçu est donc
    // lancé en IPv4 (voir webServer.command).
    baseURL: 'http://127.0.0.1:8080',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // Force `prefers-reduced-motion: reduce` so visual snapshots are stable
    // and Framer Motion is neutralized site-wide (matches our a11y story).
    // « reducedMotion » n'est PAS une option de premier niveau de `use` :
    // placée là, Playwright l'ignorait silencieusement (erreur TS2769 visible
    // avec tsconfig.e2e.json). Sa place est dans contextOptions.
    contextOptions: { reducedMotion: 'reduce' },
    colorScheme: 'dark',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'chromium-mobile',
      // Le descripteur « iPhone 13 » choisit WebKit par défaut ; le CI
      // n'installe que Chromium (projet nommé chromium-mobile). On garde
      // viewport, deviceScaleFactor, isMobile, hasTouch et userAgent, mais
      // on force le moteur Chromium.
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'bun run build && bun run preview -- --host 127.0.0.1 --port 8080 --strictPort',
    url: 'http://127.0.0.1:8080',
    // Build hermétique : sans VITE_SUPABASE_*, main.tsx affiche la page de
    // maintenance et aucune landing n'est testable. On fournit une config
    // factice qui ne touche aucun backend réel :
    //  - l'hôte « afvssugntxjolqqeyffn.localhost » garde le premier label
    //    attendu par la clé de session sb-<ref>-auth-token des specs
    //    (landing-auth-states) tout en résolvant vers la boucle locale ;
    //  - la clé est un simple marqueur, les appels auth/REST sont stubés
    //    par les specs ou échouent localement (connexion refusée).
    env: {
      VITE_SUPABASE_URL: 'http://afvssugntxjolqqeyffn.localhost:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'cle-factice-e2e',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
