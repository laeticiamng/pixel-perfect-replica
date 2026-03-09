export type HealthStatus = 'vert' | 'orange' | 'rouge';
export type PlatformPhase = 'production' | 'prototype';

export interface PlatformKpi {
  id: string;
  nom: string;
  url: string;
  siteUrl: string;
  description: string;
  modules: number;
  uptime: number;
  utilisateursActifs: number;
  derniereMaj: string;
  alertesOuvertes: number;
  healthStatus: HealthStatus;
  actionsCritiquesEnAttente: number;
  variationHebdo: number;
  phase: PlatformPhase;
  evolutions: number;
  structures: number;
  tests: number;
  versions: number;
  integrations: number;
  tags: string[];
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

export const companyInfo = {
  nom: 'EMOTIONSCARE SASU',
  siren: '944 505 445',
  siege: '80000 Amiens, France',
  email: 'contact@emotionscare.com',
  linkedinFounder: 'https://www.linkedin.com/in/laeticiamotongane/',
  linkedinCompany: 'https://www.linkedin.com/company/emotionscare/',
  founderName: 'Motongane Laeticia',
  horaires: 'Lun - Ven : 9h00 - 18h00',
  siteVitrine: 'https://president-cockpit-hq.lovable.app',
  totalPlatformes: 10,
  totalEvolutions: 18500,
  totalTests: 1600,
  totalStructures: 950,
  totalIntegrations: 392,
};

export const platformsMock: PlatformKpi[] = [
  {
    id: 'emotionscare',
    nom: 'EmotionsCare',
    url: 'https://emotionscare.com',
    siteUrl: 'https://emotionscare.com/',
    description: 'Première plateforme française dédiée au bien-être émotionnel des soignants et étudiants en médecine.',
    modules: 37,
    uptime: 99.94,
    utilisateursActifs: 1294,
    derniereMaj: '2026-02-04T07:10:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 4.8,
    phase: 'production',
    evolutions: 7700,
    structures: 723,
    tests: 294,
    versions: 635,
    integrations: 261,
    tags: ['Scan émotionnel IA', 'Coach IA Nyvée', 'Musicothérapie Suno', 'Dashboard B2B RH', 'Gamification XP'],
  },
  {
    id: 'nearvity',
    nom: 'NEARVITY',
    url: 'https://nearvity.lovable.app',
    siteUrl: 'https://nearvity.lovable.app/',
    description: 'Application de connexion sociale en temps réel pour étudiants. Radar intelligent, sessions binôme, mode fantôme.',
    modules: 10,
    uptime: 99.62,
    utilisateursActifs: 842,
    derniereMaj: '2026-01-26T18:40:00.000Z',
    alertesOuvertes: 1,
    healthStatus: 'orange',
    actionsCritiquesEnAttente: 1,
    variationHebdo: 2.1,
    phase: 'prototype',
    evolutions: 847,
    structures: 15,
    tests: 42,
    versions: 4,
    integrations: 8,
    tags: ['Radar temps réel', '3 états de signal', 'Sessions binôme', 'Ghost mode', 'Export GDPR'],
  },
  {
    id: 'system-compass',
    nom: 'System Compass',
    url: 'https://world-alignment.lovable.app',
    siteUrl: 'https://world-alignment.lovable.app/',
    description: 'Intelligence décisionnelle pour la relocalisation internationale. Analyse 50+ pays avec simulation fiscale.',
    modules: 20,
    uptime: 99.87,
    utilisateursActifs: 376,
    derniereMaj: '2026-02-04T05:20:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 1.6,
    phase: 'production',
    evolutions: 1300,
    structures: 57,
    tests: 718,
    versions: 1,
    integrations: 25,
    tags: ['Exit Keys personnalisées', 'Profils 50+ pays', 'Simulateur fiscal', 'TraceOS audit', 'Life Game gamifié'],
  },
  {
    id: 'growth-copilot',
    nom: 'Growth Copilot',
    url: 'https://www.agent-growth-automator.com',
    siteUrl: 'https://www.agent-growth-automator.com/',
    description: '39 experts IA couvrant 11 départements métier. Validation présidentielle et planification automatisée.',
    modules: 11,
    uptime: 99.45,
    utilisateursActifs: 154,
    derniereMaj: '2026-02-04T08:32:00.000Z',
    alertesOuvertes: 1,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 1,
    variationHebdo: -1.4,
    phase: 'production',
    evolutions: 2100,
    structures: 30,
    tests: 128,
    versions: 5,
    integrations: 25,
    tags: ['39 experts IA', '11 départements métier', 'Validation présidentielle', 'Commandes vocales', 'Planification automatisée'],
  },
  {
    id: 'med-mng',
    nom: 'Med MNG',
    url: 'https://medmng.com',
    siteUrl: 'https://medmng.com/',
    description: 'Apprentissage médical révolutionnaire par la musique IA. Chaque item ECN/EDN devient une chanson.',
    modules: 15,
    uptime: 99.71,
    utilisateursActifs: 489,
    derniereMaj: '2026-02-04T06:50:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 3.4,
    phase: 'production',
    evolutions: 4500,
    structures: 50,
    tests: 156,
    versions: 238,
    integrations: 30,
    tags: ['Copilote médical IA', 'Génération musicale IA', 'Écoute en continu', 'Recherche médicale IA', 'Disponible hors connexion'],
  },
  {
    id: 'urgence-os',
    nom: 'UrgenceOS',
    url: 'https://flow-pulse-assist.lovable.app',
    siteUrl: 'https://flow-pulse-assist.lovable.app/',
    description: 'Application temps réel pour le parcours patient aux urgences. Board panoramique, tri IOA intelligent.',
    modules: 7,
    uptime: 99.31,
    utilisateursActifs: 214,
    derniereMaj: '2026-02-04T04:45:00.000Z',
    alertesOuvertes: 1,
    healthStatus: 'orange',
    actionsCritiquesEnAttente: 1,
    variationHebdo: -0.6,
    phase: 'prototype',
    evolutions: 320,
    structures: 12,
    tests: 45,
    versions: 3,
    integrations: 6,
    tags: ['Board panoramique temps réel', 'Pancarte IDE 1 tap', 'Tri IOA intelligent', 'Dossier patient complet', 'Audit trail médical'],
  },
  {
    id: 'track-triumph',
    nom: 'Track Triumph',
    url: 'https://track-triumph-tavern.lovable.app',
    siteUrl: 'https://track-triumph-tavern.lovable.app/',
    description: 'Compétition musicale communautaire. Soumissions hebdomadaires, votes, classements et Hall of Fame.',
    modules: 12,
    uptime: 99.77,
    utilisateursActifs: 623,
    derniereMaj: '2026-02-04T22:15:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 6.2,
    phase: 'production',
    evolutions: 580,
    structures: 18,
    tests: 72,
    versions: 6,
    integrations: 10,
    tags: ['Soumissions hebdomadaires', 'Votes communautaires', 'Classements par catégorie', 'Hall of Fame', 'Feedback IA'],
  },
  {
    id: 'gouvernance-ia',
    nom: 'Gouvernance Agents IA',
    url: 'https://trust-seal-chain.lovable.app',
    siteUrl: 'https://trust-seal-chain.lovable.app/',
    description: 'Certification et traçabilité des agents IA. Scoring éthique et conformité AI Act européen.',
    modules: 8,
    uptime: 99.65,
    utilisateursActifs: 187,
    derniereMaj: '2026-02-28T10:00:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 1.2,
    phase: 'prototype',
    evolutions: 450,
    structures: 20,
    tests: 85,
    versions: 3,
    integrations: 12,
    tags: ['Trust Seal certification', 'Audit trail IA', 'Scoring éthique', 'Conformité AI Act', 'Registre agents'],
  },
  {
    id: 'studybeats',
    nom: 'StudyBeats',
    url: 'https://learn-jams.lovable.app',
    siteUrl: 'https://learn-jams.lovable.app/',
    description: 'Transformez vos cours en chansons mémorables. 30 styles musicaux, quiz automatiques, neurosciences cognitives.',
    modules: 8,
    uptime: 99.58,
    utilisateursActifs: 312,
    derniereMaj: '2026-03-06T09:00:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'vert',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 2.8,
    phase: 'production',
    evolutions: 500,
    structures: 15,
    tests: 60,
    versions: 2,
    integrations: 10,
    tags: ['30 styles musicaux', 'Import PDF/photo/texte', 'Quiz automatiques', 'Écoute hors ligne', 'Neurosciences cognitives'],
  },
  {
    id: 'vascular-atlas',
    nom: 'Vascular Atlas',
    url: 'https://vessel-pathway-compass.lovable.app',
    siteUrl: 'https://vessel-pathway-compass.lovable.app/',
    description: 'Plateforme clinique augmentée par l\'IA pour la médecine vasculaire. Jumeau numérique, registre mondial.',
    modules: 6,
    uptime: 99.40,
    utilisateursActifs: 98,
    derniereMaj: '2026-03-06T11:30:00.000Z',
    alertesOuvertes: 0,
    healthStatus: 'orange',
    actionsCritiquesEnAttente: 0,
    variationHebdo: 0.5,
    phase: 'prototype',
    evolutions: 150,
    structures: 10,
    tests: 30,
    versions: 2,
    integrations: 5,
    tags: ['Assistant clinique IA', 'Jumeau numérique vasculaire', 'Registre mondial des résultats', 'Certification & CME', 'Simulation clinique'],
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
    creeLe: '2026-03-09T08:15:00.000Z',
  },
  {
    id: 'VAL-1025',
    plateformeId: 'urgence-os',
    titre: 'Modification protocole triage API',
    description: 'Activation d\'une nouvelle règle de priorisation des urgences niveau 2.',
    auteur: 'Ops Lead • UrgenceOS',
    niveauRisque: 'eleve',
    creeLe: '2026-03-09T07:58:00.000Z',
  },
  {
    id: 'VAL-1027',
    plateformeId: 'nearvity',
    titre: 'A/B test onboarding social Erasmus+',
    description: 'Déploiement graduel à 25% des nouveaux inscrits du module Erasmus+.',
    auteur: 'Product Lead • NEARVITY',
    niveauRisque: 'modere',
    creeLe: '2026-03-09T06:40:00.000Z',
  },
  {
    id: 'VAL-1028',
    plateformeId: 'gouvernance-ia',
    titre: 'Activation scoring éthique AI Act v2',
    description: 'Mise à jour des critères de conformité selon le règlement européen AI Act 2026.',
    auteur: 'Legal & Compliance • Gouvernance IA',
    niveauRisque: 'modere',
    creeLe: '2026-03-08T14:20:00.000Z',
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
  {
    id: 'VEILLE-4',
    source: 'EU AI Act Implementation Report',
    tendance: 'Certification agents IA obligatoire',
    impact: 'fort',
    resume: 'Les registres d\'agents IA deviennent obligatoires pour les systèmes à haut risque dès septembre 2026.',
  },
  {
    id: 'VEILLE-5',
    source: 'Nature Neuroscience Education',
    tendance: 'Apprentissage par la musique',
    impact: 'moyen',
    resume: 'Études confirmant un gain de rétention de 40% via l\'encodage musical des connaissances médicales.',
  },
];
