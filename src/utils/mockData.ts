import { NearbyUser, SignalType, ActivityType } from '@/types/signal';

const FIRST_NAMES = ['Marie', 'Thomas', 'Julie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan', 'Chloé', 'Théo'];
const SIGNALS: SignalType[] = ['green', 'green', 'green', 'yellow'];
const ACTIVITIES: ActivityType[] = ['studying', 'eating', 'working', 'talking', 'sport', 'other'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPosition(centerLat: number, centerLng: number, radiusMeters: number) {
  // Convert radius to degrees (approximate)
  const radiusDeg = radiusMeters / 111320;
  
  // Random angle and distance
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusDeg;
  
  return {
    latitude: centerLat + distance * Math.cos(angle),
    longitude: centerLng + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180),
  };
}

export function generateMockUsers(
  centerLat: number = 48.8566,
  centerLng: number = 2.3522,
  count: number = 8
): NearbyUser[] {
  const users: NearbyUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const position = generateRandomPosition(centerLat, centerLng, 300);
    const activeSince = new Date(Date.now() - Math.random() * 3600000); // Up to 1 hour ago
    
    users.push({
      id: `user-${i + 1}`,
      firstName: getRandomElement(FIRST_NAMES),
      signal: getRandomElement(SIGNALS),
      activity: getRandomElement(ACTIVITIES),
      position,
      activeSince,
      rating: 4 + Math.random() * 1, // 4.0 to 5.0
    });
  }
  
  return users;
}

export const DEFAULT_POSITION = {
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 10,
};
