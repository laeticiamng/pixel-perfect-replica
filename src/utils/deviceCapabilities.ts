/**
 * Re-exports from the hero3d module for backward compatibility.
 * The canonical source is now src/components/landing/hero3d/deviceCapabilities.ts
 */

export type { DeviceTier, DeviceCapabilities, ScenePreset } from '@/components/landing/hero3d/types';
export {
  getDeviceCapabilities,
  shouldEnable3D,
  getScenePreset,
  PerformanceRegressor,
  buildDegradedPreset,
} from '@/components/landing/hero3d/deviceCapabilities';
