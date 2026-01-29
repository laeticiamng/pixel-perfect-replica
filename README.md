# 📡 Signal - Connecte-toi IRL

**Signal** est une application mobile-first qui permet aux étudiants et jeunes actifs de se rejoindre spontanément dans la vraie vie. Active ton signal pour indiquer que tu es ouvert aux rencontres, découvre qui est disponible autour de toi sur le radar, et brise la glace facilement.

![Signal App](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Cloud-green) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

---

## 📋 Métadonnées Projet

| Champ | Valeur |
|-------|--------|
| Version cible | 1.0.0 |
| Priorité | P1 - Haute |
| Durée totale | 16-20 semaines |
| Budget total | 80-120k€ |
| Équipe | 5 pers (2 full-stack, 1 mobile, 1 growth hacker, 1 designer) |

---

## 🚨 Failles à Éliminer

| # | Faille | Solution | Sprint |
|---|--------|----------|--------|
| F1 | Chicken-and-egg | Lancement concentré 1 campus puis expansion | S10-S16 |
| F2 | Consommation batterie | Geofencing intelligent + mode économie | S3-S6 |
| F3 | Risque sécurité physique | Vérification sociale + bouton alerte | S4-S8 |
| F4 | Imprécision indoor | Beacons BLE + WiFi fingerprinting | S6-S10 |
| F5 | Monétisation floue | B2B établissements + premium users | S12-S16 |

---

## 🎯 Axes Différenciants

| # | Axe | Implémentation | Sprint |
|---|-----|----------------|--------|
| A1 | Lancement campus ciblé | Playbook + ambassadeurs + événement | S10-S16 |
| A2 | Beacons indoor | Partenariats cafés/BU | S6-S10 |
| A3 | Mode événement | Activation temporaire pour soirées | S8-S12 |
| A4 | Dashboard B2B | Analytics établissements partenaires | S10-S14 |
| A5 | Vérification sociale | LinkedIn, Instagram, email .edu | S4-S8 |

---

## 🚀 Fonctionnalités Core

### 🎯 Features Principales

| Fonctionnalité | Description |
|----------------|-------------|
| **Radar temps réel** | Visualise les personnes disponibles autour de toi sur un radar interactif |
| **Système de signal** | 3 états : 🟢 Vert (ouvert), 🟡 Jaune (occupé mais dispo), 🔴 Rouge (indisponible) |
| **Activités** | Indique ce que tu fais : 📚 Réviser, 🍽️ Manger, 💻 Bosser, 💬 Parler, 🏃 Sport, ✨ Autre |
| **Icebreakers** | Suggestions de phrases d'accroche contextuelles basées sur l'activité |
| **Révélation progressive** | Rapproche-toi à moins de 50m pour voir le profil complet |

### 🔒 Confidentialité & Sécurité

| Fonctionnalité | Description |
|----------------|-------------|
| **Ghost Mode** | Masque ta présence sur le radar des autres |
| **Floutage des coordonnées** | Position approximative pour protéger ta localisation exacte |
| **RLS Policies** | Sécurité niveau base de données avec Row Level Security |
| **Expiration automatique** | Les signaux expirent après 4 heures |

### 👤 Gestion de profil

- Upload d'avatar personnalisé
- Statistiques personnelles (interactions, heures actives, note moyenne)
- Historique des personnes rencontrées
- Export GDPR des données personnelles

### ⚙️ Paramètres avancés

- Thème clair/sombre automatique ou manuel
- Notifications push configurables
- Vibration de proximité
- Distance de visibilité personnalisable
- Suppression de compte

---

## 📦 Modules de Développement

### MODULE 1: Application Mobile Native (S1-S8)

- React Native + Expo SDK 50+
- Auth: phone OTP, email, Apple, Google
- Profil: photo, bio 140 chars, 6 activités favorites
- Interface signal: + timer expiration
- Carte temps réel Mapbox + distance floue
- Système icebreaker + mini chat 10 messages

### MODULE 2: Optimisation Localisation (S3-S10)

- Geofencing zones actives (campus, quartiers)
- Optimisation batterie < 5%/heure actif
- Indoor beacons iBeacon/Eddystone (< 5m précision)
- WiFi fingerprinting crowdsourced
- Description textuelle lieu optionnelle

### MODULE 3: Sécurité & Trust (S4-S8)

- Vérification email .edu/.univ-*.fr (50+ domaines)
- OAuth LinkedIn + Instagram (badges)
- Vérification photo liveness detection
- Bouton alerte: GPS → 3 contacts + 112
- Modération: report 3 taps, review < 24h

### MODULE 4: Mode Événement (S8-S12)

- Création événement: lieu, date, QR code
- SIGNAL isolé aux participants événement
- Icebreakers spéciaux + gamification
- Dashboard organisateur temps réel
- Intégrations: Shotgun, Eventbrite, Weezevent

