

# AUDIT TECHNIQUE COMPLET — NEARVITY v2.0.0

## 1. RÉSUMÉ EXÉCUTIF

**État global** : Plateforme mature, bien architecturée, avec des patterns de sécurité solides (RLS, auth centralisée, rate limiting). Cependant, plusieurs fonctionnalités Erasmus+ récemment ajoutées sont partiellement branchées, et certaines pages critiques manquent de guards ou de métadonnées.

**Niveau de préparation** : 16/20 — Bon pour un MVP avancé, mais des corrections P0/P1 sont nécessaires avant un go-live confiant.

**Verdict go-live** : **NON EN L'ÉTAT** — 3 P0 et 5 P1 doivent être résolus.

### Top P0
1. **Institutional Dashboard manquant** : Annoncé dans les conversations précédentes, l'`InstitutionalDashboardPage.tsx` n'existe pas. La route n'est pas enregistrée dans App.tsx. Le RPC `get_institutional_metrics` n'est référencé nulle part dans le frontend. Fonctionnalité fantôme.
2. **Notifications edge function : actions cron sans auth** : `send-session-reminders` et `send-reengagement` n'ont aucune vérification (pas de token cron, pas de clé API). N'importe qui peut appeler l'endpoint publiquement avec `verify_jwt=false` et déclencher l'envoi d'emails/push à tous les utilisateurs.
3. **EventAttendeesPreview : fuite de données RLS** : Le composant requête `event_participants` et `profiles` directement. Or la policy RLS sur `event_participants` ne permet de voir que ses propres participations OU celles d'événements qu'on organise. Le composant va donc échouer silencieusement pour la majorité des utilisateurs (count toujours 0), rendant la feature "Who else is going?" non fonctionnelle.

### Top P1
1. **PresidentCockpitPage : 100% mock data** — Affiche des données hardcodées (`platformsMock`, `pendingValidationsMock`). Aucune donnée réelle. Page fonctionnellement trompeuse.
2. **AdminDashboardPage : pas de guard ProtectedRoute** — Utilise un redirect dans useEffect (race condition possible), au lieu du pattern `ProtectedRoute` + `useAdminCheck` cohérent.
3. **NewcomerOnboardingPage : pas de Helmet** — Aucune métadonnée SEO. Page publique sans title ni description.
4. **Pages sans Helmet** : GamificationPage, StatisticsPage, BlockedUsersPage, ChangePasswordPage, DataExportPage, FeedbackPage, ReportPage, PeopleMetPage, EditProfilePage — aucune n'a de balise `<Helmet>`.
5. **System edge function : actions sensibles sans auth requise** — `cleanup-expired`, `get-stats`, `check-shadow-bans` sont accessibles avec `verify_jwt=false` et la validation auth dépend du parsing du body (l'action détermine si l'auth est requise).

---

## 2. TABLEAU D'AUDIT

