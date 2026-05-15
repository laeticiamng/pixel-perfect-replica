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
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // Force `prefers-reduced-motion: reduce` so visual snapshots are stable
    // and Framer Motion is neutralized site-wide (matches our a11y story).
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'bun run build && bun run preview -- --port 8080 --strictPort',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
