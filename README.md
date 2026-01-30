# 🟢 EASY — Le premier réseau social 100% réel

**EASY** est une application mobile-first qui permet aux étudiants et jeunes actifs de se connecter spontanément dans la vraie vie. Active ton signal, découvre qui est disponible autour de toi sur le radar, et brise la glace facilement.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript) ![Supabase](https://img.shields.io/badge/Lovable_Cloud-Supabase-3FCF8E?logo=supabase) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss) ![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa) ![Vitest](https://img.shields.io/badge/Tests-164_tests-6E9F18?logo=vitest) ![Audit](https://img.shields.io/badge/Audit-Complet-green)

---

## 📋 Projet

| Champ | Valeur |
|-------|--------|
| **Version** | 1.3.0 |
| **Statut** | ✅ Production Ready |
| **Plateforme** | Web PWA (mobile-first, installable) |
| **Backend** | Lovable Cloud |
| **Dernière mise à jour** | 30 janvier 2026 |
| **Audit** | ✅ Complet (voir AUDIT_COMPLETE_FINAL.md) |

---

## 🚀 Installation Rapide

### Sur mobile (recommandé)
1. Ouvre l'app dans ton navigateur
2. Va sur `/install` pour les instructions
3. **iPhone/iPad** : Partager → Sur l'écran d'accueil
4. **Android** : Menu ⋮ → Installer l'application

### Développement local
```bash
git clone <YOUR_GIT_URL>
cd signal-app
npm install
npm run dev
```

---

## 🎯 Fonctionnalités Principales

### 📡 Radar & Signaux
| Fonctionnalité | Description |
|----------------|-------------|
| **Radar temps réel** | Visualise les personnes disponibles autour de toi |
| **3 états de signal** | 🟢 Ouvert, 🟡 Conditionnel, 🔴 Occupé |
| **6 activités** | 📚 Réviser, 🍽️ Manger, 💻 Bosser, 💬 Parler, 🏃 Sport, ✨ Autre |
| **Révélation progressive** | Rapproche-toi à < 50m pour voir le profil complet |
| **Icebreakers** | Phrases d'accroche contextuelles selon l'activité |
| **Filtres d'activité** | Filtre les utilisateurs par type d'activité |
| **Expiration automatique** | Signaux expirent après 2 heures (extensibles) |

### 📱 Progressive Web App (PWA)
| Fonctionnalité | Description |
|----------------|-------------|
| **Installable** | Installe l'app sur ton écran d'accueil |
| **Mode hors-ligne** | Cache intelligent avec service worker |
| **Notifications push** | Alertes quand quelqu'un arrive à proximité |
| **Navigation gestuelle** | Swipe horizontal entre les pages principales |
| **Breadcrumbs** | Navigation intuitive sur les pages profondes |

### 🔔 Notifications
| Fonctionnalité | Description |
|----------------|-------------|
| **Push natifs** | Notifications même quand l'app est fermée |
| **Alertes proximité** | Notification quand quelqu'un nouveau arrive |
| **Vibration** | Feedback haptique configurable |
| **Sons** | Alertes sonores personnalisables |

### 🔒 Confidentialité & Sécurité
| Fonctionnalité | Description |
|----------------|-------------|
| **Ghost Mode** | Masque ta présence sur le radar |
| **Floutage GPS** | Coordonnées approximatives (~100m) |
| **RLS Policies** | Sécurité niveau base de données |
| **Purge 30 jours** | Suppression automatique des données de localisation |
| **Bouton d'urgence** | Alerte rapide avec contacts d'urgence |
| **Signalement** | Système de report avec rate limiting |

### 👤 Profil & Statistiques
- Avatar personnalisé avec upload
- Bio et université
- Historique des personnes rencontrées
- Statistiques détaillées (graphiques interactifs)
- Export GDPR complet des données
- Suppression de compte

### ⚙️ Paramètres
- Thème clair/sombre (automatique ou manuel)
- Notifications push configurables
- Vibration de proximité
- Distance de visibilité (50m - 1km)
- Gestion des contacts d'urgence

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI avec hooks |
| **TypeScript** | Typage statique |
| **Vite + PWA** | Build tool avec service worker |
| **Tailwind CSS** | Styling avec design tokens |
| **shadcn/ui** | Composants UI accessibles |
| **Framer Motion** | Animations fluides |
| **Zustand** | State management |
| **TanStack Query** | Cache et requêtes async |
| **Recharts** | Visualisation de données |

### Backend (Lovable Cloud)
| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base de données relationnelle |
| **Auth** | Email/password avec auto-confirm |
| **Storage** | Avatars utilisateurs |
| **RLS** | Row Level Security |
| **Realtime** | Subscriptions temps réel |
| **Edge Functions** | Notifications push |
| **Functions SQL** | Logique métier |

---

## 📊 Architecture Base de Données

```
┌─────────────────────────────────────────────────────────────┐
│                         TABLES                               │
├─────────────────────────────────────────────────────────────┤
│  profiles              active_signals         interactions  │
│  ├── id (UUID)         ├── id (UUID)          ├── id        │
│  ├── email             ├── user_id (FK)       ├── user_id   │
│  ├── first_name        ├── activity           ├── target_id │
│  ├── avatar_url        ├── signal_type        ├── activity  │
│  ├── university        ├── lat/lng            ├── icebreaker│
│  └── bio               └── expires_at         └── feedback  │
│                                                              │
│  user_settings         user_stats             push_         │
│  ├── ghost_mode        ├── interactions       subscriptions │
│  ├── visibility_dist   ├── hours_active       ├── endpoint  │
│  ├── push_notifs       ├── rating             ├── p256dh    │
│  └── vibration         └── total_ratings      └── auth      │
│                                                              │
│  emergency_contacts    reports                app_feedback  │
│  ├── name              ├── reporter_id        ├── rating    │
│  └── phone             ├── reported_id        └── message   │
│                        └── reason                            │
└─────────────────────────────────────────────────────────────┘
```

### Fonctions SQL
| Fonction | Description |
|----------|-------------|
| `get_nearby_signals` | Signaux dans un rayon avec filtre ghost mode |
| `fuzz_coordinates` | Floutage GPS pour confidentialité |
| `get_safe_public_profile` | Profil public sécurisé |
| `cleanup_expired_signals` | Nettoyage signaux expirés |
| `increment_interactions` | Compteur d'interactions |
| `check_report_rate_limit` | Rate limiting signalements |

### Edge Functions
| Fonction | Description |
|----------|-------------|
| `send-push-notification` | Envoi de notifications push |

---

## 📱 Routes de l'Application

### Routes Publiques
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Page d'accueil |
| `/onboarding` | Inscription/Connexion | Création de compte |
| `/install` | Installation PWA | Guide d'installation |
| `/forgot-password` | Mot de passe oublié | Réinitialisation |
| `/reset-password` | Reset mot de passe | Nouveau mot de passe |
| `/terms` | CGU | Conditions d'utilisation |
| `/privacy` | Confidentialité | Politique de confidentialité |

### Routes Protégées (Auth requise)
| Route | Page | Description |
|-------|------|-------------|
| `/map` | Radar | Page principale avec carte |
| `/reveal/:userId` | Révélation | Profil complet d'un utilisateur |
| `/profile` | Mon profil | Vue de son profil |
| `/profile/edit` | Modifier profil | Édition du profil |
| `/settings` | Paramètres | Configuration générale |
| `/notifications-settings` | Notifications | Config des alertes |
| `/privacy-settings` | Confidentialité | Ghost mode, visibilité |
| `/change-password` | Mot de passe | Changer son mot de passe |
| `/people-met` | Rencontres | Historique des interactions |
| `/statistics` | Statistiques | Graphiques d'activité |
| `/report` | Signaler | Signaler un problème |
| `/feedback` | Avis | Donner son avis |
| `/help` | Aide | FAQ et support |
| `/diagnostics` | Debug | Informations techniques |

---

## 🎨 Design System

### Palette
```css
/* Coral - Accent principal */
--coral: 8 100% 65%

/* Deep Blue - Backgrounds */
--deep-blue: 235 45% 12%
--midnight: 240 50% 6%

/* Signaux */
--signal-green: 155 90% 48%
--signal-yellow: 45 100% 55%
```

### Typographie
- **Display**: Outfit (300-800)
- **Mono**: Space Mono (400-700)

### Effets
- **Glass**: `.glass`, `.glass-strong` (glassmorphism)
- **Glow**: `.glow-coral`, `.glow-green`, `.glow-yellow`
- **Animations**: `pulse-signal`, `float`, `ripple`, `radar-sweep`

### Navigation Mobile
- **Swipe horizontal** entre Map ↔ Profile ↔ Settings
- **Breadcrumbs** automatiques sur pages profondes
- **Bottom navigation** fixe avec 3 onglets principaux

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests spécifiques
npm run test -- src/test/auth.test.ts
```

### Suite de tests (164 tests)
| Fichier | Description |
|---------|-------------|
| `smoke.test.ts` | Tests de base (28 tests) |
| `auth.test.ts` | Authentification |
| `security.test.ts` | Validation & sécurité |
| `distance.test.ts` | Calcul Haversine |
| `e2e-flows.test.ts` | Parcours utilisateur |
| `e2e-critical-paths.test.tsx` | Chemins critiques |
| `components.test.tsx` | Tests composants React |
| `rls-permissions.test.ts` | Policies RLS |
| `premium-pricing.test.ts` | Tests pricing Premium |

---

## ✅ Checklist Qualité

### Fonctionnalités ✅
- [x] PWA installable (iOS + Android)
- [x] Notifications push natives
- [x] Navigation par gestes (swipe)
- [x] Breadcrumbs automatiques
- [x] Mode hors-ligne partiel
- [x] Thème clair/sombre

### Sécurité ✅
- [x] Authentification avec auto-confirm
- [x] Row Level Security sur toutes les tables
- [x] Validation inputs (client + serveur)
- [x] Sanitization HTML (XSS protection)
- [x] Rate limiting sur signalements
- [x] Ghost mode pour confidentialité
- [x] Floutage coordonnées GPS

### Accessibilité ✅
- [x] Aria-labels sur tous les boutons icônes
- [x] Focus visible pour navigation clavier
- [x] Skeletons sur pages avec data
- [x] Couleurs via tokens CSS (thémées)
- [x] Contraste suffisant

### GDPR ✅
- [x] Export données personnelles
- [x] Suppression compte avec cascade
- [x] Politique confidentialité
- [x] Consentement cookies

---

## 📦 Déploiement

### Via Lovable
1. Ouvrir le projet dans Lovable
2. Cliquer **Share → Publish**
3. L'app est déployée automatiquement

### Domaine personnalisé
1. **Project → Settings → Domains**
2. **Connect Domain**
3. Configurer DNS (CNAME)

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/NewFeature`)
3. Commit (`git commit -m 'Add NewFeature'`)
4. Push (`git push origin feature/NewFeature`)
5. Ouvrir une Pull Request