### MODULE 5: B2B Établissements (S10-S14)

- Onboarding: SIRET + vérification gérant
- Dashboard: fréquentation, heatmap, demographics
- Promotions push ciblées + tracking redemptions
- Badge 'SIGNAL Friendly' + kit marketing
- Pricing: Free / Premium 29€/mois / Enterprise

### MODULE 6: Lancement Campus (S10-S16)

- Sélection 3 campus (> 10k étudiants)
- 15 ambassadeurs (5/campus) + formation + incentives
- Événement lancement/campus: 100+ participants
- Campagne: affiches, réseaux sociaux, referral
- Itérations rapides: hotfixes < 24h, NPS hebdo

---

## 🛠️ Stack Technique

### Frontend

| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI avec hooks et concurrent features |
| **TypeScript** | Typage statique pour une meilleure DX |
| **Vite** | Build tool ultra-rapide |
| **Tailwind CSS** | Styling utility-first avec design tokens |
| **shadcn/ui** | Composants UI accessibles et personnalisables |
| **Framer Motion** | Animations fluides |
| **React Router v6** | Navigation SPA |
| **Zustand** | State management léger |
| **TanStack Query** | Gestion du cache et des requêtes async |

### Backend (Lovable Cloud / Supabase)

| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base de données relationnelle |
| **Auth** | Authentification email/password avec confirmation |
| **Storage** | Stockage des avatars utilisateurs |
| **RLS** | Row Level Security pour la protection des données |
| **Functions** | Fonctions SQL pour la logique métier |
| **Realtime** | Mises à jour en temps réel (préparé) |

---

## 📊 Architecture Base de Données

```
┌─────────────────────────────────────────────────────────────────┐
│                         TABLES                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  profiles              active_signals         interactions       │
│  ├── id (UUID)         ├── id (UUID)          ├── id (UUID)     │
│  ├── email             ├── user_id (FK)       ├── user_id (FK)  │
│  ├── first_name        ├── activity           ├── target_id     │
│  ├── avatar_url        ├── signal_type        ├── activity      │
│  ├── university        ├── latitude           ├── icebreaker    │
│  └── created_at        ├── longitude          ├── feedback      │
│                        ├── expires_at         └── created_at    │
│                        └── started_at                            │
│                                                                  │
│  user_settings         user_stats             reports           │
│  ├── user_id (FK)      ├── user_id (FK)       ├── reporter_id   │
│  ├── ghost_mode        ├── interactions       ├── reported_id   │
│  ├── visibility_dist   ├── hours_active       ├── reason        │
│  ├── push_notifs       ├── rating             └── description   │
│  ├── sound_notifs      └── total_ratings                        │
│  └── vibration                                                   │
│                                                                  │
│  app_feedback          user_roles                                │
│  ├── user_id           ├── user_id                               │
│  ├── rating            └── role                                  │
│  └── message                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Fonctions SQL

| Fonction | Description |
|----------|-------------|
| `get_nearby_signals` | Récupère les signaux dans un rayon donné avec filtrage ghost mode |
| `fuzz_coordinates` | Floute les coordonnées GPS pour la confidentialité |
| `cleanup_expired_signals` | Nettoie les signaux expirés |
| `increment_interactions` | Incrémente le compteur d'interactions |
| `add_hours_active` | Ajoute du temps actif aux statistiques |

---

## 💰 Budget Détaillé

| Poste | Min | Max | Notes |
|-------|-----|-----|-------|
| Équipe interne | 50k€ | 70k€ | 5 personnes × 4-5 mois |
| Beacons hardware | 5k€ | 10k€ | 50 beacons × 3 lieux |
| Marketing lancement | 10k€ | 15k€ | Événements, goodies, ads |
| Ambassadeurs | 5k€ | 8k€ | Commissions, bonus |
| Infrastructure | 5k€ | 8k€ | Servers, Mapbox, SMS |
| Juridique | 3k€ | 5k€ | CGV, privacy policy |
| **TOTAL** | **80k€** | **120k€** | |

---

## 📈 KPIs de Succès

| KPI | Target S20 | Seuil PMF |
|-----|------------|-----------|
| Downloads | 3,000+ | 2,000 |
| DAU | 500+ | 300 |
| DAU/MAU ratio | > 30% | > 25% |
| Icebreakers/jour | 200+ | 100 |
| Acceptance rate | > 40% | > 30% |
| D7 retention | > 35% | > 25% |
| NPS | > 40 | > 30 |
| Établissements B2B | 10+ | 5 |

---

## ✅ Definition of Done

- [ ] App iOS + Android publiée, rating > 4.0
- [ ] 3 campus lancés, 500+ users chacun
- [ ] DAU > 500 stable sur 4 semaines
- [ ] Retention D7 > 35%
- [ ] 3 méthodes vérification actives
- [ ] 0 incident sécurité grave
- [ ] Indoor positioning < 10m précision
- [ ] 10 établissements B2B onboardés
- [ ] Métriques PMF documentées pour pitch seed

---

## 🎨 Design System

### Palette de couleurs

```css
/* Coral - Couleur principale */
--coral: 8 100% 65%
--coral-light: 12 100% 72%
--coral-dark: 4 85% 55%

