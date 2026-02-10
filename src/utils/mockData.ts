import { NearbyUser, SignalType, ActivityType } from '@/types/signal';

const FIRST_NAMES = [
  'Marie', 'Thomas', 'Julie', 'Lucas', 'Emma', 'Hugo', 'Léa', 'Nathan',
  'Chloé', 'Théo', 'Camille', 'Raphaël', 'Inès', 'Adam', 'Jade',
  'Louis', 'Manon', 'Gabriel', 'Sarah', 'Arthur',
];

const UNIVERSITIES = [
  'Sorbonne Université', 'Sciences Po', 'Paris-Saclay', 'ESSEC',
  'Dauphine', 'ENS Ulm', 'EDHEC', 'Polytechnique', 'HEC',
  'Paris Descartes', 'Assas', 'Nanterre',
];

const SIGNALS: SignalType[] = ['green', 'green', 'green', 'green', 'yellow', 'yellow', 'red'];
const ACTIVITIES: ActivityType[] = ['studying', 'eating', 'working', 'talking', 'sport', 'other'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomPosition(centerLat: number, centerLng: number, radiusMeters: number) {
  const radiusDeg = radiusMeters / 111320;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusDeg;

  return {
    latitude: centerLat + distance * Math.cos(angle),
    longitude: centerLng + distance * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180),
  };
}

// Blur GPS to ~100m precision for privacy
function blurPosition(lat: number, lng: number): { latitude: number; longitude: number } {
  const blur = 0.0009; // ~100m
  return {
    latitude: lat + (Math.random() - 0.5) * blur,
    longitude: lng + (Math.random() - 0.5) * blur,
  };
}

export function generateMockUsers(
  centerLat: number = 48.8566,
  centerLng: number = 2.3522,
  count: number = 18
): NearbyUser[] {
  const users: NearbyUser[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const rawPos = generateRandomPosition(centerLat, centerLng, 500);
    const position = blurPosition(rawPos.latitude, rawPos.longitude);
    const activeSince = new Date(Date.now() - Math.random() * 3600000);

    // Pick a unique first name
    let firstName = getRandomElement(FIRST_NAMES);
    while (usedNames.has(firstName) && usedNames.size < FIRST_NAMES.length) {
      firstName = getRandomElement(FIRST_NAMES);
    }
    usedNames.add(firstName);

    const signal = getRandomElement(SIGNALS);

    users.push({
      id: `user-${i + 1}`,
      firstName,
      signal,
      activity: signal === 'red' ? 'other' : getRandomElement(ACTIVITIES),
      position,
      activeSince,
      rating: 3.5 + Math.random() * 1.5,
      university: getRandomElement(UNIVERSITIES),
    });
  }

  return users;
}

export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Session révision - BU Sorbonne',
    participants: ['Marie', 'Thomas', 'Julie'],
    lastMessage: 'On se retrouve au 2e étage ?',
    lastMessageTime: new Date(Date.now() - 300000),
    unreadCount: 2,
    isGroup: true,
  },
  {
    id: 'conv-2',
    name: 'Lucas',
    participants: ['Lucas'],
    lastMessage: 'Super session ! On remet ça demain ?',
    lastMessageTime: new Date(Date.now() - 1800000),
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: 'conv-3',
    name: 'Coworking Café Oberkampf',
    participants: ['Emma', 'Hugo', 'Léa', 'Nathan'],
    lastMessage: 'Hugo: J\'arrive dans 5 min !',
    lastMessageTime: new Date(Date.now() - 3600000),
    unreadCount: 5,
    isGroup: true,
  },
  {
    id: 'conv-4',
    name: 'Chloé',
    participants: ['Chloé'],
    lastMessage: 'Merci pour le cours de maths !',
    lastMessageTime: new Date(Date.now() - 7200000),
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: 'conv-5',
    name: 'Sport Parc Monceau',
    participants: ['Théo', 'Camille', 'Raphaël'],
    lastMessage: 'Théo: Même heure samedi ?',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 1,
    isGroup: true,
  },
];

export const MOCK_MESSAGES = [
  { id: 'm1', senderId: 'user-1', senderName: 'Marie', text: 'Hey ! Tu bosses sur quoi ?', time: new Date(Date.now() - 600000) },
  { id: 'm2', senderId: 'me', senderName: 'Moi', text: 'Exam de droit constitutionnel 😅', time: new Date(Date.now() - 540000) },
  { id: 'm3', senderId: 'user-1', senderName: 'Marie', text: 'Oh moi aussi ! On révise ensemble ?', time: new Date(Date.now() - 480000) },
  { id: 'm4', senderId: 'me', senderName: 'Moi', text: 'Carrément ! Je suis à la BU 2e étage', time: new Date(Date.now() - 420000) },
  { id: 'm5', senderId: 'user-2', senderName: 'Thomas', text: 'Je peux me joindre à vous ?', time: new Date(Date.now() - 360000) },
  { id: 'm6', senderId: 'user-1', senderName: 'Marie', text: 'Bien sûr ! Plus on est de fous 🎉', time: new Date(Date.now() - 300000) },
  { id: 'm7', senderId: 'user-2', senderName: 'Thomas', text: 'On se retrouve au 2e étage ?', time: new Date(Date.now() - 240000) },
];

export const DEFAULT_POSITION = {
  latitude: 48.8566,
  longitude: 2.3522,
  accuracy: 100,
};
