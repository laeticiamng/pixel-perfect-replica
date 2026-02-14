# AUDIT COMPLET - NEARVITY

**Date :** 14 Fevrier 2026
**Projet :** NEARVITY - Le Premier Reseau Social 100% Reel
**Version :** 2.0.0
**Proprietaire :** EmotionsCare SASU (France)

---

## TABLE DES MATIERES

1. [Resume Executif](#1-resume-executif)
2. [Audit Technique](#2-audit-technique)
   - 2.1 [Securite](#21-securite)
   - 2.2 [Performance](#22-performance)
   - 2.3 [Qualite du Code](#23-qualite-du-code)
   - 2.4 [Architecture](#24-architecture)
   - 2.5 [Tests](#25-tests)
   - 2.6 [Edge Functions (Backend)](#26-edge-functions-backend)
3. [Audit Non-Technique](#3-audit-non-technique)
   - 3.1 [UX / Experience Utilisateur](#31-ux--experience-utilisateur)
   - 3.2 [Accessibilite (a11y)](#32-accessibilite-a11y)
   - 3.3 [SEO](#33-seo)
   - 3.4 [PWA](#34-pwa)
   - 3.5 [Internationalisation (i18n)](#35-internationalisation-i18n)
   - 3.6 [Documentation](#36-documentation)
   - 3.7 [Conformite Legale / RGPD](#37-conformite-legale--rgpd)
4. [Tableau Recapitulatif](#4-tableau-recapitulatif)
5. [Plan d'Action Priorise](#5-plan-daction-priorise)

---

## 1. RESUME EXECUTIF

NEARVITY est une application PWA mobile-first de reseau social base sur la proximite geographique, construite avec React 18, TypeScript, Tailwind CSS et Supabase. L'application cible les etudiants et jeunes professionnels souhaitant se connecter spontanement dans la vie reelle.

### Points Forts
- Stack technologique moderne et bien structure (React 18 + TypeScript + Vite + Zustand)
- Design System coherent avec shadcn/ui et Tailwind CSS
- PWA de qualite (installable, manifest complet, service worker)
- SEO excellent (JSON-LD, Open Graph, sitemap, canonical)
- Suite de tests comprehensive (24 fichiers de test)
- Systeme i18n fonctionnel (FR/EN)
- Sanitisation des inputs correcte (XSS, HTML)
- UI soignee avec animations Framer Motion

### Points Critiques
- **Credentials Supabase en dur dans le code source** (vite.config.ts)
- CORS trop permissif (`*`) sur les edge functions sensibles
- Rate limiting uniquement cote client (contournable)
- Configuration TypeScript trop permissive (`strict: false`)
- Validation de mot de passe trop faible (6 caracteres min)
- `user-scalable=no` bloque le zoom (violation accessibilite)

### Score Global

| Domaine | Note | Commentaire |
|---------|------|-------------|
| Securite | 5/10 | Credentials exposees, CORS permissif |
| Performance | 6/10 | Fuites memoire, re-renders inutiles |
| Qualite du Code | 7/10 | Bonne structure, mais TypeScript laxiste |
| Architecture | 8/10 | Separation claire, hooks bien decoupes |
| Tests | 8/10 | Bonne couverture, tests securite inclus |
| UX | 8/10 | Mobile-first reussi, bons etats vides/chargement |
| Accessibilite | 5/10 | ARIA manquants, zoom desactive, focus absent |
| SEO | 9/10 | Excellent (JSON-LD, OG, sitemap) |
| PWA | 9/10 | Manifest complet, icones, service worker |
| i18n | 7/10 | FR/EN couvert, mais formatage dates manquant |

---

## 2. AUDIT TECHNIQUE

### 2.1 SECURITE

#### CRITIQUE - Credentials en dur dans le code source

**Fichier :** `vite.config.ts:13-14`

```typescript
'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://afvssugntxjolqqeyffn.supabase.co'),
'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1Ni...'),
```

- **Impact :** Les credentials Supabase (URL + JWT anon key) sont commitees dans le code source, exposees a quiconque a acces au repo.
- **Recommandation :** Supprimer les valeurs par defaut, exiger les variables d'environnement uniquement. Revoquer et regenerer les cles exposees.

---

#### CRITIQUE - CORS trop permissif sur endpoints sensibles

**Fichiers concernes :**
- `supabase/functions/create-checkout/index.ts:7` - `"Access-Control-Allow-Origin": "*"`
- `supabase/functions/get-mapbox-token/index.ts:5` - `"Access-Control-Allow-Origin": "*"`
- `supabase/functions/ai-assistant/index.ts:5` - `"Access-Control-Allow-Origin": "*"`

- **Impact :** N'importe quel site web peut appeler ces endpoints, y compris le checkout Stripe et la distribution de tokens Mapbox.
- **Recommandation :** Restreindre a `"Access-Control-Allow-Origin": "https://nearvity.fr"`.

---

#### HAUTE - Rate limiting uniquement cote client

**Fichier :** `src/hooks/useRateLimit.ts:1-112`

Le systeme de rate limiting est entierement implemente cote client (localStorage). Un attaquant peut le contourner en desactivant JavaScript ou en manipulant le stockage local.

**Fichier :** `supabase/functions/ai-assistant/index.ts:40`

Le rate limiting cote serveur est en memoire (`Map`), il se reinitialise a chaque redemarrage de la fonction.

- **Recommandation :** Implementer un rate limiting persistant cote serveur (table Supabase ou Redis).

---

#### HAUTE - Configuration TypeScript trop permissive

**Fichier :** `tsconfig.app.json:20-24`

```json
"strict": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noImplicitAny": false,
"noFallthroughCasesInSwitch": false
```

- **Impact :** Les erreurs de type silencieuses augmentent le risque de bugs et de vulnerabilites.
- **Recommandation :** Activer `strict: true` progressivement.

---

#### HAUTE - Console.log avec donnees sensibles

**Fichier :** `src/hooks/useSupabaseAuth.ts:77`

```typescript
console.log('Auth state changed:', event, session?.user?.id);
```

**Fichier :** `supabase/functions/ai-assistant/index.ts:82`

```typescript
console.log(`[ai-assistant] Action: ${action}`, JSON.stringify(body, null, 2));
```

- **Impact :** IDs utilisateurs et corps de requetes (preferences, interets) exposes dans les logs.
- **Recommandation :** Supprimer les console.log ou utiliser un service de logging avec niveaux.

---

#### MOYENNE - Validation de mot de passe trop faible

**Fichier :** `src/lib/validation.ts:9-15`

```typescript
.min(6, { message: "Mot de passe trop court (min 6 caracteres)" })
```

**Fichier :** `src/lib/validation.ts:32`

```typescript
password: z.string().min(4, { message: "Mot de passe requis" }),
```

- **Impact :** 6 caracteres est en dessous des recommandations NIST/ANSSI (12+ recommandes). La validation login accepte 4 caracteres.
- **Recommandation :** Augmenter le minimum a 12 caracteres, harmoniser login et signup.

---

#### MOYENNE - Sanitisation HTML basee sur regex

**Fichier :** `src/lib/sanitize.ts:92-109`

```typescript
.replace(/javascript\s*:/gi, '')
.replace(/vbscript\s*:/gi, '')
```

- **Impact :** Les regex peuvent etre contournees par des encodages speciaux ou des vecteurs d'attaque modernes.
- **Recommandation :** Utiliser une librairie dediee (DOMPurify).

---

#### MOYENNE - Header Origin non valide dans Stripe Checkout

**Fichier :** `supabase/functions/create-checkout/index.ts:106`

```typescript
const origin = req.headers.get("origin") || "https://nearvity.fr";
success_url: `${origin}/premium?success=true`
```

- **Impact :** Vulnerabilite de redirection ouverte (open redirect). L'attaquant peut forger l'header Origin.
- **Recommandation :** Valider l'origin contre une whitelist.

---

#### MOYENNE - localStorage pour les tokens d'authentification

**Fichier :** `src/integrations/supabase/client.ts:13`

```typescript
storage: localStorage
```

- **Impact :** Vulnerable aux attaques XSS qui pourraient voler le token.
- **Recommandation :** Considerer les cookies httpOnly si possible.

---

#### MOYENNE - Headers de securite HTTP manquants

**Fichier :** `index.html`

Pas de Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, ou Referrer-Policy.

- **Recommandation :** Configurer les headers HTTP au niveau du serveur :
  ```
  Content-Security-Policy: default-src 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Strict-Transport-Security: max-age=31536000
  ```

---

#### BASSE - Regex email trop permissive

**Fichier :** `src/lib/sanitize.ts:46` et `src/lib/validation.ts:72`

```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

- **Impact :** Accepte des emails invalides (`test@.com`, `@test.com`).
- **Recommandation :** Utiliser `z.string().email()` de Zod.

---

#### BASSE - Regles ESLint desactivees

**Fichier :** `eslint.config.js:23`

```javascript
"@typescript-eslint/no-unused-vars": "off"
```

- **Recommandation :** Activer en mode "warn".

---

### 2.2 PERFORMANCE

#### CRITIQUE - Fuite memoire - Subscriptions non nettoyees

**Fichier :** `src/hooks/useActiveSignal.ts:374-431`

Le canal Supabase realtime peut accumuler des subscriptions multiples si le composant se re-rend avant que le nettoyage ne s'execute. L'`eslint-disable-next-line react-hooks/exhaustive-deps` masque le probleme.

- **Recommandation :** Revoir la gestion des dependencies de l'effet et garantir le nettoyage.

---

#### HAUTE - Re-renders inutiles - InteractiveMap

**Fichier :** `src/components/map/InteractiveMap.tsx:71-78`

```typescript
const initialViewState = useMemo(() => ({
  latitude: position?.latitude || 48.8566,
  // ...
}), []); // DEPENDANCE MANQUANTE: position
```

- **Impact :** Le `useMemo` a un tableau de dependances vide alors qu'il utilise `position`.

---

#### HAUTE - Cascade d'effets avec fetches multiples

**Fichier :** `src/hooks/useMapPageLogic.ts:72-110`

Trois `useEffect` distincts declenchent `fetchNearbyUsers` simultanement, creant des requetes reseau concurrentes et des conditions de course potentielles.

- **Recommandation :** Consolider les effets et utiliser un debounce.

---

#### MOYENNE - Calculs de distance dupliques

**Fichier :** `src/hooks/useActiveSignal.ts:344-357` et `src/hooks/useSignalMatching.ts:36-44`

La formule de Haversine est implementee en double dans deux hooks differents.

- **Recommandation :** Centraliser dans `src/utils/distance.ts` (qui existe deja).

---

#### MOYENNE - Pas de timeout sur le fetch du token Mapbox

**Fichier :** `src/components/map/InteractiveMap.tsx:104-143`

Aucun timeout ni mecanisme de retry. Si l'endpoint est lent ou hors service, la carte reste bloquee indefiniment.

---

#### MOYENNE - Animations CSS inutilisees

**Fichier :** `src/index.css:415-511`

Keyframes `confetti`, `breathing`, `shimmer`, `scan` definis mais jamais references dans les composants.

- **Impact :** Taille du bundle CSS augmentee inutilement.

---

#### MOYENNE - Condition de course - Mises a jour de signal

**Fichier :** `src/hooks/useActiveSignal.ts:62-137`

Deux requetes separees (check existence + update/insert) creent une fenetre de condition de course.

- **Recommandation :** Utiliser un upsert atomique.

---

### 2.3 QUALITE DU CODE

| Aspect | Evaluation | Details |
|--------|-----------|---------|
| Structure des fichiers | Bonne | Separation claire components/hooks/stores/pages |
| Conventions de nommage | Bonne | PascalCase composants, camelCase hooks/utils |
| Typage TypeScript | Faible | `strict: false`, types dupliques, `any` implicite |
| Gestion d'erreurs | Moyenne | Try-catch presents mais errors silencieuses |
| Duplication de code | Moyenne | Distance calc en double, types redefinis |
| Nombres magiques | Presente | 500ms, 200m, 30000ms non extraits en constantes |
| Commentaires | Faibles | Peu de JSDoc, pas de documentation inline |
| Imports | Bons | Alias `@/` bien configure, barrel exports |

#### Types dupliques

**Fichier :** `src/hooks/useActiveSignal.ts:9-10`
```typescript
type SignalType = 'green' | 'yellow' | 'red';
type ActivityType = 'studying' | 'eating' | 'working' | 'talking' | 'sport' | 'other';
```

**Fichier :** `src/components/map/InteractiveMap.tsx:20-32`

L'interface `NearbyUser` est redefinie localement au lieu d'importer depuis `src/types/signal.ts`.

---

#### Echecs async silencieux

**Fichier :** `src/hooks/useActiveSignal.ts:159-170`

```typescript
const updatePosition = async () => {
  await supabase
    .from('active_signals')
    .update({...})
    .eq('user_id', user.id);
  // PAS DE GESTION D'ERREUR
};
```

---

### 2.4 ARCHITECTURE

#### Points Forts
- **Separation des responsabilites :** Components UI / Hooks logique / Stores etat / Pages routing
- **State management :** Zustand pour l'etat client, React Query pour l'etat serveur, Context pour l'auth
- **40+ hooks customs** avec responsabilites bien delimitees
- **Composants shadcn/ui** pour une UI coherente et accessible
- **Edge Functions Supabase** pour la logique backend
- **PWA avec service worker** pour l'experience mobile

#### Points a Ameliorer
- **Pas d'Error Boundary** autour de la page Map (`src/pages/MapPage.tsx`). Un crash dans InteractiveMap fait tomber toute la page.
- **Pas d'abstraction API** : les appels Supabase sont directement dans les hooks. Une couche service serait plus maintenable.
- **Dependencies entre hooks** : `useMapPageLogic` orchestre trop de hooks, creant un couplage fort.

---

### 2.5 TESTS

#### Couverture : 24 fichiers de test

| Categorie | Fichiers | Evaluation |
|-----------|----------|-----------|
| Smoke tests | smoke.test.ts | Bon |
| Securite | security.test.ts | Excellent |
| E2E critiques | e2e-critical-paths.test.tsx | Excellent |
| Auth | auth.test.ts | Bon |
| Integration | integration.test.ts | Bon |
| Binome | binome-reservation.test.ts | Bon |
| Premium | premium-pricing.test.ts | Bon |
| Cache | cache.test.ts | Bon |
| Distance | distance.test.ts | Bon |

#### Points Forts
- Tests de securite dedies (XSS, sanitisation, rate limiting)
- E2E couvrant tous les chemins critiques (auth, map, binome, premium, RGPD)
- Validation schemas testee

#### Lacunes
- **Pas de mocks d'erreur** dans `src/test/setup.ts` (toutes les operations reussissent)
- **Pas de tests CSRF**
- **Pas de tests d'edge cases** pour la validation email
- **Pas de tests de composants** isolees (rendering tests)
- **Pas d'integration continue** visible (pas de CI/CD config)

---

### 2.6 EDGE FUNCTIONS (BACKEND)

#### Analyse de Securite par Fonction

| Fonction | Auth | Validation | CORS | Severite |
|----------|------|------------|------|----------|
| create-checkout | JWT valide | Partielle | `*` CRITIQUE | Haute |
| check-subscription | Bearer + email | OK | `*` | Haute |
| get-mapbox-token | JWT Claims | OK | `*` | Haute |
| ai-assistant | Optionnelle | Faible | `*` | Haute |
| purchase-session | Bearer + email | Clamp 1-10 | `*` | Moyenne |
| notifications | Admin verif | OK | OK | Basse |
| confirm-session-purchase | Bearer | Clamp 1-10 | OK | Basse |
| customer-portal | Bearer + email | OK | OK | Basse |

#### Problemes Specifiques

1. **ai-assistant** : Risque d'injection de prompt (`context.other_user_name` non sanitise, ligne 160-161)
2. **notifications** : Injection HTML dans les emails via `subject` et `message` (ligne 232)
3. **create-checkout / purchase-session** : Header Origin non valide utilise pour les URLs de redirect

---

## 3. AUDIT NON-TECHNIQUE

### 3.1 UX / EXPERIENCE UTILISATEUR

#### Points Forts

| Aspect | Evaluation | Details |
|--------|-----------|---------|
| Mobile-first | Excellent | Container 540px max, bottom nav, swipe |
| Etats de chargement | Bon | FullPageLoader + LoadingSkeleton (5 variantes) |
| Etats vides | Bon | EmptyState reutilisable avec icone + CTA |
| Etats d'erreur | Bon | ErrorBoundary + NotFound (404) |
| Feedback utilisateur | Bon | Toasts (Sonner), confetti, animations |
| Onboarding | Bon | Flux multi-etapes avec progression visuelle |
| Navigation | Bon | Bottom nav + swipe + Cmd+K (command palette) |
| Dark mode | Bon | Theme par defaut sombre, toggle clair |
| Offline | Partiel | Banniere offline, mais pas de mode hors-ligne complet |

#### Points a Ameliorer

- **Pas de confirmation de suppression** visible pour certaines actions critiques
- **Pas de skelton loading** sur la carte Map (chargement texte uniquement)
- **Mode offline** annonce dans le README mais non implemente completement
- **Pas de feedback haptique** documente (mentionne dans les settings mais implementation non verifiee)

---

### 3.2 ACCESSIBILITE (a11y)

#### CRITIQUE - Zoom desactive

**Fichier :** `index.html:5`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

- **Impact :** Viole WCAG 2.1 Success Criterion 1.4.4. Les utilisateurs malvoyants ne peuvent pas zoomer.
- **Recommandation :** Supprimer `maximum-scale=1.0, user-scalable=no` ou utiliser `maximum-scale=5.0`.

---

#### HAUTE - Attributs ARIA manquants

| Composant | Fichier | Probleme |
|-----------|---------|----------|
| Bouton retour | `shared/PageHeader.tsx` | Manque `aria-label` explicite |
| Toggle password | `OnboardingPage.tsx:318` | Manque `aria-label` |
| Dots de progression | `OnboardingPage.tsx:740` | Manque `aria-current="step"` |
| Icones | `shared/EmptyState.tsx:35` | Pas de label sur les icones |
| Settings toggle | `shared/SettingsRow.tsx:75` | Switch sans `aria-label` |
| Slider | `shared/SettingsRow.tsx:89` | Manque `aria-valuemin/max/now` |
| Stats cards | `map/StatsGrid.tsx:29` | Elements cliquables sans `role="button"` |

---

#### HAUTE - Indicateurs de focus manquants

Les boutons de la landing page (`HeroSection.tsx:67-83`), de l'ErrorBoundary (`ErrorBoundary.tsx:71-85`), et des settings (`SettingsRow.tsx:136`) n'ont pas de styles de focus visibles pour la navigation clavier.

---

#### MOYENNE - Pas de regions aria-live

Les messages d'erreur de formulaire (`OnboardingPage.tsx:300-350`) ne sont pas annonces aux lecteurs d'ecran. Il manque `aria-live="polite"` ou `role="alert"`.

---

#### MOYENNE - Cibles tactiles trop petites

**Fichier :** `src/components/CookieConsent.tsx:67`

Boutons de cookie consent : `h-9 text-xs` = 36px (minimum WCAG : 44x44px).

---

#### BASSE - Contraste de couleurs

Les textes `text-muted-foreground` et `text-[10px]` pourraient ne pas respecter le ratio WCAG AA (4.5:1). Aucun audit de contraste formel n'a ete effectue.

---

### 3.3 SEO

#### Score : 9/10 - Excellent

| Element | Status | Details |
|---------|--------|---------|
| Meta description | Present | `index.html:15-16` |
| Open Graph | Complet | Titre, description, image, type (`index.html:85-93`) |
| Twitter Cards | Complet | `summary_large_image` (`index.html:97-101`) |
| JSON-LD | Excellent | SoftwareApplication + Organization + AggregateRating (`index.html:25-77`) |
| Canonical | Present | `index.html:19` |
| Hreflang | Present | FR + x-default (`index.html:20-22`) |
| Sitemap | Present | `public/sitemap.xml` |
| Robots.txt | Present | Routes privees bloquees correctement |
| Lang HTML | Present | `<html lang="fr">` |

#### Points a Ameliorer

- **sitemap.xml** : Pas de `<lastmod>` timestamps, meme `changefreq/priority` pour toutes les pages
- **robots.txt** : Pas de directive `Crawl-delay`
- **Pas de `security.txt`** (`.well-known/security.txt`) pour le signalement de vulnerabilites

---

### 3.4 PWA

#### Score : 9/10 - Excellent

**Fichier :** `public/manifest.webmanifest`

| Element | Status |
|---------|--------|
| Nom complet | "NEARVITY - Le premier reseau social 100% reel" |
| Nom court | "NEARVITY" |
| Display | standalone |
| Orientation | portrait |
| Icones 192x192 | Present (PNG) |
| Icones 512x512 | Present (PNG, maskable) |
| Theme color | #0f0f1a |
| Categories | social, lifestyle |
| Service Worker | Auto-update via VitePWA |
| Caching | Workbox, max 3MB, Google Fonts 365j |

#### Points a Ameliorer

- Pas de `screenshots` dans le manifest (utile pour les stores)
- Pas de `shortcuts` pour le deep linking
- Entree d'icone dupliquee (lignes 14-15)

---

### 3.5 INTERNATIONALISATION (i18n)

#### Score : 7/10 - Bon

| Aspect | Status |
|--------|--------|
| Langues supportees | Francais (FR) + Anglais (EN) |
| Cles de traduction | 150+ |
| Navigation | Traduite |
| Auth | Traduite |
| Erreurs | Traduites |
| Activites/Icebreakers | Traduits (contextualises) |
| Hook `useTranslation()` | Fonctionnel |

#### Points a Ameliorer

- **Pas de formatage de dates** localise (date-fns non configure avec locale)
- **Pas de formatage de nombres** (distances, prix)
- **Pas de support RTL** (non bloquant pour FR/EN)
- **Contenu dynamique** (noms de signaux, types d'activites) non toujours passe par `t()`

---

### 3.6 DOCUMENTATION

| Document | Status | Commentaire |
|----------|--------|-------------|
| README.md | Present | 260 lignes, structure claire |
| .env.example | Present | Variables d'environnement documentees |
| CHANGELOG | Mentionne | Page changelog dans l'app |
| API docs | Absent | Pas de documentation des edge functions |
| Architecture docs | Absent | Pas de diagramme d'architecture |
| Contributing guide | Absent | Pas de guide de contribution |
| JSDoc/TSDoc | Faible | Tres peu de documentation inline |

---

### 3.7 CONFORMITE LEGALE / RGPD

#### Points Forts
- Page CGU (`/terms`) avec traductions
- Page Politique de Confidentialite (`/privacy`) avec traductions
- Consentement cookies (CookieConsent component)
- Export RGPD des donnees (`/data-export`)
- Suppression de compte (`DeleteAccountDialog`)
- Gestion des utilisateurs bloques (`/blocked-users`)
- Ghost mode (invisibilite)
- Shadow ban automatique (3+ signalements/24h)

#### Points a Ameliorer
- **Pas de bandeau cookies conforme ePrivacy** : le composant actuel ne distingue pas les categories de cookies (necessaires, analytiques, marketing)
- **Pas de DPO** (Delegue a la Protection des Donnees) identifie
- **Pas de registre des traitements** visible
- **Retention des donnees** non documentee

---

## 4. TABLEAU RECAPITULATIF

### Problemes par Severite

| Severite | Nombre | Exemples |
|----------|--------|----------|
| CRITIQUE | 3 | Credentials en dur, CORS `*`, fuite memoire |
| HAUTE | 8 | Rate limit client, TS laxiste, logs sensibles, ARIA manquants, zoom desactive |
| MOYENNE | 10 | Mot de passe faible, sanitisation regex, Origin non valide, targets tactiles |
| BASSE | 5 | ESLint off, regex email, animations inutilisees |

### Repartition par Domaine

```
Securite        : 3 critiques, 4 hautes, 5 moyennes, 2 basses
Performance     : 1 critique, 2 hautes, 4 moyennes
Qualite Code    : 2 hautes, 3 moyennes, 1 basse
Architecture    : 1 haute, 1 moyenne
Tests           : 4 moyennes
Accessibilite   : 1 critique, 2 hautes, 2 moyennes, 1 basse
SEO             : 3 basses
UX              : 2 moyennes
```

---

## 5. PLAN D'ACTION PRIORISE

### Phase 1 - Corrections Critiques (Immediat)

| # | Action | Fichier(s) | Impact |
|---|--------|-----------|--------|
| 1 | Supprimer les credentials Supabase en dur | `vite.config.ts:13-14` | Securite |
| 2 | Revoquer et regenerer les cles exposees | Supabase Dashboard | Securite |
| 3 | Restreindre CORS aux origines autorisees | Toutes edge functions | Securite |
| 4 | Supprimer `user-scalable=no` du viewport | `index.html:5` | Accessibilite |
| 5 | Corriger la fuite memoire realtime | `useActiveSignal.ts:374-431` | Performance |

### Phase 2 - Corrections Hautes (Court terme)

| # | Action | Fichier(s) | Impact |
|---|--------|-----------|--------|
| 6 | Implementer rate limiting serveur persistant | Edge functions | Securite |
| 7 | Activer TypeScript strict progressivement | `tsconfig.app.json` | Qualite |
| 8 | Supprimer les console.log sensibles | `useSupabaseAuth.ts`, edge functions | Securite |
| 9 | Augmenter minimum mot de passe a 12 caracteres | `validation.ts:9-15` | Securite |
| 10 | Ajouter ARIA labels sur tous les elements interactifs | Composants UI | Accessibilite |
| 11 | Ajouter des styles de focus visibles | Composants boutons/liens | Accessibilite |
| 12 | Valider l'header Origin dans Stripe checkout | `create-checkout/index.ts:106` | Securite |
| 13 | Ajouter un Error Boundary autour de la Map | `MapPage.tsx` | Architecture |

### Phase 3 - Ameliorations Moyennes (Moyen terme)

| # | Action | Fichier(s) | Impact |
|---|--------|-----------|--------|
| 14 | Remplacer sanitisation regex par DOMPurify | `sanitize.ts:92-109` | Securite |
| 15 | Centraliser les calculs de distance | `useActiveSignal.ts`, `useSignalMatching.ts` | Qualite |
| 16 | Ajouter des regions `aria-live` aux erreurs de formulaire | `OnboardingPage.tsx` | Accessibilite |
| 17 | Augmenter les cibles tactiles du cookie consent | `CookieConsent.tsx:67` | Accessibilite |
| 18 | Ajouter des headers de securite HTTP | Configuration serveur | Securite |
| 19 | Configurer le formatage de dates localise | i18n | UX |
| 20 | Consolider les effets cascades dans useMapPageLogic | `useMapPageLogic.ts:72-110` | Performance |
| 21 | Ajouter timeout + retry sur fetch Mapbox token | `InteractiveMap.tsx:104-143` | Performance |
| 22 | Nettoyer les animations CSS inutilisees | `index.css:415-511` | Performance |
| 23 | Sanitiser les inputs utilisateur dans les prompts IA | `ai-assistant/index.ts:160-161` | Securite |
| 24 | Corriger l'injection HTML dans les emails | `notifications/index.ts:232` | Securite |

### Phase 4 - Ameliorations Basses (Long terme)

| # | Action | Fichier(s) | Impact |
|---|--------|-----------|--------|
| 25 | Activer ESLint `no-unused-vars` en warning | `eslint.config.js:23` | Qualite |
| 26 | Utiliser `z.string().email()` de Zod partout | `sanitize.ts`, `validation.ts` | Qualite |
| 27 | Ajouter `lastmod` au sitemap.xml | `public/sitemap.xml` | SEO |
| 28 | Ajouter `security.txt` | `.well-known/security.txt` | Securite |
| 29 | Documenter les edge functions (API docs) | Nouveau fichier | Documentation |
| 30 | Configurer CI/CD avec tests automatiques | Nouveau fichier | DevOps |
| 31 | Audit formel de contraste couleurs (WCAG AA) | Tailwind config | Accessibilite |
| 32 | Ajouter screenshots et shortcuts au manifest PWA | `manifest.webmanifest` | PWA |

---

*Rapport genere le 14 Fevrier 2026*
*Audit realise sur la base de code version 2.0.0*
