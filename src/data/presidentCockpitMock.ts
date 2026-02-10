export type HealthStatus = 'vert' | 'orange' | 'rouge';

export interface PlatformKpi {
  id: string;
  nom: string;
  url: string;
  modules: number;
  uptime: number;
  utilisateursActifs: number;
  derniereMaj: string;
  alertesOuvertes: number;
  healthStatus: HealthStatus;
  actionsCritiquesEnAttente: number;
  variationHebdo: number;
}

export interface ActionValidation {
  id: string;
  plateformeId: string;
  titre: string;
  description: string;
  auteur: string;
  niveauRisque: 'faible' | 'modere' | 'eleve';
  creeLe: string;
}

export interface StrategicWatchItem {
  id: string;
  source: string;
  tendance: string;
  impact: 'faible' | 'moyen' | 'fort';
  resume: string;
}

export const platformsMock: PlatformKpi[] = [
  {
    id: 'emotionscare',
    nom: 'EmotionsCare',
    url: 'https://emotionscare.com',
    modules: 37,
    uptime: 99.94,
    utilisateursActifs: 1294,
    derniereMaj: '2026-02-10T07:10:00.000Z',
    alertesOuvertes: 1,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 2,
    variationHebdo: 4.8,
  },
  {
    id: 'nearvity',
    nom: 'NEARVITY',
    url: 'https://pixel-perfect-clone-6574.lovable.app',
    modules: 10,
    uptime: 99.62,
    utilisateursActifs: 842,
    derniereMaj: '2026-02-09T18:40:00.000Z',
    alertesOuvertes: 2,
    healthStatus: 'orange',
    actionsCritiquesEnAttente: 1,
    variationHebdo: 2.1,
  },
  {
    id: 'system-compass',
    nom: 'System Compass',
    url: 'https://world-alignment.lovable.app',
    modules: 20,
    uptime: 99.87,
    utilisateursActifs: 376,
    derniereMaj: '2026-02-10T05:20:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 1.6,
  },
  {
    id: 'growth-copilot',
    nom: 'Growth Copilot',
    url: 'https://agent-growth-automator.com',
    modules: 39,
    uptime: 98.91,
    utilisateursActifs: 154,
    derniereMaj: '2026-02-10T08:32:00.000Z',
    alertesOuvertes: 3,
    healthStatus: 'rouge',
    actionsCritiquesEnAttente: 3,
    variationHebdo: -1.4,
  },
  {
    id: 'med-mng',
    nom: 'Med MNG',
    url: 'https://medmng.com',
    modules: 15,
    uptime: 99.71,
    utilisateursActifs: 489,
    derniereMaj: '2026-02-10T06:50:00.000Z',
    alertesOuvertes: 1,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 1,
    variationHebdo: 3.4,
  },
  {
    id: 'urgence-os',
    nom: 'UrgenceOS',
    url: 'https://flow-pulse-assist.lovable.app',
    modules: 7,
    uptime: 99.31,
    utilisateursActifs: 214,
    derniereMaj: '2026-02-10T04:45:00.000Z',
    alertesOuvertes: 2,
    healthStatus: 'orange',
    actionsCritiquesEnAttente: 2,
    variationHebdo: -0.6,
  },
  {
    id: 'track-triumph',
    nom: 'Track Triumph',
    url: 'https://track-triumph-tavern.lovable.app',
    modules: 12,
    uptime: 99.77,
    utilisateursActifs: 623,
    derniereMaj: '2026-02-09T22:15:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 1,
    variationHebdo: 6.2,
  },
];

export const pendingValidationsMock: ActionValidation[] = [
  {
    id: 'VAL-1024',
    plateformeId: 'growth-copilot',
    titre: 'Déploiement modèle scoring v3',
    description: 'Mise en production du nouveau moteur de scoring IA sur les 11 départements.',
    auteur: 'CTO • Growth Copilot',
    niveauRisque: 'eleve',
    creeLe: '2026-02-10T08:15:00.000Z',
  },
  {
    id: 'VAL-1025',
    plateformeId: 'urgence-os',
    titre: 'Modification protocole triage API',
    description: 'Activation d\'une nouvelle règle de priorisation des urgences niveau 2.',
    auteur: 'Ops Lead • UrgenceOS',
    niveauRisque: 'eleve',
    creeLe: '2026-02-10T07:58:00.000Z',
  },
  {
    id: 'VAL-1027',
    plateformeId: 'nearvity',
    titre: 'A/B test onboarding social',
    description: 'Déploiement graduel à 25% des nouveaux inscrits.',
    auteur: 'Product Lead • NEARVITY',
    niveauRisque: 'modere',
    creeLe: '2026-02-10T06:40:00.000Z',
  },
];

export const strategicWatchMock: StrategicWatchItem[] = [
  {
    id: 'VEILLE-1',
    source: 'McKinsey Digital Health Q1 2026',
    tendance: 'Plateformes de télésuivi émotionnel',
    impact: 'fort',
    resume: 'La demande hospitalière pour des outils de prévention du burn-out augmente de 34% en Europe.',
  },
  {
    id: 'VEILLE-2',
    source: 'Product Hunt',
    tendance: 'Social campus assisté par IA',
    impact: 'moyen',
    resume: 'Émergence de concurrents orientés matching contextuel en temps réel pour étudiants.',
  },
  {
    id: 'VEILLE-3',
    source: 'French Tech Health',
    tendance: 'Interopérabilité API hôpital',
    impact: 'fort',
    resume: 'Nouvelles recommandations d\'intégration sécurisée pour les SaaS santé dès T2 2026.',
  },
];
