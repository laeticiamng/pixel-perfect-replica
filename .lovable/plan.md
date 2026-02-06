

# Audit Triple - EASY v1.7.x (Iteration 8)
## Phase 1 : Technique | Phase 2 : UX | Phase 3 : Beta-testeur

---

## PHASE 1 : Audit Technique (Dev Senior)

### TECH-21 : 6 fichiers utilisent encore `sonner` au lieu de `react-hot-toast` (HAUTE)

L'iteration 5 avait pour objectif d'unifier les toasts sur `react-hot-toast` et de supprimer `sonner`. Pourtant, 6 fichiers importent encore `{ toast } from 'sonner'` :

| Fichier | Lignes |
|---------|--------|
| `src/components/admin/AlertPreferencesCard.tsx` | L10, L74, L76 |
| `src/components/admin/EventScraperCard.tsx` | L9, L33, L40 |
| `src/components/admin/CronJobsMonitor.tsx` | L7, L136, L149, L154, L168, L181, L186, L200, L213, L218 |
| `src/components/binome/SessionFeedbackForm.tsx` | L12, L60, L64 |
| `src/components/binome/SessionChat.tsx` | L7, L25 |
| `src/pages/SessionDetailPage.tsx` | L24, L129, L142, L144, L150, L154 |

Ces imports provoquent potentiellement des toasts qui s'affichent via `sonner` alors que le `Sonner` Toaster a ete supprime d'`App.tsx` lors de l'iteration 5. Resultat : **les toasts de ces composants sont silencieux** (aucune notification visible a l'utilisateur).

### TECH-22 : SessionFilters 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/binome/SessionFilters.tsx`

~12 textes hardcodes :
- L31-38 : `activityOptions` labels en francais (`'Réviser'`, `'Bosser'`, `'Manger'`...)
- L76 : `placeholder="Rechercher une ville..."`
- L88 : `'Recherche...'` / `'Chercher'`
- L101 : `'Filtres'`
- L117 : `'Effacer'`
- L138-140 : `'Date'`
- L169 : `placeholder="Activité"`
- L172 : `'Toutes'`
- L191 : `placeholder="Durée"`
- L194 : `'Toutes'`
- L88-95 : `'semaines'` / `'mois'`

### TECH-23 : ChatInput, ChatEmptyState, ChatMessageBubble hardcodes en francais (MOYENNE)

**Fichier** : `src/components/binome/ChatInput.tsx`
- L38 : `placeholder="Écris un message..."`
- L47 : `aria-label="Envoyer le message"`

**Fichier** : `src/components/binome/ChatEmptyState.tsx`
- L5 : `"Aucun message pour l'instant"`
- L6 : `"Sois le premier à écrire !"`

**Fichier** : `src/components/binome/ChatMessageBubble.tsx`
- L4 : `import { fr } from 'date-fns/locale'` -- locale hardcoded a `fr`
- L51-54 : `formatDistanceToNow` avec `locale: fr` hardcode

### TECH-24 : SessionChat toast hardcode en francais (BASSE)

**Fichier** : `src/components/binome/SessionChat.tsx`
- L25 : `toast.error('Erreur lors de l\'envoi du message')` -- utilise `sonner` ET texte hardcode

### TECH-25 : ProfileQRCode n'utilise pas le systeme i18n (MOYENNE)

**Fichier** : `src/components/profile/ProfileQRCode.tsx`

Le composant detecte la langue via `localStorage.getItem('language')` (L35) au lieu d'utiliser `useTranslation()`. De plus, il utilise des ternaires `isFr ?` au lieu de `t()` (~10 textes).

### TECH-26 : RecurrenceSelector n'utilise pas le systeme i18n (BASSE)

**Fichier** : `src/components/events/RecurrenceSelector.tsx`

Meme probleme : detecte la langue via `localStorage` (L29) et utilise des ternaires `isFr ?` (~8 textes).

### TECH-27 : Admin components entierement hardcodes (BASSE - admin only)

**Fichiers** : `AlertPreferencesCard.tsx`, `EventScraperCard.tsx`, `CronJobsMonitor.tsx`, `AlertHistoryCard.tsx`

~80 textes hardcodes en francais. Priorite basse car pages admin uniquement. Mais les toasts sont muets car `sonner` n'a plus de Toaster.

---

## PHASE 2 : Audit UX (UX Designer Senior)

### UX-21 : Toasts muets dans le module Binome

Apres suppression du Toaster `sonner` dans `App.tsx` (iteration 5), les actions suivantes ne produisent plus de feedback visuel :
- Rejoindre/quitter une session (SessionDetailPage)
- Envoyer un feedback de session (SessionFeedbackForm)
- Envoyer un message dans le chat de session (SessionChat)
- Actions admin (AlertPreferences, CronJobs, EventScraper)