---

## 📞 Support

- **Docs**: [docs.lovable.dev](https://docs.lovable.dev)
- **Discord**: [Communauté Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Feedback**: Page Feedback dans l'app
- **Email**: support@easy-app.fr

---

## 🆕 Mode Binôme (v1.2)

Nouvelle fonctionnalité permettant de planifier des sessions d'étude ou de travail en groupe :

| Fonctionnalité | Description |
|----------------|-------------|
| **Créer un créneau** | Planifie une session avec activité, date, heure et durée |
| **Rejoindre une session** | Trouve des sessions dans ta ville et rejoins-les |
| **Chat de groupe** | Échange avec les participants avant la session |
| **Feedback post-session** | Évalue les participants après la session |
| **Score de fiabilité** | Les utilisateurs ponctuels et agréables ont un meilleur score |
| **Rappels automatiques** | Notifications 1h et 15min avant la session |
| **Quota mensuel** | 3 sessions gratuites/mois, sessions supplémentaires en Premium |

---

## 🔍 Audit & Qualité (v1.3)

L'audit complet de la plateforme a été réalisé le 30 janvier 2026. Voir `AUDIT_COMPLETE_FINAL.md` pour les détails.

### Corrections appliquées
- ✅ OfflineBanner avec forwardRef (résout warning React)
- ✅ BottomNav ajouté sur toutes les pages
- ✅ Lien Premium ajouté dans le profil
- ✅ Traductions complètes FR/EN
- ✅ Mode démo pour la carte (affiche des utilisateurs de test)

### Métriques
| Métrique | Valeur |
|----------|--------|
| Tests | 164 (100% passent) |
| Tables Supabase | 25+ |
| Fonctions SQL | 40+ |
| Edge Functions | 8 |
| RLS Policies | Actives sur toutes les tables |

---

<p align="center">
  <strong>🟢 EASY</strong> — Le premier réseau social 100% réel<br>
  <em>Version 1.3.0 • PWA • Mode Binôme • Notifications Push • Audit Complet</em><br><br>
  Fait avec ❤️ in France par EmotionsCare Sasu
</p>
