
# Audit Complet Multi-Roles - EASY v1.7.x (Iteration 9)

---

## Resultats de l'audit

### Bugs critiques identifies

#### BUG-1 : `useBinomeSessions.ts` utilise encore `sonner` (CRITIQUE)

**Fichier** : `src/hooks/useBinomeSessions.ts` (ligne 4)

Ce hook est le moteur de toutes les actions Binome (creer, rejoindre, quitter, annuler une session). Il importe `toast` depuis `sonner`, qui n'a plus de Toaster dans `App.tsx`. **Tous les toasts de confirmation Binome sont silencieux** : creation de session, rejoindre, quitter, annuler.

De plus, les textes de toast utilisent une detection de langue manuelle `locale === 'fr'` (lignes 159, 185, 199, 210, 232, 255, 259) au lieu de `useTranslation()`. Probleme : c'est un hook, pas un composant React -- il ne peut pas utiliser `useTranslation()` directement. Il faut passer `t()` en parametre ou externaliser les messages.

#### BUG-2 : `EventScraperCard.tsx` utilise encore `sonner` (manque de la migration Iteration 8)

**Fichier** : `src/components/admin/EventScraperCard.tsx` (ligne 9)

Ce fichier etait dans le plan de l'iteration 8 mais n'a pas ete migre. Import `{ toast } from 'sonner'` toujours present. Toasts silencieux pour les actions de scraping.

#### BUG-3 : `EventReminderBanner.tsx` -- locale `fr` hardcodee + textes hardcodes (HAUTE)

**Fichier** : `src/components/events/EventReminderBanner.tsx`

- Ligne 3 : `import { fr } from 'date-fns/locale'` -- locale hardcodee
- Ligne 29 : `Commence dans ${minutesUntilStart} min !`
- Ligne 32 : `Commence dans ${minutesUntilStart} min`
- Ligne 35 : `Commence dans ${hoursUntilStart}h`
- Ligne 66 : `format(startDate, 'HH:mm', { locale: fr })` -- locale hardcodee
- Ligne 72 : `Bientôt !`
- Ligne 113 : `Rappels`

#### BUG-4 : `EventCategoryBadge.tsx` -- labels de categories hardcodes en francais (HAUTE)

**Fichier** : `src/components/events/EventCategoryBadge.tsx`

Les labels des categories d'evenements sont hardcodes en francais (ligne 18-26) :
- `'Académique'`, `'Soirée'`, `'Pro'`, `'Autre'`, `'Culture'`, `'Sport'`, `'Social'`

Cela affecte :
- Les badges de categorie partout dans l'app
- Le selecteur de categorie dans le formulaire de creation d'evenement

#### BUG-5 : `AdminDashboardPage.tsx` -- entierement hardcode en francais (~50 textes)

**Fichier** : `src/pages/AdminDashboardPage.tsx`

Page admin avec ~50 textes hardcodes. Bien que ce soit admin-only, les toasts de confirmation (lignes 116-127) sont deja en francais et devraient suivre le systeme i18n. Les textes principaux incluent :
- "Accès restreint", "Dashboard Admin", "Système Opérationnel/Attention/Critique"
- "Utilisateurs", "Signaux actifs", "Événements", "Interactions"
- "Utilisateurs actifs (14 jours)", "Répartition par catégorie", "Activité par heure"
- "Top 10 Événements", "Pages les plus visitées", "Aucune donnée disponible"
- "Nettoyage des signaux expirés effectué", "Données rafraîchies"

---

## Plan de Corrections

### Etape 1 : Migrer `useBinomeSessions.ts` de `sonner` vers `react-hot-toast` + i18n

Remplacer `import { toast } from 'sonner'` par `import toast from 'react-hot-toast'`. Pour l'i18n, puisqu'il s'agit d'un hook et non d'un composant, utiliser la detection de langue existante (`document.documentElement.lang`) avec un helper local pour les cles de traduction, ou importer directement les traductions.

Refactoriser les 8 messages toast avec un pattern i18n compatible hooks.

### Etape 2 : Migrer `EventScraperCard.tsx` de `sonner` vers `react-hot-toast`

Remplacer l'import (ligne 9). Adapter les 2 appels toast (lignes 33, 40).

### Etape 3 : i18n -- `EventReminderBanner.tsx` (~8 cles)

Ajouter `eventReminder.*` dans `translations.ts`. Utiliser `useTranslation()` avec locale dynamique pour `date-fns`. Traduire "Commence dans X min", "Bientot !", "Rappels".

### Etape 4 : i18n -- `EventCategoryBadge.tsx` (~7 cles)

Ajouter `eventCategories.*` dans `translations.ts`. Remplacer les labels hardcodes par `t('eventCategories.social')`, etc. Le composant et le selecteur utiliseront `useTranslation()`.

### Etape 5 : i18n partiel -- `AdminDashboardPage.tsx` (toasts + titres principaux, ~25 cles)

Ajouter `admin.*` dans `translations.ts`. Traduire les elements visibles principaux : titres de cartes, labels de stats, messages toast, indicateur de sante systeme.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +45 cles (eventReminder, eventCategories, admin) |
| `src/hooks/useBinomeSessions.ts` | sonner -> react-hot-toast + i18n messages |
| `src/components/admin/EventScraperCard.tsx` | sonner -> react-hot-toast |
| `src/components/events/EventReminderBanner.tsx` | i18n complet + locale dynamique |
| `src/components/events/EventCategoryBadge.tsx` | i18n labels categories |
| `src/pages/AdminDashboardPage.tsx` | i18n titres + toasts + indicateurs |

---

## Estimation

- Migration sonner -> react-hot-toast : 2 fichiers (useBinomeSessions critique, EventScraperCard)
- i18n composants Events (EventReminderBanner, EventCategoryBadge) : 2 fichiers, ~15 cles
- i18n AdminDashboardPage : 1 fichier, ~25 cles
- Total : ~6 fichiers modifies, ~45 nouvelles cles, ~200 lignes modifiees
