export type SignalType = 'green' | 'yellow' | 'red';

export type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';

export interface Position {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  avatar?: string;
  university?: string;
  createdAt: Date;
  stats: {
    interactions: number;
    hoursActive: number;
    rating: number;
  };
}

export interface NearbyUser {
  id: string;
  firstName: string;
  signal: SignalType;
  activity: ActivityType;
  position: Position;
  distance?: number;
  activeSince: Date;
  rating: number;
}

export interface ActivityOption {
  id: ActivityType;
  label: string;
  emoji: string;
}

export const ACTIVITIES: ActivityOption[] = [
  { id: 'studying', label: 'Réviser', emoji: '📚' },
  { id: 'eating', label: 'Manger', emoji: '🍽️' },
  { id: 'working', label: 'Bosser', emoji: '💻' },
  { id: 'talking', label: 'Parler', emoji: '💬' },
  { id: 'sport', label: 'Sport', emoji: '🏃' },
  { id: 'other', label: 'Autre', emoji: '✨' },
];

export const ICEBREAKERS: Record<ActivityType, string[]> = {
  studying: [
    "Tu prépares quel exam ?",
    "C'est quoi ta matière préférée ?",
    "Tu utilises quelle méthode pour réviser ?",
  ],
  eating: [
    "C'est bon ce que tu manges ?",
    "Tu connais un bon resto dans le coin ?",
  ],
  working: [
    "Tu bosses sur quoi ?",
    "C'est pour le taf ou un projet perso ?",
  ],
  talking: [
    "Alors, quoi de neuf ?",
    "Tu fais quoi dans la vie ?",
  ],
  sport: [
    "Tu fais quoi comme sport ?",
    "Tu viens souvent ici ?",
  ],
  other: [
    "Qu'est-ce qui t'amène ici ?",
    "Tu fais quoi de beau ?",
  ],
};