| Priorité | Domaine | Page / Fonction | Problème | Symptôme | Risque | Recommandation | Faisable immédiatement ? |
|----------|---------|-----------------|----------|----------|--------|----------------|--------------------------|
| P0 | Feature | InstitutionalDashboardPage | Page inexistante | Fichier non trouvé, route absente | Feature annoncée non livrée | Créer la page + route ou retirer la référence | Oui |
| P0 | Security | notifications EF: cron actions | Pas d'auth sur send-session-reminders / send-reengagement | Tout appelant externe peut trigger | Spam, abus, envoi de push/email non autorisé | Ajouter vérification token (anon key ou secret header) | Oui |
| P0 | Data | EventAttendeesPreview | RLS bloque la lecture de event_participants pour non-participants | Count toujours 0, feature cassée | Feature "Who else is going?" non fonctionnelle | Utiliser le RPC `get_event_attendees_public` déjà créé en migration | Oui |
| P1 | Feature | PresidentCockpitPage | 100% données mockées | platformsMock, pendingValidationsMock | Page trompeuse, aucune donnée réelle | Brancher sur données réelles ou marquer clairement "Demo" | Oui (badge) |
| P1 | Auth | AdminDashboardPage | Guard via useEffect au lieu de ProtectedRoute pattern | Race condition possible, flash de contenu | Contenu admin brièvement visible | Aligner avec le pattern PresidentCockpitPage (useAdminCheck) | Oui |
| P1 | SEO | 10+ pages protégées | Pas de Helmet (title, meta robots) | Pages sans title dans l'onglet | Mauvaise UX, pas de noindex | Ajouter Helmet avec noindex à toutes les pages protégées | Oui |
| P1 | Security | system EF | Auth granulaire par action, certaines actions sensibles (cleanup, shadow-bans) potentiellement accessibles | verify_jwt=false | Admin actions exposées | Non confirmé sans lire le router complet, mais à vérifier | Partiellement |
| P2 | i18n | WellbeingCheckModal | Utilise `t('wellbeing.going')` comme fallback dans EventAttendeesPreview | Clé potentiellement manquante ou mal nommée | Texte incorrect | Créer clé dédiée `events.going` | Oui |
| P2 | UX | NewcomerOnboardingPage | Page `/newcomer` publique (pas de ProtectedRoute) mais nécessite un user connecté | Crash si user=null quand on écrit en DB | Erreur runtime | Soit ajouter ProtectedRoute, soit gérer le cas null | Oui |
| P2 | Code | PresidentCockpitPage | `navigate('/')` appelé pendant le render (hors useEffect) | Warning React potential | Anti-pattern React | Remplacer par `<Navigate to="/" replace />` | Oui |
| P2 | Performance | EventAttendeesPreview | N+1 queries (1 count + 1 participants + 1 profiles par event card) | Cascade de requêtes sur la page events | Latence | Utiliser un seul RPC batch | Oui |
| P2 | Security | CORS | `Access-Control-Allow-Origin: *` sur toutes les edge functions | Trop permissif | Requêtes cross-origin non restreintes | Limiter à l'URL de production | Non (config Cloud) |
| P3 | SEO | NotFound | Pas de Helmet avec title "404" | Onglet sans titre significatif | Mineur | Ajouter Helmet | Oui |
| P3 | Accessibilité | InclusionRadarSection | Switches sans labels accessibles (aria-label) | Accessibilité réduite | Conformité a11y | Ajouter aria-label | Oui |
| P3 | UX | WellbeingCheck | Le timer de 10s pour afficher le modal peut interrompre l'UX principale | UX un peu intrusive | Mineur | Considérer un délai plus long ou un trigger contextuel | Non prioritaire |

---

## 3. DÉTAIL PAR CATÉGORIE

### A. Frontend & Rendu
- **Fonctionne** : LandingPage, OnboardingPage, MapPage, ProfilePage, SettingsPage, PremiumPage, EventsPage, BinomePage, HelpPage, TermsPage, PrivacyPage, ContactPage, AboutPage — tous rendent correctement avec Helmet.
- **Cassé** : InstitutionalDashboardPage n'existe pas.
- **Douteux** : PresidentCockpitPage affiche uniquement du mock. NewcomerOnboardingPage publique mais dépend d'un user.

### B. QA Fonctionnelle
- **Fonctionne** : Auth flow (signup/login/reset/OAuth), profile edit, events CRUD, binome sessions, conversations, notifications, gamification.
- **Cassé** : "Who else is going?" (EventAttendeesPreview) — RLS empêche la lecture. Institutional Dashboard absent.
- **Non confirmé** : Stripe checkout en conditions réelles (dépend des clés live).

### C. Auth & Autorisations
- **Fonctionne** : ProtectedRoute pattern, has_role RPC, useAdminCheck, JWT validation dans edge functions.
- **Douteux** : AdminDashboardPage utilise un useEffect redirect au lieu de ProtectedRoute. PresidentCockpitPage appelle navigate() pendant le render.
- **Risque** : `/newcomer` est public mais écrit en DB (crash si non connecté).

### D. APIs & Edge Functions
- **Fonctionne** : 11 des 13 edge functions utilisent authenticateRequest correctement.
- **Cassé** : `notifications` et `system` n'utilisent PAS le helper centralisé `_shared/auth.ts`. Elles ont leur propre implémentation et des actions cron sans auth.
- **Risque** : Les actions `send-session-reminders` et `send-reengagement` sont appelables par n'importe qui.

