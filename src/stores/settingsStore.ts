import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  ghostMode: boolean;
  visibilityDistance: number;
  pushNotifications: boolean;
  soundNotifications: boolean;
  proximityVibration: boolean;
  showDemoSignals: boolean;
  hasSeenLocationPrompt: boolean;
  setGhostMode: (value: boolean) => void;
  setVisibilityDistance: (value: number) => void;
  setPushNotifications: (value: boolean) => void;
  setSoundNotifications: (value: boolean) => void;
  setProximityVibration: (value: boolean) => void;
  setShowDemoSignals: (value: boolean) => void;
  setHasSeenLocationPrompt: (value: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  ghostMode: false,
  visibilityDistance: 200,
  pushNotifications: true,
  soundNotifications: true,
  proximityVibration: true,
  showDemoSignals: true,
  hasSeenLocationPrompt: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setGhostMode: (value: boolean) => set({ ghostMode: value }),
      setVisibilityDistance: (value: number) => set({ visibilityDistance: value }),
      setPushNotifications: (value: boolean) => set({ pushNotifications: value }),
      setSoundNotifications: (value: boolean) => set({ soundNotifications: value }),
      setProximityVibration: (value: boolean) => set({ proximityVibration: value }),
      setShowDemoSignals: (value: boolean) => set({ showDemoSignals: value }),
      setHasSeenLocationPrompt: (value: boolean) => set({ hasSeenLocationPrompt: value }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'signal-settings-storage',
    }
  )
);
