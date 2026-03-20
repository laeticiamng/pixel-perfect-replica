import { create } from 'zustand';
import { getDeviceCapabilities } from '@/components/landing/hero3d/deviceCapabilities';
import type { CapabilityState } from './experience-types';

interface CapabilityStore extends CapabilityState {
  syncCapabilities: () => void;
  setAudioEnabled: (audioEnabled: boolean) => void;
}

function getSafeFallback(): CapabilityState {
  return {
    gpuTier: 'unknown',
    tier: 'off',
    prefersReducedMotion: false,
    saveData: false,
    hasWebGL: false,
    audioEnabled: false,
    reducedExperience: true,
    dprCap: 1,
  };
}

function readCapabilities(): CapabilityState {
  if (typeof window === 'undefined' || /jsdom/i.test(navigator.userAgent)) {
    return getSafeFallback();
  }

  try {
    const caps = getDeviceCapabilities();

    return {
      gpuTier: caps.gpuTier,
      tier: caps.tier,
      prefersReducedMotion: caps.prefersReducedMotion,
      saveData: caps.isDataSaver,
      hasWebGL: caps.hasWebGL,
      audioEnabled: false,
      reducedExperience: caps.tier === 'off' || caps.prefersReducedMotion || caps.isDataSaver,
      dprCap: caps.tier === 'full' ? 2 : caps.tier === 'lite' ? 1.5 : 1,
    };
  } catch {
    return getSafeFallback();
  }
}

export const useCapabilityStore = create<CapabilityStore>((set) => ({
  ...readCapabilities(),
  syncCapabilities: () => set((state) => ({ ...state, ...readCapabilities() })),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
}));
