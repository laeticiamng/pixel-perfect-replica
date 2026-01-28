import { Position } from '@/types/signal';

// Haversine formula to calculate distance between two coordinates
export function getDistanceBetweenPoints(pos1: Position, pos2: Position): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (pos1.latitude * Math.PI) / 180;
  const φ2 = (pos2.latitude * Math.PI) / 180;
  const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
  const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function formatDistance(meters: number): string {
  if (meters < 10) {
    return 'À quelques pas';
  } else if (meters < 50) {
    return `À ${Math.round(meters)}m`;
  } else if (meters < 100) {
    return `À ~${Math.round(meters / 10) * 10}m`;
  } else if (meters < 1000) {
    return `À ~${Math.round(meters / 50) * 50}m`;
  } else {
    return `À ${(meters / 1000).toFixed(1)}km`;
  }
}

export function formatTimeSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Depuis ${diffMins}min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Depuis ${diffHours}h`;
  
  return `Depuis ${Math.floor(diffHours / 24)}j`;
}
