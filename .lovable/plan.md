

# AUDIT TECHNIQUE COMPLET — NEARVITY v2.0.0 (Audit #2)

## 1. RÉSUMÉ EXÉCUTIF

**État global** : La plateforme a significativement progressé depuis l'audit #1. Les P0 critiques (InstitutionalDashboard, notifications cron auth, EventAttendeesPreview RLS) ont été corrigés. L'architecture reste solide. Cependant, de nouveaux constats P0/P1 persistent ou ont été introduits.

**Niveau de préparation** : 17.5/20 — Bon. Corrections restantes ciblées et réalisables.

**Verdict go-live** : **NON EN L'ÉTAT** — 2 P0 et 4 P1 restent.

### Top P0
1. **System EF : `cleanup-expired` et `cleanup_rate_limits` sans AUCUNE auth** — Contrairement à `check-shadow-bans` (admin requis), ces 2 actions sont exécutables par n'importe qui publiquement (lignes 852-865 de system/index.ts). L'utilisation du service role client rend l'appel destructif.
2. **i18n : clé `wellbeing.going` inexistante** — `EventAttendeesPreview.tsx` utilise `t('wellbeing.going')` (ligne 66-67). Cette clé n'existe dans aucune traduction. Le fallback `'going'` fonctionne mais en anglais uniquement, cassant le FR/DE.

### Top P1
1. **AdminDashboardPage : pas de guard ProtectedRoute + admin** — Utilise toujours un `useEffect` redirect (lignes 87-106) au lieu de `<Navigate>`. Flash de contenu admin possible (rendu complet de la page avant redirect, visible ligne 282-296 : fallback UI shield affiché mais le composant entier est monté et les hooks/fetches sont exécutés).
2. **EventAttendeesPreview : double RPC call (N+1)** — Pour chaque event card, 2 appels RPC sont faits (lignes 26 + 37). Sur 20 events = 40 requêtes.
3. **PresidentCockpitPage : données 100% mock sans indication visible** — Le badge "DEMO" a été supprimé dans la dernière édition. La page affiche des données non réelles sans avertissement.
4. **Notifications EF health endpoint : expose auth_required map** — `auth_required` inclut `"send-session-reminders": "none"` (ligne 443-447). Information utile à un attaquant pour savoir quelles actions ne nécessitent pas d'auth.

---

## 2. TABLEAU D'AUDIT

| Priorité | Domaine | Page / Fonction | Problème | Risque | Recommandation | Faisable ? |
|---|---|---|---|---|---|---|
| P0 | Security | system EF: cleanup-expired, cleanup_rate_limits | Aucune auth — exécutable publiquement | Suppression de données par attaquant externe | Ajouter vérification anon/SRK comme dans notifications EF | Oui |
| P0 | i18n | EventAttendeesPreview | Clé `wellbeing.going` inexistante en FR/DE/EN | Texte anglais hardcodé affiché en FR/DE | Créer clé `events.going` dans translations | Oui |
| P1 | Auth | AdminDashboardPage | useEffect redirect au lieu de Navigate guard | Flash de contenu admin, hooks exécutés | Remplacer par pattern `useAdminCheck` + `<Navigate>` | Oui |
| P1 | Perf | EventAttendeesPreview | 2 RPC calls par event card | Cascade de requêtes | Fusionner en 1 RPC avec count | Oui |
| P1 | UX | PresidentCockpitPage | Badge "DEMO" supprimé, données mock sans avertissement | Utilisateur croit aux données | Réajouter badge ou bannière | Oui |
| P1 | Security | notifications EF health | Expose la carte `auth_required` avec actions "none" | Information leaking | Retirer la carte auth_required du health check | Oui |
| P2 | Security | system EF health | Même problème — expose la carte auth_required | Information leaking | Retirer | Oui |
| P2 | Accessibilité | InclusionRadarSection | Vérifier que les aria-labels ont bien été ajoutés | Conformité a11y | Confirmer | Oui |
| P2 | i18n | AdminDashboardPage | Onglets "Events", "Pages", "Scraper" non traduits (lignes 422-427 hardcodés EN) | Incohérence i18n | Traduire | Oui |
| P3 | Perf | AdminDashboardPage | Fetch de TOUS les analytics_events pour compter côté client (lignes 182-256) | N queries + client-side aggregation | Utiliser des RPCs d'agrégation | Non prioritaire |

