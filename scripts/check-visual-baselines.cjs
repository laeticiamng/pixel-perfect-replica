#!/usr/bin/env node
/**
 * Verifies that every Playwright visual baseline expected by the landing
 * snapshot suite exists on disk.
 *
 * Matrix (8 baselines total):
 *   spec               × snapshot name           × project              = files
 *   landing-visual     × landing-normal.png      × chromium-{mobile,desktop}
 *   landing-visual     × landing-high-contrast   × chromium-{mobile,desktop}
 *
 * Playwright appends a `-<platform>` suffix (linux/darwin/win32) to each
 * baseline file, so we accept any platform suffix and only fail when the
 * (snapshot, project) pair has no baseline at all.
 *
 * Exits 0 if every baseline is present, 1 otherwise — with a clear,
 * actionable message pointing to `bun run test:e2e:update`.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SNAPSHOTS_DIR = path.join(
  ROOT,
  'tests',
  'e2e',
  'landing-visual.spec.ts-snapshots',
);

const SNAPSHOTS = ['landing-normal.png', 'landing-high-contrast.png'];
const PROJECTS = ['chromium-desktop', 'chromium-mobile'];
const MODE_LABEL = {
  'landing-normal.png': 'normal',
  'landing-high-contrast.png': 'high-contrast',
};
const PROJECT_LABEL = {
  'chromium-desktop': 'desktop',
  'chromium-mobile': 'mobile',
};

const RED = (s) => `\x1b[31m${s}\x1b[0m`;
const GREEN = (s) => `\x1b[32m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const BOLD = (s) => `\x1b[1m${s}\x1b[0m`;
const DIM = (s) => `\x1b[2m${s}\x1b[0m`;

function listFiles(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

function main() {
  console.log(BOLD('Visual baseline check — landing × {normal, high-contrast} × {desktop, mobile}'));
  console.log(DIM(`Looking in: ${path.relative(ROOT, SNAPSHOTS_DIR)}/`));
  console.log();

  const files = listFiles(SNAPSHOTS_DIR);
  if (files === null) {
    console.log(RED('✗ Snapshot directory does not exist.'));
    console.log();
    console.log(`  Expected:  ${SNAPSHOTS_DIR}`);
    console.log(`  Reason:    no Playwright visual baselines have been generated yet.`);
    console.log();
    console.log(YELLOW('  Fix:'));
    console.log('    bun run test:e2e:update');
    console.log('    git add tests/e2e/landing-visual.spec.ts-snapshots');
    process.exit(1);
  }

  /** @type {{snapshot: string, project: string, missing: boolean, found: string[]}[]} */
  const matrix = [];
  for (const snapshot of SNAPSHOTS) {
    for (const project of PROJECTS) {
      const base = snapshot.replace(/\.png$/, '');
      // Playwright pattern: `<base>-<project>-<platform>.png`
      const re = new RegExp(
        `^${escapeRegex(base)}-${escapeRegex(project)}(?:-[a-z0-9]+)?\\.png$`,
      );
      const found = files.filter((f) => re.test(f));
      matrix.push({ snapshot, project, missing: found.length === 0, found });
    }
  }

  const missing = matrix.filter((m) => m.missing);
  const present = matrix.filter((m) => !m.missing);

  for (const row of present) {
    const label = `${MODE_LABEL[row.snapshot]} / ${PROJECT_LABEL[row.project]}`;
    console.log(`  ${GREEN('✓')} ${label.padEnd(28)} ${DIM(row.found.join(', '))}`);
  }
  for (const row of missing) {
    const label = `${MODE_LABEL[row.snapshot]} / ${PROJECT_LABEL[row.project]}`;
    console.log(`  ${RED('✗')} ${label.padEnd(28)} ${RED('MISSING')} ${DIM(`(expected: ${row.snapshot.replace(/\.png$/, '')}-${row.project}-<platform>.png)`)}`);
  }

  console.log();

  if (missing.length === 0) {
    console.log(GREEN(BOLD(`All ${matrix.length} visual baselines present.`)));
    process.exit(0);
  }

  console.log(
    RED(BOLD(`${missing.length} of ${matrix.length} visual baselines missing.`)),
  );
  console.log();
  console.log(YELLOW('Fix:'));
  console.log('  1. Generate baselines locally:');
  console.log('       bun run test:e2e:update');
  console.log('  2. Commit them so CI uses the same images:');
  console.log('       git add tests/e2e/landing-visual.spec.ts-snapshots');
  console.log();
  console.log(
    DIM('Note: baselines are platform-specific. Generate on the same OS as CI (linux) when possible.'),
  );
  process.exit(1);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main();
