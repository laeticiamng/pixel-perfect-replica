/**
 * Hero3D module barrel export.
 *
 * Public API for the modular 3D hero scene.
 */

// Types
export type { DeviceTier, DeviceCapabilities, ScenePreset, ScrollRefProp, OrbOffsetProp } from './types';
export { ORB_OFFSET } from './types';

// Device capabilities & presets
export {
  getDeviceCapabilities,
  shouldEnable3D,
  getScenePreset,
  PerformanceRegressor,
  buildDegradedPreset,
} from './deviceCapabilities';

// Scene components
export { SceneController } from './SceneController';
export { OrganicOrb } from './OrganicOrb';
export { ParticleField } from './ParticleField';
export { OrbitalRings } from './OrbitalRings';
export { HeroPostFX } from './HeroPostFX';
export { AtmosphereFog } from './AtmosphereFog';
export { CameraBreathing } from './CameraBreathing';
