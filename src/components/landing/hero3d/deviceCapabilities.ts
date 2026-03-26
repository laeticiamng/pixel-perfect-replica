/**
 * Device capability detection, scene presets, and performance regression.
 *
 * Three tiers:
 *   "full" – Desktop / high-end.  All effects, up to 1200 particles.
 *   "lite" – Mid-range / mobile.  Reduced particles, simpler FX.
 *   "off"  – No WebGL, low-end, reduced-motion, data-saver. CSS fallback.
 *
 * Also provides a runtime performance regressor that can downgrade
 * the tier dynamically if frame rate drops below thresholds.
 */

import type { DeviceTier, DeviceCapabilities, ScenePreset } from './types';

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

function detectGpuTier(): 'high' | 'mid' | 'low' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) return 'unknown';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'unknown';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
    // Known high-end GPUs
    if (/nvidia|geforce|rtx|gtx|radeon rx|apple m[2-9]|apple gpu/i.test(renderer)) return 'high';
    // Known low-end / integrated
    if (/intel.*hd|intel.*uhd|mesa|swiftshader|llvmpipe/i.test(renderer)) return 'low';
    return 'mid';
  } catch {
    return 'unknown';
  }
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
  const gpuTier = detectGpuTier();

  let tier: DeviceTier = 'full';

  // Hard blocks -> "off"
  if (!hasWebGL) tier = 'off';
  else if (prefersReducedMotion) tier = 'off';
  else if (isDataSaver) tier = 'off';
  else if (coreCount < 4) tier = 'off';
  else if (deviceMemory < 2) tier = 'off';
  else if (gpuTier === 'low') tier = 'off';
  // Soft downgrades -> "lite"
  else if (isMobile) tier = 'lite';
  else if (coreCount < 6) tier = 'lite';
  else if (deviceMemory < 4) tier = 'lite';
  else if (dpr > 2.5) tier = 'lite';

  return { tier, hasWebGL, prefersReducedMotion, coreCount, deviceMemory, dpr, isMobile, isDataSaver, gpuTier };
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
        enableDepthOfField: true,
        enableAtmosphere: true,
        enableCameraBreathing: true,
        enableHaze: true,
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
        enableDepthOfField: false,
        enableAtmosphere: true,
        enableCameraBreathing: true,
        enableHaze: false,
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
        enableDepthOfField: false,
        enableAtmosphere: false,
        enableCameraBreathing: false,
        enableHaze: false,
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

// ── Degraded preset builder ──────────────────────────────────────────

export function buildDegradedPreset(preset: ScenePreset): ScenePreset {
  return {
    ...preset,
    particleCount: Math.min(preset.particleCount, 400),
    enableChromaticAberration: false,
    enableDepthOfField: false,
    enableHaze: false,
    bloomIntensity: Math.min(preset.bloomIntensity, 0.8),
    maxDpr: Math.min(preset.maxDpr, 1.5),
    ringCount: Math.min(preset.ringCount, 2),
  };
}
