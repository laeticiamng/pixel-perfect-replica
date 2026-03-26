import { useShallow } from 'zustand/shallow';
import { useExperienceStore } from '@/experience/core/experience-store';

export function useExperienceMode() {
  return useExperienceStore(
    useShallow((state) => ({
      immersionLevel: state.immersionLevel,
      emotionalTone: state.emotionalTone,
      sceneMode: state.sceneMode,
      ambientDensity: state.ambientDensity,
      motionMode: state.motionMode,
      reducedExperience: state.reducedExperience,
      focusTarget: state.focusTarget,
    })),
  );
}
