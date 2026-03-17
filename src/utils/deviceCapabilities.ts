/**
 * Device capability detection for 3D scene activation.
 *
 * Centralised decision function that determines which rendering tier
 * the current device should use.  This avoids scattered feature-detection
 * across the codebase and makes it trivial to tweak thresholds.
 *
 * Tiers:
 *   "full"    – Desktop / high-end mobile.  All effects enabled.
 *   "lite"    – Mid-range mobile / older laptop.  Reduced particles,
 *               simpler postprocessing, lower DPR.
 *   "off"     – No WebGL, low-end device, reduced-motion, data-saver.
 *               Falls back to the pure-CSS orbs.
 */

export type DeviceTier = 'full' | 'lite' | 'off';

export interface DeviceCapabilities {
  tier: DeviceTier;
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  coreCount: number;
  deviceMemory: number; // GB, defaults to 4 when unavailable
  dpr: number;
  isMobile: boolean;
  isDataSaver: boolean;
}

// ---------- helpers ---------------------------------------------------------

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
  // @ts-expect-error – non-standard API, may not exist
  return navigator.connection?.saveData === true;
}

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
}

// ---------- main decision function ------------------------------------------

/**
 * Evaluate current device and return the recommended 3D tier.
 *
 * Call once at mount time; the result should be cached (e.g. via useMemo).
 * The function is synchronous and cheap.
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  const hasWebGL = detectWebGL();
  const prefersReducedMotion = detectReducedMotion();
  const coreCount = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 2) : 2;
  // @ts-expect-error – deviceMemory is non-standard
  const deviceMemory: number = typeof navigator !== 'undefined' ? (navigator.deviceMemory ?? 4) : 4;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1;
  const isMobile = detectMobile();
  const isDataSaver = detectDataSaver();

  // ---- tier decision ----
  let tier: DeviceTier = 'full';

  // Hard blocks → "off"
  if (!hasWebGL) tier = 'off';
  else if (prefersReducedMotion) tier = 'off';
  else if (isDataSaver) tier = 'off';
  else if (coreCount < 4) tier = 'off';
  else if (deviceMemory < 2) tier = 'off';

  // Soft downgrades → "lite"
  else if (isMobile) tier = 'lite';
  else if (coreCount < 6) tier = 'lite';
  else if (deviceMemory < 4) tier = 'lite';
  else if (dpr > 2.5) tier = 'lite'; // very high DPR = expensive fill rate

  return {
    tier,
    hasWebGL,
    prefersReducedMotion,
    coreCount,
    deviceMemory,
    dpr,
    isMobile,
    isDataSaver,
  };
}

/**
 * Shorthand – returns true only when tier !== 'off'.
 */
export function shouldEnable3D(): boolean {
  return getDeviceCapabilities().tier !== 'off';
}

// ---------- per-tier presets ------------------------------------------------

export interface ScenePreset {
  particleCount: number;
  connectionNodeCount: number;
  icosahedronDetail: number;       // subdivisions for the organic sphere
  innerGlowDetail: number;
  ringSegments: number;
  enableBloom: boolean;
  enableChromaticAberration: boolean;
  enableVignette: boolean;
  enableNoise: boolean;
  bloomIntensity: number;
  maxDpr: number;
  enableConnectionLines: boolean;
}

export function getScenePreset(tier: DeviceTier): ScenePreset {
  switch (tier) {
    case 'full':
      return {
        particleCount: 200,          // reduced from 300 – still plenty
        connectionNodeCount: 40,      // reduced from 50
        icosahedronDetail: 64,        // reduced from 96 – visually identical
        innerGlowDetail: 24,          // reduced from 32
        ringSegments: 100,            // reduced from 160
        enableBloom: true,
        enableChromaticAberration: true,
        enableVignette: true,
        enableNoise: false,           // film grain is barely visible, costs a pass
        bloomIntensity: 1.4,
        maxDpr: 2,
        enableConnectionLines: true,
      };
    case 'lite':
      return {
        particleCount: 80,
        connectionNodeCount: 0,       // connection lines off on mobile
        icosahedronDetail: 32,
        innerGlowDetail: 16,
        ringSegments: 64,
        enableBloom: true,
        enableChromaticAberration: false,
        enableVignette: true,
        enableNoise: false,
        bloomIntensity: 1.0,
        maxDpr: 1.5,
        enableConnectionLines: false,
      };
    case 'off':
    default:
      // Should never be used directly – caller should render CSS fallback
      return {
        particleCount: 0,
        connectionNodeCount: 0,
        icosahedronDetail: 16,
        innerGlowDetail: 8,
        ringSegments: 32,
        enableBloom: false,
        enableChromaticAberration: false,
        enableVignette: false,
        enableNoise: false,
        bloomIntensity: 0,
        maxDpr: 1,
        enableConnectionLines: false,
      };
  }
}
