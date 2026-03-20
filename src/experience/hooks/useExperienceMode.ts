import { shallow } from 'zustand/shallow';
import { useExperienceStore } from '@/experience/core/experience-store';

export function useExperienceMode() {
  return useExperienceStore(
    (state) => ({
      immersionLevel: state.immersionLevel,
      emotionalTone: state.emotionalTone,
      sceneMode: state.sceneMode,
      ambientDensity: state.ambientDensity,
      motionMode: state.motionMode,
      reducedExperience: state.reducedExperience,
      focusTarget: state.focusTarget,
    }),
    shallow,
  );
}
