import { create } from 'zustand';
import { SignalType, ActivityType, NearbyUser, ICEBREAKERS } from '@/types/signal';
import { generateMockUsers } from '@/utils/mockData';
import { getDistanceBetweenPoints } from '@/utils/distance';

interface SignalState {
  mySignal: SignalType;
  myActivity: ActivityType | null;
  isActive: boolean;
  activeSince: Date | null;
  nearbyUsers: NearbyUser[];
  setSignal: (signal: SignalType) => void;
  setActivity: (activity: ActivityType) => void;
  activateSignal: (activity: ActivityType) => void;
  deactivateSignal: () => void;
  refreshNearbyUsers: (lat: number, lng: number) => void;
  getIcebreaker: (activity: ActivityType) => string;
  updateDistances: (userLat: number, userLng: number) => void;
}

export const useSignalStore = create<SignalState>((set, get) => ({
  mySignal: 'red',
  myActivity: null,
  isActive: false,
  activeSince: null,
  nearbyUsers: [],

  setSignal: (signal: SignalType) => {
    set({ mySignal: signal });
  },

  setActivity: (activity: ActivityType) => {
    set({ myActivity: activity });
  },

  activateSignal: (activity: ActivityType) => {
    set({
      mySignal: 'green',
      myActivity: activity,
      isActive: true,
      activeSince: new Date(),
    });
  },

  deactivateSignal: () => {
    set({
      mySignal: 'red',
      myActivity: null,
      isActive: false,
      activeSince: null,
    });
  },

  refreshNearbyUsers: (lat: number, lng: number) => {
    const users = generateMockUsers(lat, lng, 8);
    
    // Calculate distances
    const usersWithDistance = users.map(user => ({
      ...user,
      distance: getDistanceBetweenPoints(
        { latitude: lat, longitude: lng },
        user.position
      ),
    }));
    
    // Sort by distance
    usersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    set({ nearbyUsers: usersWithDistance });
  },

  updateDistances: (userLat: number, userLng: number) => {
    const { nearbyUsers } = get();
    
    const updatedUsers = nearbyUsers.map(user => ({
      ...user,
      distance: getDistanceBetweenPoints(
        { latitude: userLat, longitude: userLng },
        user.position
      ),
    }));
    
    set({ nearbyUsers: updatedUsers });
  },

  getIcebreaker: (activity: ActivityType) => {
    const icebreakers = ICEBREAKERS[activity];
    return icebreakers[Math.floor(Math.random() * icebreakers.length)];
  },
}));