### E. Database & RLS
- **Fonctionne** : Toutes les tables ont RLS activé. Policies cohérentes sur profiles, interactions, messages, events, user_roles.
- **Cassé** : `event_participants` SELECT policy trop restrictive pour la feature "attendees preview" — seuls les participants et organisateurs peuvent voir.
- **Non confirmé** : Inclusion radar matching (RPCs discover_users, get_nearby_signals avec inclusion boost) — la migration SQL a été créée mais le frontend n'appelle pas explicitement ces RPCs avec les nouveaux paramètres.

### F. Sécurité
- **Points forts** : Rate limiting systématique, Zod validation, sanitization (DOMPurify, stripHtml), HIBP password check, getClaims auth, SECURITY DEFINER functions.
- **Faiblesses** : CORS wildcard, cron actions sans auth, verify_jwt=false partout (compensé par auth manuelle sauf pour les 2 fonctions citées).

### G. Paiement & Billing
- **Fonctionne structurellement** : create-checkout, check-subscription, customer-portal, confirm-session-purchase — tous avec auth + rate limiting + validation.
- **Non confirmé** : Clés Stripe live vs test, webhooks de synchronisation (le projet utilise le polling comme stratégie documentée).

### H. SEO
- **Fonctionne** : Pages publiques (Landing, Help, Terms, Privacy, About, Contact, Premium, Onboarding) ont toutes des Helmet complets avec JSON-LD.
- **Manquant** : 10+ pages protégées sans Helmet (pas de title, pas de noindex). NotFound sans Helmet.

### I. i18n
- **Fonctionne** : FR/EN/DE couverture sur les modules principaux.
- **Douteux** : Clé `wellbeing.going` utilisée dans EventAttendeesPreview — probablement incorrecte ou manquante.
- **Non confirmé** : Couverture complète de toutes les clés Erasmus+ nouvelles.

### J. Observabilité
- **Fonctionne** : Logger structuré, analytics events, cron monitoring, admin alerts, error reporter.
- **Manquant** : Pas de health check public accessible (seulement via edge function avec body JSON).

---

## 4. PLAN D'ACTION PRIORISÉ

### Correctifs P0 (immédiat)
1. **Créer InstitutionalDashboardPage** ou retirer les références. La migration `get_institutional_metrics` existe en DB — il faut le frontend.
2. **Sécuriser les actions cron** dans `notifications` EF — ajouter une vérification que le token est le service role ou l'anon key du projet.
3. **Corriger EventAttendeesPreview** — utiliser le RPC `get_event_attendees_public` au lieu de requêtes directes bloquées par RLS.

### Correctifs P1 (rapide)
4. Ajouter `<Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>` à toutes les pages protégées sans Helmet.
5. Ajouter un badge "Demo / Données fictives" sur PresidentCockpitPage.
6. Protéger `/newcomer` avec ProtectedRoute dans App.tsx.
7. Remplacer `navigate('/')` dans le render de PresidentCockpitPage par `<Navigate to="/" replace />`.

### Améliorations P2
8. Batch les requêtes EventAttendeesPreview.
9. Unifier notifications/system EF pour utiliser `_shared/auth.ts`.
10. Ajouter clé i18n `events.going` correcte.

### Polish P3
11. Helmet sur NotFound.
12. aria-label sur InclusionRadarSection switches.
13. Délai wellbeing check configurable.

---

## 5. IMPLÉMENTATION IMMÉDIATE (plan)

Les corrections suivantes seront implémentées :

1. **Créer `InstitutionalDashboardPage.tsx`** avec route `/institutional-dashboard` protégée par ProtectedRoute + admin check, branchée sur le RPC `get_institutional_metrics` existant.
2. **Corriger `EventAttendeesPreview.tsx`** pour utiliser `get_event_attendees_public` RPC.
3. **Protéger `/newcomer`** avec ProtectedRoute dans App.tsx.
4. **Ajouter Helmet noindex** à toutes les pages protégées qui en manquent (~10 pages).
5. **Fix PresidentCockpitPage** : remplacer navigate() par `<Navigate>` + ajouter badge "Demo".
6. **Sécuriser notifications EF cron actions** : vérifier que le header Authorization contient l'anon key ou le service role key du projet.
7. **Ajouter Helmet à NotFound**.

### Ne sera PAS implémenté (nécessite décision/accès) :
- Remplacement des données mock de PresidentCockpitPage par des données réelles (décision produit)
- Restriction CORS (configuration Cloud)
- Vérification Stripe live keys (accès externe)
- Unification des helpers auth dans notifications/system (refactoring majeur)

