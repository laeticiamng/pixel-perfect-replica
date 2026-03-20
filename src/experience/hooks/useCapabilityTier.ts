import { shallow } from 'zustand/shallow';
import { useCapabilityStore } from '@/experience/core/capability-store';

export function useCapabilityTier() {
  return useCapabilityStore(
    (state) => ({
      tier: state.tier,
      gpuTier: state.gpuTier,
      prefersReducedMotion: state.prefersReducedMotion,
      reducedExperience: state.reducedExperience,
      hasWebGL: state.hasWebGL,
      dprCap: state.dprCap,
    }),
    shallow,
  );
}
