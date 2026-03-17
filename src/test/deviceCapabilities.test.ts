import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDeviceCapabilities,
  getScenePreset,
  PerformanceRegressor,
  type DeviceTier,
} from '@/utils/deviceCapabilities';

// ── Tier detection tests ──────────────────────────────────────────────

describe('getDeviceCapabilities', () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  function mockEnv(overrides: {
    webgl?: boolean;
    reducedMotion?: boolean;
    cores?: number;
    memory?: number;
    dpr?: number;
    width?: number;
    saveData?: boolean;
  }) {
    const {
      webgl = true,
      reducedMotion = false,
      cores = 8,
      memory = 8,
      dpr = 1,
      width = 1920,
      saveData = false,
    } = overrides;

    // Mock canvas WebGL
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: (type: string) => (webgl && (type === 'webgl2' || type === 'webgl') ? {} : null),
    } as any);

    // Mock matchMedia for reduced motion
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: reducedMotion,
    } as any);

    Object.defineProperty(navigator, 'hardwareConcurrency', { value: cores, configurable: true });
    Object.defineProperty(navigator, 'deviceMemory', { value: memory, configurable: true });
    Object.defineProperty(navigator, 'connection', {
      value: saveData ? { saveData: true } : undefined,
      configurable: true,
    });
    Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
    Object.defineProperty(navigator, 'userAgent', {
      value: width < 768 ? 'Mobile' : 'Desktop',
      configurable: true,
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "full" for high-end desktop', () => {
    mockEnv({ cores: 8, memory: 16, dpr: 1 });
    const caps = getDeviceCapabilities();
    expect(caps.tier).toBe('full');
    expect(caps.hasWebGL).toBe(true);
  });

  it('returns "off" when WebGL is unavailable', () => {
    mockEnv({ webgl: false });
    expect(getDeviceCapabilities().tier).toBe('off');
  });

  it('returns "off" when prefers-reduced-motion', () => {
    mockEnv({ reducedMotion: true });
    const caps = getDeviceCapabilities();
    expect(caps.tier).toBe('off');
    expect(caps.prefersReducedMotion).toBe(true);
  });

  it('returns "off" when data saver is active', () => {
    mockEnv({ saveData: true });
    expect(getDeviceCapabilities().tier).toBe('off');
  });

  it('returns "off" for very low core count', () => {
    mockEnv({ cores: 2 });
    expect(getDeviceCapabilities().tier).toBe('off');
  });

  it('returns "lite" for mobile viewport', () => {
    mockEnv({ width: 375 });
    expect(getDeviceCapabilities().tier).toBe('lite');
  });

  it('returns "lite" for mid-range CPU', () => {
    mockEnv({ cores: 4 });
    expect(getDeviceCapabilities().tier).toBe('lite');
  });

  it('returns "lite" for high DPR', () => {
    mockEnv({ dpr: 3 });
    expect(getDeviceCapabilities().tier).toBe('lite');
  });
});

// ── Scene presets ─────────────────────────────────────────────────────

describe('getScenePreset', () => {
  it('full tier has 1200 particles', () => {
    const preset = getScenePreset('full');
    expect(preset.particleCount).toBe(1200);
    expect(preset.enableBloom).toBe(true);
    expect(preset.enableChromaticAberration).toBe(true);
    expect(preset.ringCount).toBe(3);
  });

  it('lite tier has reduced particles', () => {
    const preset = getScenePreset('lite');
    expect(preset.particleCount).toBe(400);
    expect(preset.enableChromaticAberration).toBe(false);
    expect(preset.ringCount).toBe(2);
  });

  it('off tier has zero particles and no effects', () => {
    const preset = getScenePreset('off');
    expect(preset.particleCount).toBe(0);
    expect(preset.enableBloom).toBe(false);
    expect(preset.enableVignette).toBe(false);
    expect(preset.ringCount).toBe(0);
  });
});

// ── Performance regressor ─────────────────────────────────────────────

describe('PerformanceRegressor', () => {
  it('triggers callback when frame time exceeds threshold', () => {
    const onRegress = vi.fn();
    const regressor = new PerformanceRegressor(onRegress, { sampleSize: 5, targetFps: 30 });

    // Feed 5 frames at ~20fps (50ms each), which exceeds 33.3ms threshold
    for (let i = 0; i < 6; i++) {
      regressor.sample(50);
    }

    expect(onRegress).toHaveBeenCalledOnce();
  });

  it('does not trigger when performance is good', () => {
    const onRegress = vi.fn();
    const regressor = new PerformanceRegressor(onRegress, { sampleSize: 5, targetFps: 30 });

    // Feed 5 frames at 60fps (16.6ms each)
    for (let i = 0; i < 6; i++) {
      regressor.sample(16.6);
    }

    expect(onRegress).not.toHaveBeenCalled();
  });

  it('only triggers once', () => {
    const onRegress = vi.fn();
    const regressor = new PerformanceRegressor(onRegress, { sampleSize: 3, targetFps: 30 });

    for (let i = 0; i < 20; i++) {
      regressor.sample(50);
    }

    expect(onRegress).toHaveBeenCalledOnce();
  });

  it('can be reset', () => {
    const onRegress = vi.fn();
    const regressor = new PerformanceRegressor(onRegress, { sampleSize: 3, targetFps: 30 });

    for (let i = 0; i < 5; i++) regressor.sample(50);
    expect(onRegress).toHaveBeenCalledOnce();

    regressor.reset();
    for (let i = 0; i < 5; i++) regressor.sample(50);
    expect(onRegress).toHaveBeenCalledTimes(2);
  });
});
