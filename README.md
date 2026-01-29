# 📡 Signal - Connecte-toi IRL

**Signal** est une application mobile-first qui permet aux étudiants et jeunes actifs de se connecter spontanément dans la vraie vie. Active ton signal pour indiquer que tu es ouvert aux rencontres, découvre qui est disponible autour de toi sur le radar, et brise la glace facilement.

![Signal App](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Supabase](https://img.shields.io/badge/Supabase-Cloud-green) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

---

## 🚀 Fonctionnalités

### 🎯 Core Features

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