/* Deep Blue - Backgrounds */
--deep-blue: 235 45% 12%
--midnight: 240 50% 6%

/* Signaux */
--signal-green: 155 90% 48%
--signal-yellow: 45 100% 55%
--signal-red: 0 90% 58%
```

### Typographie

- **Display & Headings**: Outfit (300-800)
- **Monospace**: Space Mono (400-700)

### Effets

- **Glassmorphism**: `.glass`, `.glass-strong`
- **Glows**: `.glow-coral`, `.glow-green`, `.glow-yellow`, `.glow-red`
- **Animations**: `pulse-signal`, `float`, `ripple`, `radar-sweep`

---

## 📱 Pages de l'application

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Page d'accueil avec présentation |
| `/onboarding` | Onboarding | Création de compte |
| `/map` | Map/Radar | Radar principal avec signaux |
| `/profile` | Profile | Profil utilisateur et stats |
| `/profile/edit` | Edit Profile | Modification du profil |
| `/settings` | Settings | Paramètres généraux |
| `/settings/notifications` | Notifications | Config notifications |
| `/settings/privacy` | Privacy Settings | Ghost mode et visibilité |
| `/settings/password` | Change Password | Modification mot de passe |
| `/people-met` | People Met | Historique des rencontres |
| `/statistics` | Statistics | Stats détaillées |
| `/reveal/:userId` | Proximity Reveal | Révélation d'un profil |
| `/report` | Report | Signaler un utilisateur |
| `/feedback` | Feedback | Donner son avis |
| `/help` | Help | FAQ et aide |
| `/privacy` | Privacy Policy | Politique de confidentialité |
| `/terms` | Terms | CGU |
| `/diagnostics` | Diagnostics | Debug et diagnostics |

---

## 🚀 Installation & Développement

### Prérequis

- Node.js 18+
- npm ou bun

### Installation locale

```bash
# Cloner le repo
git clone <YOUR_GIT_URL>
cd signal-app

# Installer les dépendances
npm install
# ou
bun install

# Lancer le serveur de développement
npm run dev
# ou
bun dev
```

### Variables d'environnement

Les variables sont automatiquement configurées par Lovable Cloud :

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run preview  # Preview du build
npm run lint     # Linter ESLint
npm run test     # Tests Vitest
```

---

## 🧪 Tests

L'application inclut une suite de tests complète :

```bash
# Lancer tous les tests
npm run test

# Tests spécifiques
npm run test -- src/test/auth.test.ts
npm run test -- src/test/security.test.ts
```

### Catégories de tests

| Fichier | Description |
|---------|-------------|
| `auth.test.ts` | Tests d'authentification |
| `security.test.ts` | Tests de sécurité et validation |
| `validation.test.ts` | Tests de validation des inputs |
| `distance.test.ts` | Tests de calcul de distance |
| `rls-permissions.test.ts` | Tests des policies RLS |
| `integration.test.ts` | Tests d'intégration |
| `e2e-scenarios.test.ts` | Scénarios end-to-end |
| `LandingPage.test.tsx` | Tests de la page d'accueil |
| `OnboardingPage.test.tsx` | Tests de l'onboarding |

---

## 📦 Déploiement

### Via Lovable

1. Ouvrir le projet dans [Lovable](https://lovable.dev)
2. Cliquer sur **Share → Publish**
3. L'application est déployée automatiquement

### Domaine personnalisé

1. Aller dans **Project → Settings → Domains**
2. Cliquer sur **Connect Domain**
3. Suivre les instructions DNS

---

## 🔐 Sécurité

### Mesures implémentées

- ✅ Authentification sécurisée avec Supabase Auth
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Validation des inputs côté client et serveur
- ✅ Sanitization des données utilisateur
- ✅ Protection contre les injections SQL
- ✅ HTTPS obligatoire
- ✅ Expiration automatique des sessions
- ✅ Ghost mode pour la confidentialité

### Conformité GDPR

- Export des données personnelles
- Suppression de compte avec cascade
- Politique de confidentialité claire
- Consentement cookies

---

## 📄 Licence

Ce projet est développé avec [Lovable](https://lovable.dev).

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- **Documentation**: [docs.lovable.dev](https://docs.lovable.dev)
- **Discord**: [Communauté Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Email**: Utiliser la page Feedback dans l'app

---

<p align="center">
  Fait avec ❤️ et <a href="https://lovable.dev">Lovable</a>
</p>
