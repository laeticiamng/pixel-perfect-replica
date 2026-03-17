/**
 * Device capability detection & performance regression for 3D scene.
 *
 * Three tiers:
 *   "full" – Desktop / high-end.  All effects, up to 1200 particles.
 *   "lite" – Mid-range / mobile.  Reduced particles, simpler FX.
 *   "off"  – No WebGL, low-end, reduced-motion, data-saver. CSS fallback.
 *
 * Also provides a runtime performance regressor that can downgrade
 * the tier dynamically if frame rate drops below thresholds.
 */

export type DeviceTier = 'full' | 'lite' | 'off';

export interface DeviceCapabilities {
  tier: DeviceTier;
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  coreCount: number;
  deviceMemory: number;
  dpr: number;
  isMobile: boolean;
  isDataSaver: boolean;
}

export interface ScenePreset {
  particleCount: number;
  icosahedronDetail: number;
  innerGlowDetail: number;
  ringSegments: number;
  ringCount: number;
  enableBloom: boolean;
  enableChromaticAberration: boolean;
  enableVignette: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  maxDpr: number;
  orbScale: number;
  enableInnerGlow: boolean;
}

// ── Detection helpers ─────────────────────────────────────────────────

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function detectDataSaver(): boolean {
  if (typeof navigator === 'undefined') return false;
  // @ts-expect-error – non-standard API
  return navigator.connection?.saveData === true;
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
}

// ── Main tier decision ────────────────────────────────────────────────

export function getDeviceCapabilities(): DeviceCapabilities {
  const hasWebGL = detectWebGL();
  const prefersReducedMotion = detectReducedMotion();
  const coreCount = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 2) : 2;
  // @ts-expect-error – deviceMemory is non-standard
  const deviceMemory: number = typeof navigator !== 'undefined' ? (navigator.deviceMemory ?? 4) : 4;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1;
  const isMobile = detectMobile();
  const isDataSaver = detectDataSaver();

  let tier: DeviceTier = 'full';

  // Hard blocks -> "off"
  if (!hasWebGL) tier = 'off';
  else if (prefersReducedMotion) tier = 'off';
  else if (isDataSaver) tier = 'off';
  else if (coreCount < 4) tier = 'off';
  else if (deviceMemory < 2) tier = 'off';
  // Soft downgrades -> "lite"
  else if (isMobile) tier = 'lite';
  else if (coreCount < 6) tier = 'lite';
  else if (deviceMemory < 4) tier = 'lite';
  else if (dpr > 2.5) tier = 'lite';

  return { tier, hasWebGL, prefersReducedMotion, coreCount, deviceMemory, dpr, isMobile, isDataSaver };
}

export function shouldEnable3D(): boolean {
  return getDeviceCapabilities().tier !== 'off';
}

// ── Per-tier presets ──────────────────────────────────────────────────

export function getScenePreset(tier: DeviceTier): ScenePreset {
  switch (tier) {
    case 'full':
      return {
        particleCount: 1200,
        icosahedronDetail: 64,
        innerGlowDetail: 24,
        ringSegments: 128,
        ringCount: 3,
        enableBloom: true,
        enableChromaticAberration: true,
        enableVignette: true,
        bloomIntensity: 1.2,
        bloomThreshold: 0.15,
        maxDpr: 2,
        orbScale: 1.0,
        enableInnerGlow: true,
      };
    case 'lite':
      return {
        particleCount: 400,
        icosahedronDetail: 32,
        innerGlowDetail: 16,
        ringSegments: 64,
        ringCount: 2,
        enableBloom: true,
        enableChromaticAberration: false,
        enableVignette: true,
        bloomIntensity: 0.8,
        bloomThreshold: 0.3,
        maxDpr: 1.5,
        orbScale: 0.9,
        enableInnerGlow: true,
      };
    case 'off':
    default:
      return {
        particleCount: 0,
        icosahedronDetail: 16,
        innerGlowDetail: 8,
        ringSegments: 32,
        ringCount: 0,
        enableBloom: false,
        enableChromaticAberration: false,
        enableVignette: false,
        bloomIntensity: 0,
        bloomThreshold: 0.5,
        maxDpr: 1,
        orbScale: 0.8,
        enableInnerGlow: false,
      };
  }
}

// ── Performance regression ────────────────────────────────────────────

/**
 * Tracks frame times and triggers a callback when performance degrades.
 * Use inside useFrame to feed delta values; when avg frame time exceeds
 * threshold for `sampleWindow` consecutive frames, `onRegress` fires.
 */
export class PerformanceRegressor {
  private frameTimes: number[] = [];
  private readonly sampleSize: number;
  private readonly threshold: number; // ms per frame
  private triggered = false;

  constructor(
    private readonly onRegress: () => void,
    { sampleSize = 90, targetFps = 30 }: { sampleSize?: number; targetFps?: number } = {},
  ) {
    this.sampleSize = sampleSize;
    this.threshold = 1000 / targetFps;
  }

  sample(deltaMs: number): void {
    if (this.triggered) return;
    this.frameTimes.push(deltaMs);
    if (this.frameTimes.length < this.sampleSize) return;

    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    if (avg > this.threshold) {
      this.triggered = true;
      this.onRegress();
    }
    // Slide window
    this.frameTimes = this.frameTimes.slice(this.sampleSize / 2);
  }

  reset(): void {
    this.frameTimes = [];
    this.triggered = false;
  }
}
