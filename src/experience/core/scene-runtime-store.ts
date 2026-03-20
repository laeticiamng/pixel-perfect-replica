import { create } from 'zustand';
import type { SceneMode } from './experience-types';

interface SceneRuntimeState {
  activeScene: SceneMode;
  transitionState: 'idle' | 'entering' | 'settling';
  triggerQueue: string[];
  setActiveScene: (activeScene: SceneMode) => void;
  setTransitionState: (transitionState: SceneRuntimeState['transitionState']) => void;
  queueTrigger: (trigger: string) => void;
  consumeTrigger: () => string | undefined;
}

export const useSceneRuntimeStore = create<SceneRuntimeState>((set, get) => ({
  activeScene: 'none',
  transitionState: 'idle',
  triggerQueue: [],
  setActiveScene: (activeScene) => set({ activeScene }),
  setTransitionState: (transitionState) => set({ transitionState }),
  queueTrigger: (trigger) => set((state) => ({ triggerQueue: [...state.triggerQueue, trigger] })),
  consumeTrigger: () => {
    const [nextTrigger, ...rest] = get().triggerQueue;
    set({ triggerQueue: rest });
    return nextTrigger;
  },
}));
