# AUDIT COMPLET - MODE RESERVATION (BINOME) - NEARVITY

**Date :** 12 Fevrier 2026
**Version :** 2.0.0
**Auditeur :** Claude Opus 4.6
**Branche :** `claude/audit-reservation-mode-0ucHC`

---

## TABLE DES MATIERES

1. [Resume Executif](#1-resume-executif)
2. [Audit Technique](#2-audit-technique)
   - 2.1 Architecture & Qualite du Code
   - 2.2 Securite
   - 2.3 Performance
   - 2.4 Tests
   - 2.5 Dependances
3. [Audit Non-Technique](#3-audit-non-technique)
   - 3.1 Experience Utilisateur (UX)
   - 3.2 Accessibilite
   - 3.3 Logique Metier
   - 3.4 Internationalisation
4. [Test du Mode Reservation](#4-test-du-mode-reservation)
5. [Matrice des Risques](#5-matrice-des-risques)
6. [Recommandations](#6-recommandations)

---

## 1. RESUME EXECUTIF

Le mode Reservation (Binome) de NEARVITY est une fonctionnalite permettant aux utilisateurs de planifier et rejoindre des sessions d'activites en groupe. L'audit revele une **application fonctionnelle et bien structuree** avec quelques **failles de securite critiques** a corriger en priorite.

### Scores Globaux

| Domaine | Note | Statut |
|---------|------|--------|
| Architecture & Code | 7.5/10 | Bon |
| Securite Backend (SQL/RLS) | 5/10 | Insuffisant |
| Securite Frontend | 7/10 | Acceptable |
| Performance | 6.5/10 | Acceptable |
| Tests | 8/10 | Bon |
| UX/UI | 8/10 | Bon |
| Accessibilite | 5.5/10 | Insuffisant |
| Logique Metier | 7/10 | Acceptable |
| i18n | 8.5/10 | Bon |

### Resultats des Tests
- **500 tests passes** / 0 echecs / 6 ignores
- **0 erreurs TypeScript** (compilation propre)
- **Build production reussi** (24.3s)
- **9 vulnerabilites npm** (4 moderees, 5 hautes)

---

## 2. AUDIT TECHNIQUE

### 2.1 Architecture & Qualite du Code

#### Points Forts

- **Separation des responsabilites** bien respectee : hooks (`useBinomeSessions`, `useSessionQuota`, `useSessionChat`) isoles de la presentation
- **Typage TypeScript** complet : types `ActivityType`, `SessionStatus`, `DurationOption`, `ScheduledSession`, `CreateSessionInput`, `SessionFilters` bien definis (`src/hooks/useBinomeSessions.ts:7-50`)
- **Validation Zod** dans `CreateSessionForm.tsx:21-29` avec schema strict pour les entrees utilisateur
- **Pattern hooks + composants** coherent dans tout le module binome (17 composants)
- **RPC Supabase** pour les operations critiques (join/leave) plutot que des requetes directes
- **Real-time** via Supabase channels pour le chat de session (`useSessionChat.ts:85-117`)

#### Points Faibles

**PF-01 : Typage `any` dans plusieurs fichiers**
```
src/hooks/useBinomeSessions.ts:58   - let obj: any = translations;
src/pages/SessionDetailPage.tsx:107 - (profilesData || []).forEach((p: any) => ...)
src/hooks/useSessionChat.ts:42      - (profiles || []).forEach((p: any) => ...)
```
**Impact :** Perte de la securite de type, risque de bugs runtime.

**PF-02 : Cast `as` non securise**
```typescript
// useBinomeSessions.ts:164
setMySessions(data as ScheduledSession[]);
// useBinomeSessions.ts:192
setMyParticipations(sessionsData as ScheduledSession[]);
```
**Impact :** Les donnees de Supabase ne sont pas validees avant le cast. Si le schema DB diverge, les donnees seront corrompues silencieusement.

**PF-03 : Duplication du pattern de traduction**
- `useBinomeSessions.ts:55-63` reimplemente sa propre fonction `t()` au lieu d'utiliser `useTranslation()`
- **Impact :** Inconsistance, maintenance plus difficile.

**PF-04 : fetchSessions declenche sur mount avec filtre vide**
```typescript
// useBinomeSessions.ts:316-318
useEffect(() => {
    if (user) {
      fetchMySessions();
      fetchMyParticipations();
      fetchSessions({ city: '' }); // <-- Charge TOUTES les sessions
    }
}, [user, fetchMySessions, fetchMyParticipations, fetchSessions]);
```
**Impact :** Requete inutile au mount qui charge toutes les sessions ouvertes sans filtre ville (jusqu'a 40 resultats).

---

### 2.2 Securite

#### CRITIQUE

**SEC-01 : `add_purchased_sessions()` sans verification d'authentification**
- **Fichier :** Migration `20260130121817_caf21092`
- **Probleme :** La fonction RPC `add_purchased_sessions(p_user_id, p_count)` n'a AUCUNE verification d'identite. N'importe quel utilisateur authentifie peut s'ajouter des sessions payantes gratuitement.
- **Exploitation :** `supabase.rpc('add_purchased_sessions', { p_user_id: 'mon-id', p_count: 999 })`
- **Severite :** CRITIQUE
- **Correction :** Restreindre la fonction aux roles admin ou au backend uniquement.

**SEC-02 : Race condition dans `join_session()`**
- **Fichier :** Migration `20260129164810_6cb771c8`
- **Probleme :** Entre le `SELECT COUNT(*)` et le `INSERT`, un autre utilisateur peut rejoindre la session, causant un depassement de `max_participants`.
- **Severite :** HAUTE
- **Correction :** Utiliser `SELECT ... FOR UPDATE` ou une contrainte CHECK dans la table.

**SEC-03 : `leave_session()` bug NULL dans le calcul des heures**
- **Fichier :** Migration `20260129164810_6cb771c8`
- **Probleme :** Si `v_session_date` ou `v_session_time` est NULL, `v_hours_until_session` sera NULL et la penalite de late cancellation ne s'appliquera jamais.
- **Severite :** HAUTE
- **Correction :** Ajouter `COALESCE` ou un `IF v_session_date IS NULL THEN RETURN FALSE`.

**SEC-04 : Le createur peut rejoindre sa propre session**
- **Fichier :** `join_session()` RPC
- **Probleme :** Aucune verification `s.creator_id != auth.uid()` dans la fonction.
- **Severite :** MOYENNE
- **Correction :** Ajouter `IF v_creator_id = auth.uid() THEN RAISE EXCEPTION 'Cannot join own session'`.

#### HAUTE

**SEC-05 : Feedback `to_user_id` non valide**
- **Fichier :** RLS policy `session_feedback` INSERT
- **Probleme :** La policy verifie que `from_user_id = auth.uid()` et que l'auteur est participant, mais ne verifie PAS que `to_user_id` est aussi un participant de la session.
- **Impact :** Un utilisateur peut envoyer du feedback a n'importe qui, modifiant leur score de fiabilite.
- **Correction :** Ajouter `AND EXISTS (SELECT 1 FROM session_participants WHERE session_id = ... AND user_id = to_user_id)`.

**SEC-06 : `update_reliability_from_feedback()` sans rate-limit**
- **Fichier :** Migration `20260129165757_da0a6e0a`
- **Probleme :** N'importe quel utilisateur peut appeler cette RPC de facon repetee pour manipuler le score de fiabilite d'un autre utilisateur.
- **Correction :** Ajouter un check dans la fonction pour verifier qu'un feedback existe.

**SEC-07 : `get_profile_for_display()` expose les profils a tous**
- **Fichier :** Migration `20260130121127_e8ad88b0`
- **Probleme :** Fonction SECURITY DEFINER appelable par tout utilisateur authentifie pour enumerer les profils.
- **Correction :** Limiter l'acces au contexte de session (participants uniquement).

**SEC-08 : Pas de sanitization XSS sur les messages du chat**
- **Fichier :** `useSessionChat.ts:63-69`
- **Probleme :** Le contenu du message est envoye directement a Supabase avec un simple `content.trim()`. Aucun appel a `sanitizeText()` ou `sanitizeDbText()`.
- **Impact :** XSS stocke potentiel si React ne sanitize pas le rendu.
- **Mitigation :** React echappe par defaut le JSX, mais le contenu n'est pas sanitize cote serveur.

**SEC-09 : Pas de limite de longueur sur `session_messages.content`**
- **Fichier :** Migration `20260129165757_da0a6e0a`
- **Probleme :** La colonne `content TEXT NOT NULL` n'a aucune contrainte de longueur. Un utilisateur pourrait inserer des megaoctets de texte.
- **Correction :** Ajouter `CHECK (length(content) <= 1000)` en SQL.

#### MOYENNE

**SEC-10 : Vulnerabilites npm (9 totales)**
- `react-router` XSS via Open Redirects (HAUTE)
- `esbuild` dev server request forgery (MODEREE)
- `glob` command injection (HAUTE)
- `lodash` prototype pollution (MODEREE)
- `js-yaml` prototype pollution (MODEREE)
- **Correction :** `npm audit fix` + mise a jour de `react-router-dom` vers v7.

**SEC-11 : Onboarding state dans localStorage sans protection**
- **Fichier :** `BinomeOnboarding.tsx:22`
- **Probleme :** `localStorage.getItem('binome_onboarding_completed')` peut etre manipule.
- **Impact :** Mineur - l'onboarding peut etre skip ou force.

---

### 2.3 Performance

**PERF-01 : Bundle trop volumineux**
```
dist/assets/index-DQ8lofTb.js    2,150.54 KB (gzip: 622.85 KB)
dist/assets/mapbox-gl-B0B1lu36.js 1,680.03 KB (gzip: 463.55 KB)
```
- **Probleme :** Le bundle principal depasse 2 MB. Mapbox GL represente 1.68 MB a lui seul.
- **Impact :** Temps de chargement initial eleve, surtout sur mobile.
- **Correction :** Code-splitting avec `React.lazy()` pour les pages, import dynamique de Mapbox GL.

**PERF-02 : N+1 queries dans `SessionDetailPage.tsx:101-104`**
```typescript
...participantUserIds.map(uid =>
  supabase.rpc('get_user_reliability_public', { p_user_id: uid })
)
```
- **Probleme :** Un appel RPC par participant pour les scores de fiabilite.
- **Impact :** Si une session a 10 participants, 10 requetes sont envoyees.
- **Correction :** Creer une RPC `get_user_reliability_batch` qui accepte un tableau d'IDs.

**PERF-03 : Pas de pagination dans `fetchSessions()`**
- **Fichier :** `useBinomeSessions.ts:101`
- **Probleme :** Limite fixe de 40 resultats, pas de pagination cursor-based.
- **Impact :** Avec la croissance des utilisateurs, les resultats seront tronques sans indication.

**PERF-04 : Re-fetch complet apres join/leave/cancel**
- **Fichier :** `useBinomeSessions.ts:256-258`
- **Probleme :** Apres chaque action (join, leave, cancel), la liste complete est re-fetched.
- **Correction :** Mise a jour optimiste du state local.

**PERF-05 : Real-time channel profile fetch a chaque message**
- **Fichier :** `useSessionChat.ts:97-98`
- **Probleme :** Pour chaque nouveau message en temps reel, une requete RPC `get_public_profiles` est effectuee.
- **Correction :** Cache local des profils deja charges.

---

### 2.4 Tests

#### Couverture Actuelle (Bonne)

| Categorie | Fichiers Tests | Tests |
|-----------|---------------|-------|
| Tests unitaires | 8 | ~200 |
| Tests integration | 4 | ~100 |
| Tests E2E | 4 | ~150 |
| Tests securite | 3 | ~50 |
| Total | **24 fichiers** | **500 tests** |

#### Tests Manquants pour le Mode Reservation

**TEST-01 : Pas de tests specifiques pour `useBinomeSessions`**
- Le hook est exporte et verifie (`hooks.test.ts:159`), mais aucun test des fonctions `createSession`, `joinSession`, `leaveSession`, `cancelSession`.

**TEST-02 : Pas de tests pour `CreateSessionForm` validation**
- Le schema Zod est defini (`CreateSessionForm.tsx:21-29`) mais non teste.

**TEST-03 : Pas de tests pour `SessionCheckin` logique**
- La logique de distance (`isCloseEnough()`) et de fenetre temporelle (`isWithinCheckinWindow()`) n'est pas testee.

**TEST-04 : Pas de tests pour `SessionFeedbackForm`**
- Le flux multi-participant (navigation precedent/suivant) n'est pas teste.

**TEST-05 : Pas de tests pour les fonctions SQL RPC**
- `join_session`, `leave_session`, `get_available_sessions` ne sont pas testes au niveau integration.

---

### 2.5 Dependances

#### Vulnerabilites Actives

| Package | Severite | CVE | Impact |
|---------|----------|-----|--------|
| `react-router` 6.x | HAUTE | GHSA-2w69 | XSS via Open Redirects |
| `@isaacs/brace-expansion` | HAUTE | GHSA-7h2j | DoS par regex |
| `glob` 10.x | HAUTE | GHSA-5j98 | Command injection |
| `esbuild` | MODEREE | GHSA-67mh | Dev server SSRF |
| `lodash` 4.x | MODEREE | GHSA-xxjr | Prototype pollution |
| `js-yaml` 4.x | MODEREE | GHSA-mh29 | Prototype pollution |

#### Recommandation
- Migrer `react-router-dom` vers v7 (corrige la vuln XSS)
- Executer `npm audit fix` pour les corrections automatiques

---

## 3. AUDIT NON-TECHNIQUE

### 3.1 Experience Utilisateur (UX)

#### Points Forts

- **Onboarding guide** en 5 etapes avec animation confetti (`BinomeOnboarding.tsx`)
- **Recherche par ville** avec filtres avances (activite, date, duree)
- **3 onglets** clairs : Explorer, Mes Creneaux, Rejoint
- **Session card** riche : avatar, nom, fiabilite, activite, date/heure, localisation, participants
- **Export calendrier** (ICS) directement depuis la carte de session
- **Chat temps reel** integre dans la page de detail de session
- **Check-in/Check-out** avec verification GPS

#### Points Faibles

**UX-01 : Recherche obligatoire par ville**
- **Probleme :** Sans entrer un nom de ville, l'onglet "Explorer" affiche un message vide ("Recherchez une ville pour decouvrir les creneaux").
- **Impact :** Les sessions globales chargees au mount (`fetchSessions({ city: '' })`) ne sont pas affichees dans le tab Explorer.
- **Correction :** Afficher les sessions globales par defaut, ou proposer une detection automatique de la ville via GPS.

**UX-02 : Max participants limite a 5 dans l'UI mais 10 en DB**
- **Fichier :** `CreateSessionForm.tsx:174` affiche boutons [1, 2, 3, 4, 5]
- **Fichier :** Schema Zod `max_participants: z.number().min(1).max(10)` et DB `CHECK (max_participants >= 1 AND max_participants <= 10)`
- **Impact :** L'utilisateur ne peut pas creer de sessions a 6-10 participants via l'UI, bien que la DB le permette.
- **Correction :** Aligner l'UI avec la DB (ajouter un slider ou plus d'options).

**UX-03 : Pas de confirmation avant de quitter une session**
- **Fichier :** `SessionDetailPage.tsx:147-155`
- **Impact :** Un clic accidentel sur "Quitter" fait quitter la session immediatement, avec penalite potentielle de fiabilite si < 2h avant le debut.
- **Correction :** Ajouter un dialog de confirmation, surtout si < 2h.

**UX-04 : Pas de notification visuelle du statut de la session**
- **Probleme :** Les sessions "cancelled" et "completed" sont affichees dans "Mes Creneaux" sans distinction visuelle forte.
- **Correction :** Utiliser des couleurs distinctes (rouge/gris) et un filtre pour masquer les sessions passees.

**UX-05 : Chat limite sans indication de limite**
- **Probleme :** La limite de 10 messages n'est pas communiquee a l'utilisateur.
- **Impact :** L'utilisateur peut etre surpris de ne plus pouvoir envoyer de messages.

**UX-06 : Le formulaire de feedback s'affiche meme si l'utilisateur n'a pas fait de check-in**
- **Fichier :** `SessionDetailPage.tsx:306`
- **Impact :** Un utilisateur peut noter les autres sans avoir participe.

---

### 3.2 Accessibilite

**A11Y-01 : Bouton retour sans label semantique**
- **Fichier :** `SessionDetailPage.tsx:187`
- `aria-label={t('back')}` est present, mais la navigation est un `<button>` sans role explicite.

**A11Y-02 : Contraste des badges d'activite**
- **Fichier :** `SessionCard.tsx:30-34`
- Les couleurs comme `text-blue-400`, `text-purple-400` sur fond transparent peuvent ne pas respecter le ratio WCAG 4.5:1.

**A11Y-03 : Formulaire de creation - pas de messages d'erreur accessibles**
- Le `FormMessage` de shadcn est utilise, mais le lien `aria-describedby` entre le champ et l'erreur depend de l'implementation shadcn.

**A11Y-04 : Chat scroll automatique sans option de pause**
- **Fichier :** `SessionChat.tsx:19-21`
- Le scroll automatique vers le bas peut etre desorientant pour les utilisateurs de lecteurs d'ecran.

**A11Y-05 : Navigation clavier incomplite dans les onglets**
- Les `Tabs` shadcn supportent les fleches, mais le focus trap dans le `Sheet` de creation pourrait poser probleme.

---

### 3.3 Logique Metier

#### Flux de Reservation

```
Creation -> Ouvert -> Rejoint par participants -> Complet OU Annule
                  |                                    |
                  +-> Check-in -> Check-out -> Feedback -> Testimonial
```

**BIZ-01 : Incoherence du quota gratuit**
- `can_create_session()` dans migration 5 : limite = **4** sessions/mois
- `get_current_month_usage()` dans migration 8 : limite = **2** sessions/mois
- `useSessionQuota.ts:37` : `const freeLimit = 2;`
- **Impact :** Le backend a 2 limites differentes. La plus recente (migration 8) prevaut, mais `can_create_session()` n'a pas ete mise a jour.

**BIZ-02 : Score de fiabilite trop volatile**
- **Probleme :** Le score est recalcule a 100% a partir du ratio feedback positif/total.
- **Impact :** Un seul feedback negatif peut faire chuter le score de 100% a 0% pour un nouvel utilisateur.
- **Correction :** Ponderer avec un minimum de feedbacks (ex: bayesian average).

**BIZ-03 : Pas de gestion des no-shows**
- **Probleme :** Si un participant ne fait pas de check-in, il n'y a aucun mecanisme automatique pour incrementer `no_shows` dans `user_reliability`.
- **Impact :** La fiabilite n'est pas penalisee pour les absences.
- **Correction :** Ajouter un cron job qui detecte les sessions passees sans check-in.

**BIZ-04 : Sessions passees jamais marquees "completed"**
- **Probleme :** Le statut `status = 'completed'` n'est jamais mis a jour automatiquement.
- **Impact :** Le feedback et les testimonials dependent de `session.status === 'completed'` (SessionDetailPage.tsx:117).
- **Correction :** Ajouter un trigger ou cron job pour passer les sessions passees en `completed`.

**BIZ-05 : Le createur ne peut pas participer au chat**
- **Fichier :** RLS `session_messages` INSERT
- **Probleme :** En realite, le createur PEUT envoyer des messages (la policy le permet via `EXISTS ... ss.creator_id`), mais il n'est pas list comme participant et ne recoit pas les notifications push.

**BIZ-06 : Annulation sans notification aux participants**
- **Probleme :** Quand un createur annule (`cancelSession`), le statut passe a `cancelled` mais les participants ne sont pas notifies.
- **Impact :** Les participants peuvent se deplacer pour une session annulee.

---

### 3.4 Internationalisation

#### Points Forts
- Support complet FR/EN via `useTranslation()`
- Dates formatees avec `date-fns/locale` (fr/enUS)
- Toutes les chaines UI traduites

#### Points Faibles

**I18N-01 : Messages d'erreur en dur**
- `useBinomeSessions.ts:143` : `'Loading error'` (anglais seulement)
- `useBinomeSessions.ts:234` : `'Creation error'` (anglais seulement)
- `useBinomeSessions.ts:260` : `'Error'` (anglais seulement)

**I18N-02 : Schema Zod messages non traduits**
- `CreateSessionForm.tsx:22` : `"required"`, `"future"`, `"invalid"` en anglais

---

## 4. TEST DU MODE RESERVATION

### 4.1 Resultats des Tests Automatises

```
 Test Files  : 24 passed (24)
 Tests       : 500 passed | 6 skipped (506)
 Duration    : 13.92s
 TypeScript  : 0 errors
 Build       : Success (24.3s)
```

### 4.2 Analyse des Flux Critiques

#### Flux 1 : Creation de Session
| Etape | Statut | Commentaire |
|-------|--------|-------------|
| Validation du formulaire (Zod) | OK | Schema strict avec date future, duree [45,90,180], activite enum |
| Verification quota | OK | `useSessionQuota` verifie avant l'ouverture du sheet |
| Insertion en DB | OK | Via Supabase `.insert()` avec `creator_id = user.id` |
| Increment usage mensuel | OK | Trigger `on_session_created` automatique |
| Increment fiabilite | OK | RPC `increment_reliability_sessions_created` |
| Feedback utilisateur | OK | Toast de confirmation |

#### Flux 2 : Rejoindre une Session
| Etape | Statut | Commentaire |
|-------|--------|-------------|
| Verification session ouverte | OK | Check `status = 'open'` dans RPC |
| Verification places | PARTIEL | Count sans `FOR UPDATE` (race condition) |
| Insertion participant | OK | Avec contrainte UNIQUE |
| Mise a jour statut "full" | OK | Si count >= max_participants |
| Mise a jour fiabilite | OK | Increment `sessions_joined` |

#### Flux 3 : Check-in/Check-out
| Etape | Statut | Commentaire |
|-------|--------|-------------|
| Verification fenetre temporelle | OK | 15min avant, 1h apres |
| Verification distance GPS | OK | 200m max |
| Update `checked_in` | OK | Via Supabase update direct |
| Update `checked_out` | OK | Via Supabase update direct |
| Declenchement feedback | PARTIEL | Depend du statut `completed` jamais mis automatiquement |

#### Flux 4 : Chat de Session
| Etape | Statut | Commentaire |
|-------|--------|-------------|
| Chargement messages | OK | Batch profile fetch |
| Envoi message | OK | Insert avec verification |
| Real-time | OK | Supabase channel subscription |
| Notifications | OK | Push notification pour nouveaux messages |
| Securite | PARTIEL | Pas de sanitization cote envoi |

#### Flux 5 : Feedback
| Etape | Statut | Commentaire |
|-------|--------|-------------|
| Navigation multi-participants | OK | Previous/Next avec dots |
| Criteres (ponctuel, agreable, recommande) | OK | 3 toggles booleens |
| Commentaire optionnel | OK | Max 200 chars |
| Immutabilite | OK | RLS bloque UPDATE et DELETE |
| Mise a jour fiabilite | PARTIEL | `to_user_id` non valide |

---

## 5. MATRICE DES RISQUES

### Severite : CRITIQUE (Action Immediate)

| ID | Probleme | Fichier | Impact |
|----|----------|---------|--------|
| SEC-01 | `add_purchased_sessions()` sans auth | Migration SQL | Exploitation directe: sessions gratuites illimitees |
| SEC-02 | Race condition `join_session()` | Migration SQL | Depassement de capacite des sessions |

### Severite : HAUTE (Correction Rapide)

| ID | Probleme | Fichier | Impact |
|----|----------|---------|--------|
| SEC-03 | NULL bug `leave_session()` | Migration SQL | Penalites non appliquees |
| SEC-05 | Feedback `to_user_id` non valide | RLS Policy | Manipulation des scores |
| SEC-06 | `update_reliability_from_feedback()` abus | Migration SQL | Manipulation des scores |
| BIZ-04 | Sessions jamais marquees completed | Backend | Feedback/testimonials bloques |
| BIZ-03 | No-shows non detectes | Backend | Fiabilite non representative |
| PERF-01 | Bundle > 3.8 MB | Build | Temps chargement mobile |

### Severite : MOYENNE (Planification)

| ID | Probleme | Fichier | Impact |
|----|----------|---------|--------|
| SEC-04 | Createur peut rejoindre sa session | RPC | Incoherence logique |
| SEC-07 | Profils exposes a tous | RPC | Enumeration utilisateurs |
| SEC-08 | Chat sans sanitization | useSessionChat | XSS potentiel |
| SEC-09 | Messages sans limite de taille | DB Schema | DoS stockage |
| SEC-10 | 9 vulnerabilites npm | Dependances | Exploitation indirecte |
| UX-02 | Max participants UI vs DB | CreateSessionForm | Limitation fonctionnelle |
| UX-03 | Pas de confirmation quitter | SessionDetailPage | Perte accidentelle |
| BIZ-01 | Quota incoherent (2 vs 4) | SQL Fonctions | Confusion fonctionnelle |
| BIZ-02 | Score fiabilite volatile | SQL | Score non representatif |

### Severite : BASSE (Amelioration)

| ID | Probleme | Fichier | Impact |
|----|----------|---------|--------|
| PF-01 | Typage `any` | Hooks | Maintenabilite |
| PF-03 | Duplication traduction | useBinomeSessions | Inconsistance |
| PERF-02 | N+1 queries reliability | SessionDetailPage | Performance |
| PERF-05 | Profile fetch par message | useSessionChat | Performance |
| TEST-01-05 | Tests specifiques manquants | Tests | Couverture |
| A11Y-02 | Contraste badges | SessionCard | Accessibilite |
| I18N-01 | Messages erreur en dur | Hooks | i18n |
| BIZ-06 | Annulation sans notification | cancelSession | UX |

---

## 6. RECOMMANDATIONS

### Priorite 1 - Corrections Critiques (Immediate)

1. **Securiser `add_purchased_sessions()`** : Ajouter `IF auth.uid() IS NULL OR NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Unauthorized'`
2. **Corriger race condition `join_session()`** : Ajouter `SELECT ... FOR UPDATE` sur `scheduled_sessions` avant le count
3. **Ajouter un cron job** pour marquer les sessions passees comme `completed`
4. **Valider `to_user_id`** dans la policy de feedback INSERT

### Priorite 2 - Corrections Hautes (1 semaine)

5. Corriger le bug NULL dans `leave_session()`
6. Ajouter un cron job de detection des no-shows
7. Implementer le code-splitting pour reduire le bundle
8. Executer `npm audit fix` et mettre a jour react-router vers v7
9. Ajouter un rate-limit sur `update_reliability_from_feedback()`

### Priorite 3 - Ameliorations (2-4 semaines)

10. Ajouter des tests specifiques au mode reservation (schema, hooks, composants)
11. Implementer la mise a jour optimiste (join/leave/cancel)
12. Batch query pour les scores de fiabilite
13. Ajouter un dialog de confirmation pour "quitter session"
14. Aligner l'UI max_participants avec la DB (1-10)
15. Ajouter la detection auto de ville via GPS
16. Cacher les profils locaux des messages dans le chat
17. Aligner le quota `can_create_session()` avec `get_current_month_usage()` (2 sessions)
18. Implementer le Bayesian average pour le score de fiabilite

### Priorite 4 - Nice-to-have

19. Ameliorer l'accessibilite (contraste, ARIA)
20. Traduire les messages d'erreur Zod
21. Supprimer les usages de `any`
22. Ajouter une notification lors de l'annulation d'une session
23. Ajouter un audit log pour les actions critiques

---

## CONCLUSION

Le mode Reservation de NEARVITY est **fonctionnellement complet et bien concu** au niveau UI/UX. L'architecture React + Supabase est solide avec une bonne separation des responsabilites. Cependant, **5 failles de securite critiques/hautes** doivent etre corrigees en priorite, notamment la fonction `add_purchased_sessions()` non protegee et la race condition dans `join_session()`. La logique metier presente des lacunes dans la gestion automatique du cycle de vie des sessions (completion, no-shows, notifications d'annulation). Le score global du mode reservation est **6.8/10**, avec un potentiel d'atteindre **8.5/10** apres les corrections des priorites 1 et 2.
