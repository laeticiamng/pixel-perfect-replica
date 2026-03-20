export { ExperienceProvider } from './core/ExperienceProvider';
export { useExperienceStore } from './core/experience-store';
export { useCapabilityStore } from './core/capability-store';
export { useSceneRuntimeStore } from './core/scene-runtime-store';
export { AmbientLayer } from './ambient/AmbientLayer';
export { useExperienceMode } from './hooks/useExperienceMode';
export { useCapabilityTier } from './hooks/useCapabilityTier';
export { useExperienceEvent } from './hooks/useExperienceEvent';
export type {
  CapabilityState,
  EmotionalTone,
  ExperienceEvent,
  ExperiencePreset,
  ImmersionLevel,
  MotionMode,
  SceneMode,
} from './core/experience-types';
