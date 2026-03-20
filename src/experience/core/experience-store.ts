import { create } from 'zustand';
import type { ExperienceEvent, ExperiencePreset, ImmersionLevel, MotionMode } from './experience-types';
import { reduceExperienceEvent, resolveRouteExperience } from './experience-orchestrator';

interface ExperienceState extends ExperiencePreset {
  motionMode: MotionMode;
  audioEnabled: boolean;
  reducedExperience: boolean;
  routeKey: string;
  setRouteExperience: (pathname: string, preset?: ExperiencePreset) => void;
  setImmersionLevel: (immersionLevel: ImmersionLevel) => void;
  setMotionMode: (motionMode: MotionMode) => void;
  setReducedExperience: (reducedExperience: boolean) => void;
  setAudioEnabled: (audioEnabled: boolean) => void;
  dispatchExperienceEvent: (event: ExperienceEvent) => void;
}

const INITIAL_PRESET = resolveRouteExperience('/');

export const useExperienceStore = create<ExperienceState>((set) => ({
  ...INITIAL_PRESET,
  motionMode: 'full',
  audioEnabled: false,
  reducedExperience: false,
  routeKey: '/',
  setRouteExperience: (pathname, preset) =>
    set({
      routeKey: pathname,
      ...(preset ?? resolveRouteExperience(pathname)),
    }),
  setImmersionLevel: (immersionLevel) => set({ immersionLevel }),
  setMotionMode: (motionMode) => set({ motionMode }),
  setReducedExperience: (reducedExperience) => set({ reducedExperience }),
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  dispatchExperienceEvent: (event) =>
    set((state) => ({
      ...state,
      ...reduceExperienceEvent(event, state),
    })),
}));
