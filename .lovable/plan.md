

# AUDIT DÉFINITIF PRÉPRODUCTION — NEARVITY v2.0.0

---

## 1. RÉSUMÉ EXÉCUTIF

**Verdict global** : NEARVITY est un produit ambitieux et techniquement solide avec une proposition de valeur claire ("réseau social IRL pour étudiants"), un backend bien sécurisé (RLS, RPC SECURITY DEFINER, rate limiting), et une UX soignée avec dark mode, i18n, PWA. Cependant, le produit souffre de **dette technique résiduelle significative** (`as any` dans 24 fichiers, tables fantômes référencées), de **parcours utilisateur incomplets pour un novice absolu**, et de **preuves sociales vides** (stats à 0, témoignages absents si base vide). Le produit donne l'impression d'un **excellent prototype avancé**, pas encore d'un SaaS production-ready.

**La plateforme est-elle publiable aujourd'hui : OUI SOUS CONDITIONS**

**Note globale : 14/20**

**Niveau de confiance : Modéré**

**Top 5 des risques avant production :**
1. Tables/RPC fantômes (`signal_rate_limits`, `check_signal_rate_limit`) causant des erreurs runtime silencieuses
2. Social proof bar affichant "0 / 0 / 0+" — effet négatif sur la crédibilité
3. Apple OAuth probablement non configuré (échec silencieux)
4. Discover page absente de la navigation mobile (BottomNav)
5. 224 occurrences de `as any` — fragilité TypeScript, risque de régressions silencieuses

**Top 5 des forces réelles :**
1. Architecture sécurité exemplaire : RLS stricte, fonctions SECURITY DEFINER, shadow ban auto, rate limiting multicouche
2. i18n complète (FR/EN/DE) avec traductions réelles, pas des placeholders
3. Landing page bien structurée avec une proposition de valeur claire et différenciante ("NOT a dating app")
4. Système de paiement Stripe intégré avec vérification côté serveur
5. PWA fonctionnelle avec service worker push notifications

---

## 2. TABLEAU SCORE GLOBAL

| Dimension | Note /20 | Observation | Criticité | Décision |
|---|---|---|---|---|
| Compréhension produit | 16 | Clair en <5s. Badge "NOT dating app" efficace | - | OK |
| Landing / Accueil | 15 | Bien structurée mais social proof vide et témoignages potentiellement absents | Majeur | Corriger stats |
| Onboarding | 15 | Flux complet signup/login/location/signals. Email confirmation OK | Mineur | OK |
| Navigation | 14 | Desktop sidebar complète, BottomNav manque /discover | Critique | Ajouter |
| Clarté UX | 14 | Cohérente, dark mode soigné. Certaines pages sans explication (Binome, Discover) | Majeur | Améliorer |
| Copywriting | 15 | Clair, concis, traduit. Quelques termes internes ("Binôme") non expliqués | Mineur | Clarifier |
| Crédibilité / Confiance | 13 | Pages légales OK, mais stats à 0, pas de preuve sociale réelle, domaine lovable.app | Majeur | Corriger |
| Fonctionnalité principale (Map/Signal) | 15 | Complète : signal tricolore, radar, groupes, événements, chat | Mineur | OK |
| Parcours utilisateur | 14 | Parcours principal fluide, mais pas de retour vers /discover depuis mobile | Critique | Corriger |
| Bugs / QA | 11 | Tables fantômes, 224x `as any`, analytics insert avec `as any` | Bloquant prod | Corriger |
| Sécurité préproduction | 16 | RLS solide, auth robuste, rate limiting. Quelques signaux faibles (debug localStorage) | Mineur | Vérifier |
| Conformité go-live | 14 | RGPD OK (cookie consent, export, suppression). Contact email unique pour DPO/legal/support | Mineur | Séparer |

---

## 3. AUDIT PAGE PAR PAGE

### Landing Page — 15/20
- **Objectif** : Convaincre et convertir. **Perçu** : Clair.
- **Clair** : Proposition de valeur, différenciation ("NOT dating app"), pricing transparent
- **Flou** : Qu'est-ce qu'un "signal" concrètement ? La démo animée (SignalDemo) est abstraite sans légende
- **Manque** : Preuves sociales réelles. Si base vide, SocialProofBar affiche "0 utilisateurs actifs / 0 sessions / 0+ complétées" — **effet dévastateur sur la crédibilité**. Les témoignages ne s'affichent que si `is_approved = true` en base — probablement vide au lancement
- **Freine** : Aucun screenshot réel de l'app, seulement une démo animée abstraite
- **Correction P0** : Ajouter des valeurs plancher minimales pour les stats (ex: masquer si 0) ou afficher un message alternatif. Préparer des témoignages seed.

