# 🟢 EASY — Le premier réseau social 100% réel

**EASY** est une application mobile-first qui permet aux étudiants et jeunes actifs de se connecter spontanément dans la vraie vie. Active ton statut EASY, découvre qui est disponible autour de toi sur le radar, et brise la glace facilement.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript) ![Lovable Cloud](https://img.shields.io/badge/Lovable_Cloud-Backend-3FCF8E?logo=supabase) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss) ![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)

---

## ⚠️ Statut du projet

| Champ | Valeur |
|-------|--------|
| **Version** | 1.7.0 |
| **Statut** | 🟢 Production Ready |
| **Plateforme** | Web PWA (mobile-first, installable) |
| **Backend** | Lovable Cloud |
| **Dernière mise à jour** | 5 février 2026 |

> **Note** : Ce projet est en production. Toutes les fonctionnalités de base sont implémentées et testées.

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
cd easy-app
npm install
npm run dev
```

### Configuration
Copie `.env.example` vers `.env` et remplis les valeurs nécessaires :
```bash
cp .env.example .env
```

Variables requises :
- `MAPBOX_ACCESS_TOKEN` - Token Mapbox (obtenir sur [mapbox.com](https://mapbox.com))

Variables optionnelles (pour les fonctionnalités premium) :
- `STRIPE_SECRET_KEY` - Pour les paiements
- `PERPLEXITY_API_KEY` - Pour les recommandations IA
- `ELEVENLABS_API_KEY` - Pour les icebreakers vocaux

---

## 🎯 Fonctionnalités

### ✅ Implémentées et fonctionnelles

| Fonctionnalité | Description |
|----------------|-------------|
| **Radar temps réel** | Visualise les personnes disponibles autour de toi |
| **3 états EASY** | 🟢 Ouvert, 🟡 Conditionnel, 🔴 Occupé |
| **6 activités** | 📚 Réviser, 🍽️ Manger, 💻 Bosser, 💬 Parler, 🏃 Sport, ✨ Autre |
| **Ghost mode** | Deviens invisible sur le radar |
| **Sessions binôme** | Planifie des sessions d'étude en groupe |
| **Chat de groupe** | Échange avec les participants (10 messages max) |
| **Export GDPR** | Télécharge toutes tes données en JSON |
| **PWA installable** | Fonctionne comme une app native |
| **Blocage utilisateurs** | Bloque les utilisateurs indésirables |
| **Signalement** | Signale les comportements inappropriés |
| **Favoris événements** | Sauvegarde les événements qui t'intéressent |

### ⚠️ Partiellement implémentées

| Fonctionnalité | Statut |
|----------------|--------|
| **Notifications push** | Infrastructure OK, tests réels en cours |
| **Paiements Stripe** | Edge functions OK, flux non testé E2E |
| **Recommandations IA** | Fonctionne mais nécessite clé API |
| **Icebreakers vocaux** | Fonctionne mais nécessite clé API |

### 📋 Prévues (non implémentées)

- Mode hors-ligne complet
- Notifications en temps réel
- Matching par affinités

---

## 🔒 Sécurité

### Implémenté

| Élément | Description |
|---------|-------------|
| **RLS (Row Level Security)** | Actif sur toutes les tables |
| **Validation des inputs** | Schemas Zod côté client |
| **Sanitization** | Protection XSS sur tous les champs texte |
| **Rate limiting** | 5 signalements/h, 10 révélations/h |
| **Rate limiting Edge Functions** | ai-assistant: 20/min, voice-icebreaker: 5/min |
| **Floutage GPS** | Coordonnées arrondies à ~100m |
| **Shadow ban automatique** | 3+ signalements en 24h |

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
| **Framer Motion** | Animations |
| **Zustand** | State management |
| **TanStack Query** | Cache et requêtes async |
| **Mapbox GL** | Carte interactive |

### Backend (Lovable Cloud)
| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base de données |
| **Auth** | Email/password |
| **Storage** | Avatars |
| **RLS** | Row Level Security |
| **Edge Functions** | Logique serveur |

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Voir la couverture
npm run test -- --coverage
```

### État des tests

| Type | Statut |
|------|--------|
| **Smoke tests** | ✅ Passent |
| **Validation inputs** | ✅ Complet |
| **Sanitization XSS** | ✅ Complet |
| **Logique métier** | ✅ Complet |
| **RLS policies** | ✅ DB Linter: 0 issues |

---

## 📊 Architecture Base de Données

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Informations utilisateur |
| `active_signals` | Statuts EASY actifs (expiration 2h) |
| `interactions` | Historique des rencontres |
| `user_settings` | Préférences (ghost mode, etc.) |
| `scheduled_sessions` | Sessions binôme |
| `session_participants` | Participants aux sessions |
| `reports` | Signalements |
| `user_blocks` | Blocages bidirectionnels |

### Edge Functions

| Fonction | Description |
|----------|-------------|
| `get-mapbox-token` | Récupère le token Mapbox (auth requise) |
| `notifications` | Envoi de notifications push |
| `create-checkout` | Crée une session Stripe |
| `ai-assistant` | Assistant IA contextuel |
| `recommend-locations` | Recommandations de lieux |
| `voice-icebreaker` | Génération d'icebreakers vocaux |
| `send-auth-email` | Emails d'authentification personnalisés |
| `system` | Tâches de maintenance |

---

## 💰 Modèle économique

### Gratuit
- 2 sessions binôme par mois
- Radar et EASY illimités
- Chat (10 messages par interaction)

### Premium (9,90€/mois)
- Sessions binôme illimitées
- Ghost mode
- Badge premium
- Fonctionnalités IA

### Pay-per-use
- 0,99€ par session supplémentaire

---

## 📱 Routes de l'Application

### Publiques
| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/onboarding` | Inscription/Connexion |
| `/install` | Guide d'installation PWA |
| `/terms` | CGU |
| `/privacy` | Politique de confidentialité |

### Protégées (auth requise)
| Route | Description |
|-------|-------------|
| `/map` | Radar principal |
| `/binome` | Sessions binôme |
| `/profile` | Mon profil |
| `/settings` | Paramètres |
| `/data-export` | Export GDPR |

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/NewFeature`)
3. Lire `.env.example` pour la configuration
4. Lancer les tests (`npm test`)
5. Commit (`git commit -m 'Add NewFeature'`)
6. Push (`git push origin feature/NewFeature`)
7. Ouvrir une Pull Request

### Standards de code
- TypeScript strict
- Tests pour toute nouvelle logique métier
- Composants < 200 lignes
- Pas de `any` explicite

---

## 📞 Support

- **Documentation** : Ce README
- **Discord** : [Communauté Lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Feedback** : Page Feedback dans l'app

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

<p align="center">
  <strong>🟢 EASY</strong> — Le premier réseau social 100% réel<br>
  <em>Version 1.7.0 • Production Ready • PWA</em><br><br>
  Fait avec ❤️ in France par EmotionsCare Sasu
</p>