---

## 3. DÉTAIL PAR CATÉGORIE

### Security
- **Confirmé OK** : notifications EF cron actions (send-session-reminders, send-reengagement) maintenant protégées par vérification anon/SRK.
- **Cassé** : system EF `cleanup-expired` (ligne 857) et `cleanup_rate_limits` (ligne 863) passent directement au handler SANS aucune auth. Le commentaire dit "Can be called by cron (no auth) or by admin" mais aucune vérification n'est faite. Quiconque peut POST `{"action":"cleanup-expired"}` et déclencher la suppression de signaux, messages, analytics, etc.
- **Douteux** : health endpoints exposent la carte `auth_required` révélant quelles actions sont non protégées.

### Auth & Autorisations
- **Confirmé OK** : ProtectedRoute sur /newcomer, /institutional-dashboard. useAdminCheck sur PresidentCockpitPage et InstitutionalDashboardPage.
- **Cassé** : AdminDashboardPage utilise toujours `useEffect` + `navigate('/')` (ligne 90). Non atomique — le composant se monte, les hooks `useSystemStats(isAdmin)` et `loadAnalytics` s'exécutent brièvement avec `isAdmin=false` (via l'état initial), puis redirect.

### Frontend & Rendu
- **Confirmé OK** : InstitutionalDashboardPage créée et fonctionnelle avec états loading/error/empty. NotFound a Helmet avec noindex. Toutes les pages protégées ont Helmet noindex.
- **Douteux** : PresidentCockpitPage sans badge "DEMO" — les données EMOTIONSCARE sont présentées comme réelles.

### i18n
- **Cassé** : `t('wellbeing.going')` dans EventAttendeesPreview n'existe dans aucune traduction. Le composant affichera toujours "going" en anglais quelle que soit la langue active.
- **Douteux** : AdminDashboardPage a des onglets hardcodés en anglais ("Events", "Pages", "Scraper").

### Performance
- EventAttendeesPreview fait 2 appels RPC séquentiels par card (un pour les 3 premiers, un pour le count total avec limit 200).
- AdminDashboardPage fetch toutes les lignes d'analytics_events pour agrégation client-side — potentiellement des milliers de rows.

---

## 4. PLAN D'ACTION

### P0 Immédiat
1. **Sécuriser system EF** : ajouter vérification anon/SRK sur `cleanup-expired` et `cleanup_rate_limits` (même pattern que notifications EF).
2. **Corriger i18n EventAttendeesPreview** : ajouter clé `events.going` dans EN/FR/DE et remplacer `t('wellbeing.going')` par `t('events.going')`.

### P1 Rapide
3. **Fix AdminDashboardPage** : remplacer le pattern useEffect/navigate par `useAdminCheck` + `if (!isAdmin) return <Navigate to="/" replace />` avant le render.
4. **Réajouter badge DEMO** sur PresidentCockpitPage.
5. **Retirer auth_required** des health endpoints de notifications et system EF.
6. **Optimiser EventAttendeesPreview** : un seul RPC call.

### P2
7. Traduire onglets AdminDashboardPage.

---

## 5. IMPLÉMENTATION IMMÉDIATE

Corrections à implémenter :

1. **system EF** : ajouter vérification cron token sur `cleanup-expired`, `cleanup_expired` et `cleanup_rate_limits` (comme le pattern de notifications EF lignes 632-642).
2. **EventAttendeesPreview.tsx** : remplacer `t('wellbeing.going')` par `t('events.going')`.
3. **translations.ts** : ajouter clé `events.going` en EN ("going"), FR ("inscrit(s)"), DE ("dabei").
4. **AdminDashboardPage.tsx** : remplacer le pattern useEffect par useAdminCheck + Navigate guard.
5. **PresidentCockpitPage.tsx** : réajouter un badge "Données de démonstration" visible.
6. **notifications EF + system EF** : retirer `auth_required` des réponses health.
7. **EventAttendeesPreview** : fusionner les 2 appels RPC en 1 seul (utiliser le count du premier appel ou passer un limit suffisant).

### Non implémenté (nécessite décision) :
- Remplacement des données mock PresidentCockpitPage par données réelles (décision produit)
- Optimisation des agrégations AdminDashboardPage (refactoring backend)
- CORS restriction (configuration Cloud)

