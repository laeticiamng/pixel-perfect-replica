# NEARVITY

NEARVITY est une PWA React + Supabase orientée rencontres réelles entre étudiants et jeunes actifs : radar social en direct, sessions binôme, événements, conversations, sécurité, analytics admin et fonctionnalités IA optionnelles.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa)

---

## Statut du projet

| Champ | Valeur |
|---|---|
| Version | 2.1.0 |
| Statut | Production active |
| Plateforme | Web PWA mobile-first |
| Frontend | React, Vite, TypeScript, Tailwind, shadcn/ui, Framer Motion |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions, RPC SQL) |
| Dernière mise à jour | 19 mars 2026 |

### Ce qui a été réaligné

- Le cockpit présidentiel n’utilise plus de dataset mocké : il lit désormais les vraies métriques système, alertes, cron jobs et indicateurs institutionnels.
- La page Discover exploite mieux le backend existant avec un tri intelligent, des scores de pertinence et une hiérarchisation ergonomique des profils.
- Le README a été remis à niveau pour refléter l’état réel du backend, des surfaces front et des commandes de vérification.

---

## Installation

### Développement local

```bash
git clone <repo>
cd pixel-perfect-replica
npm install
npm run dev
```

### Build production

```bash
npm run build
npm run preview
```

### Vérifications qualité

```bash
npm run lint
npm run test
```

---

## Variables d’environnement

Le projet s’appuie principalement sur Supabase côté client et sur les secrets des Edge Functions côté plateforme.

### Frontend

Variables attendues par l’application web :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAPBOX_ACCESS_TOKEN` ou token récupéré via `get-mapbox-token`

### Edge Functions / backend

Suivant les fonctions activées, prévoir :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `PERPLEXITY_API_KEY`
- `FIRECRAWL_API_KEY`
- `ELEVENLABS_API_KEY`

---

## Fonctionnalités produit

### Expérience utilisateur

- Radar temps réel avec signal actif, expiration et filtrage d’activité.
- Discover avec recherche, filtres université/activité, tri intelligent et cartes de compatibilité.
- Révélation de profil de proximité avec badges, mini-chat et icebreakers IA/voix.
- Sessions binôme avec création, participation, historique, check-in et feedback.
- Événements publics avec favoris, détail et check-in QR.
- Profil, édition, confidentialité, blocages, signalements, export RGPD et paramètres.
- PWA installable avec support offline partiel et support notifications.

### Côté admin / ops

- Dashboard analytics pour l’activité, les pages, les événements et la santé système.
- Cockpit présidentiel live branché sur les métriques réelles :
  - `system` edge function,
  - `cron_job_executions`,
  - `alert_logs`,
  - `get_institutional_metrics()`,
  - `analytics_events`.
- Monitoring des jobs cron et préférences d’alertes admin.

### IA et services enrichis

- Recommandations de lieux via Edge Function `recommend-locations`.
- Assistant IA contextualisé via `ai-assistant`.
- Icebreakers vocaux via `voice-icebreaker`.
- Scraping / enrichissement d’événements via `firecrawl-*` et `scrape-events`.

> Certaines briques IA dépendent de secrets externes et peuvent être indisponibles sans configuration backend.

---

## Architecture

### Frontend

- `src/pages/*` : surfaces applicatives.
- `src/components/*` : composants UI, social, map, admin, landing, safety, binome.
- `src/hooks/*` : orchestration des appels Supabase, analytics, quotas, notifications, IA.
- `src/lib/*` : validation, i18n, logs, sécurité, cache de recommandations.
- `src/integrations/supabase/*` : client Supabase et types générés.

### Backend Supabase

- `supabase/migrations/*` : schéma SQL, RLS, RPC, fonctions métier.
- `supabase/functions/*` : Edge Functions TypeScript/Deno.

### Endpoints/flux backend clés exposés au front

- RPC : `discover_users`, `get_institutional_metrics`, `get_daily_active_users`, `get_events_public`, `get_public_profiles`, `join_session`, `leave_session`, etc.
- Edge Functions : `system`, `notifications`, `recommend-locations`, `voice-icebreaker`, `create-checkout`, `confirm-session-purchase`, `send-contact`, `log-client-error`.

---

## Focus audit frontend ↔ backend

Les principaux écarts couverts dans cette itération :

1. **Frontend admin réaligné avec le backend réel**
   - suppression du cockpit présidentiel alimenté par données de démonstration ;
   - lecture de vraies métriques système et institutionnelles.

2. **Ergonomie Discover optimisée**
   - tri intelligent par activité live, fraîcheur, campus et signaux utiles ;
   - meilleure lisibilité des profils à forte pertinence ;
   - présentation premium 3D légère sur les cartes.

3. **Qualité TypeScript/outilchain**
   - correction des suppressions TypeScript héritées sur les Edge Functions ;
   - correction de la config Tailwind ;
   - correction d’un hook conditionnel dans l’overlay diagnostic 3D.

---

## Sécurité

Le dépôt contient déjà une base sécurité avancée :

- RLS sur les tables métier sensibles.
- Validation côté client et côté fonctions Edge.
- Sanitization des entrées texte.
- Limites de taux sur plusieurs flux sensibles.
- Floutage de localisation et garde-fous anti-abus.
- Journalisation d’erreurs client côté backend.

Pour les détails d’audit et de hardening, voir aussi :

- `AUDIT_RESERVATION_MODE.md`
- `docs/known-issues.md`
- `docs/SECURITY_RELEASE.md`

---

## Tests

Commandes disponibles :

```bash
npm run test
npm run lint
npm run build
```

Le dépôt contient des tests unitaires, intégration et parcours critiques dans `src/test/*` ainsi que des tests liés à certaines Edge Functions.

---

## Routes principales

### Publiques

- `/`
- `/onboarding`
- `/forgot-password`
- `/reset-password`
- `/install`
- `/about`
- `/contact`
- `/terms`
- `/privacy`
- `/changelog`

### Authentifiées

- `/map`
- `/discover`
- `/reveal/:userId`
- `/binome`
- `/events`
- `/profile`
- `/settings`
- `/notifications`
- `/data-export`

### Admin

- `/admin`
- `/president-cockpit`
- `/institutional-dashboard`

---

## Notes de développement

- Le dépôt utilise Vite + React lazy loading pour une grande partie des pages.
- Les composants landing 3D reposent sur `three`, `@react-three/fiber` et `@react-three/postprocessing`.
- En environnement sans secrets tiers, les fonctionnalités IA/paiement/contact peuvent retourner des erreurs contrôlées côté backend.
- Les warnings `forwardRef` documentés dans `docs/known-issues.md` proviennent de dépendances tierces en mode dev.

---

## Licence

Projet sous licence MIT sauf mention contraire.