### Onboarding (Signup/Login) — 15/20
- **Clair** : Toggle login/signup, Google/Apple OAuth, magic link, validation Zod, password strength
- **Flou** : Apple OAuth — le code montre un `try/catch` avec `lovable.auth.signInWithOAuth('apple')` mais aucun fallback Supabase contrairement à Google. Si non configuré, échec silencieux.
- **Manque** : Aucun lien vers CGU/Politique de confidentialité sur le formulaire d'inscription. Pour un SaaS européen, c'est un **risque RGPD**.
- **Correction P1** : Ajouter checkbox CGU obligatoire, vérifier configuration Apple OAuth

### Post-Signup Onboarding — 16/20
- **Clair** : 3 étapes (location, activité, confirmation), skip possible, animations fluides
- **Bon** : Explication de la permission localisation avant la demande
- **Manque** : Pas d'explication de ce qu'est un "signal" pour un novice absolu. L'étape 3 montre Vert/Jaune/Rouge mais un utilisateur froid ne comprend pas immédiatement le concept
- **Correction P2** : Ajouter une phrase d'explication "Un signal indique aux autres que vous êtes disponible pour une activité"

### Map Page — 15/20
- **Clair** : Signal tricolore, boutons d'activation, filtres d'activité
- **Bon** : Tutoriel onboarding (MapOnboardingTutorial), emergency button, timer d'expiration
- **Flou** : La carte est vide au premier usage (pas d'autres utilisateurs). L'utilisateur voit une carte blanche sans comprendre quoi faire ensuite
- **Manque** : Le `EmptyRadarState` existe mais l'empty state de la carte map mode n'est pas vérifié
- **Correction P1** : Améliorer l'empty state avec un CTA "Invite tes amis" ou "Découvre les utilisateurs"

### Discover Page — 14/20
- **Critique** : Absente de la BottomNav mobile. Seuls les utilisateurs desktop la voient via la sidebar. Sur mobile (cible principale = étudiants), cette page est **inaccessible** sauf via URL directe.
- **Bon** : Filtres par activité/université, indicateur "en ligne", badges vérification
- **Flou** : L'action après avoir vu un utilisateur n'est pas claire. Pas de bouton "Connecter" visible dans le code lu
- **Correction P0** : Ajouter à la BottomNav ou remplacer un onglet existant

### Conversations Page — 14/20
- **Clair** : Liste de conversations, recherche, chat intégré
- **Manque** : Pas de BottomNav sur cette page (elle est accessible mais sans navigation retour rapide vers Map)
- **Correction P2** : Vérifier que le BottomNav est bien rendu

### Binome (Sessions) Page — 13/20
- **Flou** : Le terme "Binôme" n'est compris que dans le contexte universitaire français. Un utilisateur international ou même un étudiant français non familier peut ne pas comprendre
- **Bon** : Onboarding conditionnel, quota visible, filtres par ville, création de session complète
- **Manque** : La page nécessite de filtrer par ville mais ne propose pas de détection auto de la ville. L'utilisateur doit taper manuellement.
- **Correction P2** : Auto-remplir la ville à partir de la géolocalisation

### Premium Page — 15/20
- **Clair** : 3 offres (Gratuit, Session unitaire, Nearvity+), features listées, badges
- **Bon** : Gestion retour Stripe (success/cancel), confetti de célébration
- **Manque** : Pas de FAQ pricing, pas de garantie satisfait-ou-remboursé affichée
- **Correction P2** : Ajouter FAQ

### Settings Page — 15/20
- **Clair** : Ghost mode, distance visibilité, notifications, thème, langue
- **Bon** : Reset settings, diagnostics dev, admin conditionnel
- **Risque mineur** : `isDev` se base sur `localStorage.getItem('debug') === 'true'` — n'importe qui peut activer le mode debug. Vérifier que les diagnostics n'exposent rien de sensible.
- **Correction P3** : Supprimer le fallback localStorage en production

### Profile Page — 15/20
- **Clair** : Menu structuré, QR code, référence, stats
- **Bon** : Partage via Web Share API, logout avec confirmation
- **Correction P3** : RAS majeur

### Help Page — 16/20
- **Clair** : FAQ structurée avec recherche, liens support/CGU
- **Bon** : Contact email visible, FAQ couvre les questions essentielles
- **Correction** : Aucune critique majeure

### Terms / Privacy Pages — 15/20
- **Clair** : Contenu réel (pas lorem ipsum), sections structurées, email DPO
- **Manque** : Contact DPO = contact support = contact legal = même email. En RGPD strict, le DPO devrait être identifié distinctement (même si c'est la même personne physique, le rôle doit être clair)
- **Correction P2** : Préciser "DPO : contact@emotionscare.com" explicitement

---

## 4. AUDIT FONCTIONNALITÉ PAR FONCTIONNALITÉ

| Fonctionnalité | Utilité | Clarté | Fluidité | Confiance | Note /20 | Défauts |
|---|---|---|---|---|---|---|
| Signal tricolore | Haute | Bonne | Bonne | Bonne | 16 | Concept nécessite explication initiale |
| Carte interactive | Haute | Bonne | Bonne | Bonne | 15 | Dépend du token Mapbox (edge function) |
| Radar view | Moyenne | Bonne | Bonne | Bonne | 15 | Vue alternative peu différenciée |
| Group signals | Haute | Bonne | Bonne | Bonne | 14 | Nouveau, pas de retour utilisateur |
| Chat (1-1 et group) | Haute | Bonne | Bonne | Bonne | 15 | Realtime activé |
| Sessions Binôme | Haute | Moyenne | Bonne | Bonne | 13 | Terme flou, ville manuelle |
| Events | Moyenne | Bonne | Bonne | Bonne | 14 | QR check-in solide |
| Discover | Haute | Bonne | Bonne | Moyenne | 12 | Inaccessible sur mobile |
| Gamification | Faible | Bonne | Bonne | Bonne | 14 | Complet (streaks, achievements) |
| Premium/Stripe | Haute | Bonne | Bonne | Bonne | 15 | Polling Stripe OK |
| Emergency button | Haute | Bonne | N/A | Haute | 16 | Bon garde-fou sécurité |
| Cookie consent | Obligatoire | Bonne | Bonne | Bonne | 15 | RGPD conforme |

---

## 5. PARCOURS UTILISATEUR CRITIQUES

### Parcours 1 : Landing → Inscription → Première utilisation — 14/20
- **Étapes** : Landing → CTA → Onboarding form → Email confirmation → Post-signup onboarding → Map
- **Frictions** : Email confirmation bloquante (bon pour la sécurité, friction pour le test). Post-signup onboarding demande la localisation — si refusé, la carte est inutilisable.
- **Rupture** : Après le post-signup, l'utilisateur arrive sur une carte vide. Aucun autre utilisateur. Le produit semble mort. **Moment critique d'abandon.**
- **Correctif P0** : Afficher un message encourageant ou diriger vers /discover quand la carte est vide

### Parcours 2 : Activation signal → Découverte → Connexion — 13/20
- **Étapes** : Map → Activer signal → Choisir activité → Attendre → Voir quelqu'un → Cliquer → Reveal → Icebreaker → Connecter
- **Friction** : Si personne n'est à proximité, le parcours s'arrête. Pas de suggestion de créer un groupe ou de découvrir des utilisateurs.
- **Correctif P1** : Lier les fonctionnalités entre elles (Map vide → suggérer Discover ou Group)

### Parcours 3 : Création Binôme → Rejoindre → Feedback — 15/20
- **Étapes** : Binôme → Créer session → Choisir ville/activité/date → Attendre → Session → Check-in → Feedback
- **Friction** : Nécessite une ville manuelle. Quota visible mais le flow vers Premium est clair.
- **Bon** : Feedback post-session avec impact sur fiabilité. Annulation tardive pénalisée.

---

## 6. SÉCURITÉ / GO-LIVE READINESS

| Observé | Risque | Action avant prod |
|---|---|---|
| RLS activé sur toutes les tables | Faible | Aucune |
| Fonctions SECURITY DEFINER avec search_path | Faible | Aucune |
| Shadow ban auto après 3 signalements | Faible | Aucune |
| Rate limiting multi-niveau (login, signup, reveal, signals) | Faible | Aucune |
| `localStorage.getItem('debug')` active diagnostics | Faible | **Vérifier** que diagnostics n'expose rien |
| Edge functions avec `verify_jwt = false` + validation manuelle | Acceptable si bien implémenté | **Vérifier** `_shared/auth.ts` |
| `(supabase as any)` pour `signal_rate_limits` et `check_signal_rate_limit` | **Critique** | **Table/RPC n'existe probablement pas** — erreur silencieuse en runtime |
| Coordonnées fuzzées à 3 décimales (~100m) | Bon | Aucune |
| Pas de checkbox CGU à l'inscription | **Majeur** (RGPD) | **Ajouter** |
| DPO/Legal/Support = même email | Mineur (RGPD) | Clarifier rôles |
| Apple OAuth potentiellement non configuré | Moyen | **Tester ou retirer le bouton** |
| `SocialProofBar` insère des analytics avec `as any` (ligne 48) | Mineur | Corriger le cast |
| `referrals` table accédée avec `as any` dans useReferral | Moyen — table existe en DB mais pas dans les types générés | Régénérer types |

**Signaux faibles / Non vérifiables :**
- Configuration Stripe (clés, webhooks) — ne peut pas être vérifiée ici
- Token Mapbox — dépend de l'edge function `get-mapbox-token` et du secret configuré
- Push notifications — dépend de la configuration VAPID
- Emails transactionnels (confirmation, reset) — dépend de la config Supabase Auth

---

## 7. LISTE DES PROBLÈMES PRIORISÉS

### P0 — Bloquant production

1. **Tables/RPC fantômes dans le code**
   - Impact : Erreurs runtime silencieuses lors de l'activation de signal
   - Où : `useActiveSignal.ts` (L98, L125), `useSignalRateLimit.ts` (L35, L48, L71, L110)
   - Pourquoi : Référence à `signal_rate_limits` et `check_signal_rate_limit` qui n'existent pas dans le schéma DB
   - Criticité : Bloquant production
   - Correction : Créer la table et la RPC, OU supprimer le rate limiting signal côté client (celui serveur via `rate_limit_logs` existe déjà)

2. **Social Proof Bar affiche 0/0/0+ en base vide**
   - Impact : Détruit la crédibilité immédiatement
   - Où : `SocialProofBar.tsx`
   - Correction : Ne pas afficher si toutes les valeurs sont 0, OU afficher un message alternatif, OU seeder des données minimales

3. **Discover page inaccessible sur mobile**
   - Impact : Fonctionnalité majeure invisible pour la cible principale (étudiants mobile)
   - Où : `BottomNav.tsx` — pas de lien vers `/discover`
   - Correction : Ajouter un onglet Discover dans le BottomNav ou l'intégrer dans un onglet existant

### P1 — Très important

4. **Pas de checkbox CGU/Confidentialité à l'inscription**
   - Impact : Risque RGPD
   - Où : `OnboardingPage.tsx`, step 1 signup form
   - Correction : Ajouter "J'accepte les CGU et la Politique de confidentialité" avec liens

5. **Apple OAuth non vérifié**
   - Impact : Bouton présent mais potentiellement non fonctionnel
   - Où : `OnboardingPage.tsx` L100-114
   - Correction : Tester, ou retirer le bouton si non configuré

6. **Carte vide sans redirection**
   - Impact : L'utilisateur arrive sur une carte vide, pense que le produit est mort, abandonne
   - Où : `MapPage.tsx`
   - Correction : Ajouter un call-to-action "Invite tes amis" ou "Découvre des utilisateurs" quand 0 signaux à proximité

### P2 — Amélioration forte valeur

7. **224 occurrences de `as any`** — fragilité TypeScript, 10+ dans du code non-test
8. **Terme "Binôme" incompréhensible hors contexte** — renommer ou ajouter sous-titre explicatif
9. **Ville manuelle dans Binôme** — auto-detect depuis géolocalisation
10. **Pas de FAQ pricing sur la page Premium**
11. **Contact DPO non explicitement identifié** dans les pages légales

### P3 — Confort / Finition

12. **Mode debug accessible via localStorage** — supprimer en prod
13. **TAGLINE en dur en français** dans `constants.ts` (non traduit via i18n)
14. **Testimonials section vide** si aucun témoignage approuvé en base

---

## 8. VERDICT FINAL

### La plateforme est-elle réellement prête ?
**Non, pas en l'état.** Trois problèmes l'en empêchent :
1. Le code référence des tables/RPC qui n'existent pas (`signal_rate_limits`, `check_signal_rate_limit`) — cela causera des erreurs silencieuses dès qu'un utilisateur active un signal
2. La social proof bar affiche des zéros — premier contact destructeur pour la crédibilité
3. La fonctionnalité Discover est invisible pour 80%+ des utilisateurs (mobile)

### Qu'est-ce qui empêcherait un expert d'autoriser la mise en production ?
Les tables/RPC fantômes. C'est un bug runtime qui touche la fonctionnalité principale du produit (activation de signal). Tant que ce n'est pas corrigé, c'est un no-go.

### Qu'est-ce qui donne confiance ?
L'architecture sécurité est excellente. Le backend est rigoureux (RLS, SECURITY DEFINER, rate limiting, shadow ban auto, location fuzzing). L'i18n est complète. Le design est cohérent et professionnel. Le code est bien structuré (lazy loading, barrel exports, séparation hooks/components).

### Les 3 corrections les plus rentables à faire immédiatement :
1. **Créer la table `signal_rate_limits` et la RPC `check_signal_rate_limit`** — corrige le P0 qui casse la fonctionnalité principale
2. **Masquer/conditionner la SocialProofBar** quand les stats sont à 0 — 5 min de travail, impact crédibilité énorme
3. **Ajouter /discover au BottomNav** — rend une fonctionnalité majeure accessible à la cible principale

### Si j'étais décideur externe, publierais-je aujourd'hui ?
**Non.** Je publierais après les 3 corrections ci-dessus (estimées à 2-4h de travail). Le produit est à 95% prêt. Ces 5% restants sont précisément les points qui feraient fuir un utilisateur réel lors des 30 premières secondes d'utilisation.

