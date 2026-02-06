import { create } from 'zustand';
import { Position } from '@/types/signal';
import { DEFAULT_POSITION } from '@/utils/mockData';

interface LocationState {
  position: Position | null;
  isWatching: boolean;
  error: string | null;
  lastUpdated: Date | null;
  startWatching: () => void;
  stopWatching: () => void;
  setPosition: (position: Position) => void;
  setError: (error: string) => void;
}

let watchId: number | null = null;

export const useLocationStore = create<LocationState>((set, get) => ({
  position: null,
  isWatching: false,
  error: null,
  lastUpdated: null,

  startWatching: () => {
    if (!navigator.geolocation) {
      // Use default position for demo
      set({ 
        position: DEFAULT_POSITION, 
        lastUpdated: new Date(),
        error: 'geolocation_not_supported'
      });
      return;
    }

    set({ isWatching: true, error: null });

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        set({
          position: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          lastUpdated: new Date(),
          error: null,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.code, error.message);
        const errorMsg = error.code === 1
          ? 'location_denied'
          : 'location_unavailable';
        // Fallback to default position for demo mode, but preserve error for UI
        set({
          position: DEFAULT_POSITION,
          lastUpdated: new Date(),
          error: errorMsg,
          isWatching: true
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  },

  stopWatching: () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    set({ isWatching: false });
  },

  setPosition: (position: Position) => {
    set({ position, lastUpdated: new Date() });
  },

  setError: (error: string) => {
    set({ error });
  },
}));