L'utilisateur clique mais ne recoit aucune confirmation.

### UX-22 : Filtres de session Binome non traduits

Les filtres de recherche de sessions (activite, ville, duree) affichent des labels en francais meme en mode anglais : "Réviser", "Rechercher une ville...", "Filtres", "Effacer".

### UX-23 : Chat de session entierement en francais

Le chat des sessions Binome affiche "Écris un message...", "Aucun message pour l'instant", et les timestamps en francais meme en mode anglais.

### UX-24 : QR Code de profil hors systeme i18n

Le dialogue QR Code utilise `localStorage` au lieu du systeme de traduction, ce qui peut creer des incoherences si la preference est stockee differemment.

---

## PHASE 3 : Audit Beta-testeur (Utilisateur Final)

### BETA-14 : "Je rejoins une session mais rien ne se passe visuellement"

Un utilisateur clique "Rejoindre" sur une session Binome. L'action fonctionne en base mais aucun toast ne confirme l'action (sonner supprime, pas de fallback react-hot-toast).

### BETA-15 : "Les filtres de session sont en francais meme si j'ai choisi anglais"

Les labels "Réviser", "Bosser", "Rechercher une ville..." restent en francais.

### BETA-16 : "Le chat de session est en francais"

Le placeholder "Écris un message..." et les timestamps restent en francais.

### BETA-17 : "Le QR Code de profil ne change pas de langue quand je switch"

Le QR Code utilise `localStorage` au lieu du systeme reactif, donc le switch de langue ne met pas a jour immediatement les textes.

---

## Plan de Corrections

### Etape 1 : Migrer les 6 fichiers de `sonner` vers `react-hot-toast` (CRITIQUE)

Remplacer `import { toast } from 'sonner'` par `import toast from 'react-hot-toast'` dans les 6 fichiers. Adapter la syntaxe si necessaire (`toast.success()` est compatible).

### Etape 2 : i18n -- SessionFilters (~12 cles)

Ajouter le bloc `sessionFilters.*` dans `translations.ts`. Refactoriser pour utiliser `t()` et les cles d'activites existantes.

### Etape 3 : i18n -- ChatInput + ChatEmptyState + ChatMessageBubble (~6 cles)

Ajouter les cles `sessionChat.*`. Passer le locale dynamiquement pour `date-fns` dans `ChatMessageBubble`.

### Etape 4 : i18n -- SessionChat toast

Remplacer le texte hardcode par `t()`.

### Etape 5 : Refactoriser ProfileQRCode vers useTranslation (~10 cles)

Remplacer `localStorage.getItem('language')` par `useTranslation()`. Ajouter le bloc `profileQR.*` dans `translations.ts`.

### Etape 6 : Refactoriser RecurrenceSelector vers useTranslation (~8 cles)

Remplacer `localStorage` par `useTranslation()`. Ajouter le bloc `recurrence.*`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +40 cles (sessionFilters, sessionChat, profileQR, recurrence) |
| `src/components/admin/AlertPreferencesCard.tsx` | sonner -> react-hot-toast |
| `src/components/admin/EventScraperCard.tsx` | sonner -> react-hot-toast |
| `src/components/admin/CronJobsMonitor.tsx` | sonner -> react-hot-toast |
| `src/components/binome/SessionFeedbackForm.tsx` | sonner -> react-hot-toast |
| `src/components/binome/SessionChat.tsx` | sonner -> react-hot-toast + i18n toast |
| `src/pages/SessionDetailPage.tsx` | sonner -> react-hot-toast |
| `src/components/binome/SessionFilters.tsx` | i18n complet |
| `src/components/binome/ChatInput.tsx` | i18n |
| `src/components/binome/ChatEmptyState.tsx` | i18n |
| `src/components/binome/ChatMessageBubble.tsx` | i18n + locale dynamique |
| `src/components/profile/ProfileQRCode.tsx` | Refactoring useTranslation |
| `src/components/events/RecurrenceSelector.tsx` | Refactoring useTranslation |

---

## Estimation

- Migration sonner -> react-hot-toast : 6 fichiers, ~15 lignes par fichier
- i18n composants Binome (SessionFilters, Chat*) : 4 fichiers, ~20 cles
- Refactoring ProfileQRCode + RecurrenceSelector : 2 fichiers, ~20 cles
- Total : ~13 fichiers modifies, ~40 nouvelles cles, ~250 lignes ajoutees/modifiees

