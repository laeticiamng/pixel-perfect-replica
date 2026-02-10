export type SignalType = 'green' | 'yellow' | 'red';

export type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'coworking' | 'other';

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
  university?: string;
}

export interface ActivityOption {
  id: ActivityType;
  label: string; // Keep label for backwards compatibility
  labelKey: string;
  emoji: string;
}

// Activity labels for each locale
export const ACTIVITY_LABELS: Record<ActivityType, { en: string; fr: string }> = {
  studying: { en: 'Study', fr: 'Réviser' },
  eating: { en: 'Eat', fr: 'Manger' },
  working: { en: 'Work', fr: 'Bosser' },
  talking: { en: 'Talk', fr: 'Discuter' },
  sport: { en: 'Sport', fr: 'Sport' },
  coworking: { en: 'Coworking', fr: 'Coworking' },
  other: { en: 'Other', fr: 'Autre' },
};

// Get activity label for current locale
export const getActivityLabel = (id: ActivityType, locale: 'en' | 'fr' = 'en'): string => {
  return ACTIVITY_LABELS[id]?.[locale] || ACTIVITY_LABELS[id]?.en || id;
};

// Activity options with translation keys
export const ACTIVITIES: ActivityOption[] = [
  { id: 'studying', label: 'Réviser', labelKey: 'activities.studying', emoji: '📚' },
  { id: 'sport', label: 'Sport', labelKey: 'activities.sport', emoji: '🏃' },
  { id: 'eating', label: 'Manger', labelKey: 'activities.eating', emoji: '🍽️' },
  { id: 'talking', label: 'Discuter', labelKey: 'activities.talking', emoji: '💬' },
  { id: 'coworking', label: 'Coworking', labelKey: 'activities.coworking', emoji: '🤝' },
  { id: 'other', label: 'Autre', labelKey: 'activities.other', emoji: '✨' },
];

// Activity configuration for UI components
export const ACTIVITY_CONFIG: Record<ActivityType, { label: string; emoji: string; color: string }> = {
  studying: { label: 'Réviser', emoji: '📚', color: 'bg-blue-500' },
  eating: { label: 'Manger', emoji: '🍽️', color: 'bg-orange-500' },
  working: { label: 'Bosser', emoji: '💻', color: 'bg-purple-500' },
  talking: { label: 'Discuter', emoji: '💬', color: 'bg-green-500' },
  sport: { label: 'Sport', emoji: '🏃', color: 'bg-red-500' },
  coworking: { label: 'Coworking', emoji: '🤝', color: 'bg-indigo-500' },
  other: { label: 'Autre', emoji: '✨', color: 'bg-gray-500' },
};

export const ICEBREAKERS: Record<ActivityType, string[]> = {
  studying: [
    "Tu prépares quel exam ?",
    "C'est quoi ta matière préférée ?",
  ],
  eating: [
    "Tu connais un bon resto dans le coin ?",
    "C'est bon ce que tu manges ?",
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
  coworking: [
    "Tu bosses sur quel projet ?",
    "Tu viens souvent coworker ici ?",
  ],
  other: [
    "Qu'est-ce qui t'amène ici ?",
    "Tu fais quoi de beau ?",
  ],
};

// Icebreakers with locale support
export const ICEBREAKERS_I18N: Record<ActivityType, { en: string[]; fr: string[] }> = {
  studying: {
    en: [
      "What exam are you preparing for?",
      "What's your favorite subject?",
      "What study method do you use?",
    ],
    fr: [
      "Tu prépares quel exam ?",
      "C'est quoi ta matière préférée ?",
      "Tu utilises quelle méthode pour réviser ?",
    ],
  },
  eating: {
    en: [
      "Is that good what you're eating?",
      "Do you know a good restaurant around here?",
    ],
    fr: [
      "C'est bon ce que tu manges ?",
      "Tu connais un bon resto dans le coin ?",
    ],
  },
  working: {
    en: [
      "What are you working on?",
      "Is it for work or a personal project?",
    ],
    fr: [
      "Tu bosses sur quoi ?",
      "C'est pour le taf ou un projet perso ?",
    ],
  },
  talking: {
    en: [
      "So, what's new?",
      "What do you do for a living?",
    ],
    fr: [
      "Alors, quoi de neuf ?",
      "Tu fais quoi dans la vie ?",
    ],
  },
  sport: {
    en: [
      "What sport do you do?",
      "Do you come here often?",
    ],
    fr: [
      "Tu fais quoi comme sport ?",
      "Tu viens souvent ici ?",
    ],
  },
  coworking: {
    en: [
      "What project are you working on?",
      "Do you cowork here often?",
    ],
    fr: [
      "Tu bosses sur quel projet ?",
      "Tu viens souvent coworker ici ?",
    ],
  },
  other: {
    en: [
      "What brings you here?",
      "What are you up to?",
    ],
    fr: [
      "Qu'est-ce qui t'amène ici ?",
      "Tu fais quoi de beau ?",
    ],
  },
};

// Get icebreaker for current locale
export const getIcebreaker = (activity: ActivityType, locale: 'en' | 'fr' = 'en'): string => {
  const icebreakers = ICEBREAKERS_I18N[activity]?.[locale] || ICEBREAKERS_I18N[activity]?.en || [];
  return icebreakers[Math.floor(Math.random() * icebreakers.length)] || '';
};
