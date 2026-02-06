

# Audit Triple - EASY v1.7.x (Iteration 7)
## Phase 1 : Technique | Phase 2 : UX | Phase 3 : Beta-testeur

---

## PHASE 1 : Audit Technique (Dev Senior)

### TECH-13 : Console warning -- LandingFooter missing forwardRef (BASSE)

**Fichier** : `src/components/landing/LandingFooter.tsx`

La console affiche un warning React : "Function components cannot be given refs". `LandingPage.tsx` utilise framer-motion `AnimatePresence` qui tente de passer un ref a `LandingFooter`. Le composant doit etre enveloppe avec `forwardRef` comme `ComparisonSection` et `SignalDemo`.

### TECH-14 : BinomeOnboarding 100% hardcode en francais (HAUTE)

**Fichier** : `src/components/binome/BinomeOnboarding.tsx`

~40 textes hardcodes :
- Steps : "Lutte contre la solitude", "Cree ou rejoins un creneau", "Trouve ton binome", "Rencontre en vrai", "Cree du lien durable" + descriptions
- Features : "Rappels automatiques", "Score de fiabilite", "4 creneaux/mois gratuits"
- Navigation : "Passer", "Retour", "Suivant", "C'est parti !"
- `BinomeDescriptionCard` : "Comment ca marche ?", "Voir le tutoriel complet"
- `WhyEasySection` : "Pourquoi EASY ?", "Plus qu'une app de rencontre"
- `WhyEasyCondensed` : "Pourquoi creer un creneau ?", "Reviser ensemble", "Dejeuner", "Sport", "Discuter"
- `TestimonialsSection` : "Ils ont teste EASY", testimonials complets
- "Bienvenue sur EASY !", "Cree du lien en vrai", "Etape X sur Y", "Fonctionnalites incluses"

### TECH-15 : CommunityStats 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/binome/CommunityStats.tsx`

- "En ligne", "maintenant", "Creneaux", "ce mois", "Rencontres", "reussies", "Communaute en temps reel"

### TECH-16 : AIRecommendationsWidget 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/binome/AIRecommendationsWidget.tsx`

- "Suggestions IA", "Recommandations personnalisees", "Pas de recommandations pour le moment", "Depuis le cache", "Actualiser", "Rafraichir les suggestions", "Generation IA en cours..."

### TECH-17 : SessionQuotaBadge 100% hardcode en francais (MOYENNE)

**Fichier** : `src/components/binome/SessionQuotaBadge.tsx`

- "Illimite", "ce mois", "Passer Premium", "Tu as atteint ta limite mensuelle", "Plus qu'un creneau disponible"

### TECH-18 : IcebreakerCard textes hardcodes (BASSE)

**Fichier** : `src/components/social/IcebreakerCard.tsx`

- "Copie !", "Impossible de copier", "Generation IA en cours...", "Icebreaker suggere/IA", "suggestions", "Copier", "Nouvelle suggestion"

### TECH-19 : VoiceIcebreakerButton textes hardcodes (BASSE)

**Fichier** : `src/components/social/VoiceIcebreakerButton.tsx`

- "Arreter", "Ecouter", "Generation...", "Ecouter l'icebreaker"

### TECH-20 : PeopleMetPage utilise `activityData.label` au lieu de `t()` (BASSE)

**Fichier** : `src/pages/PeopleMetPage.tsx` (ligne 163)

`activityData.label` affiche le label anglais hardcode au lieu d'utiliser `t(activityData.labelKey)`.

---

## PHASE 2 : Audit UX (UX Designer Senior)

### UX-16 : Onboarding Binome bloque pour les anglophones

L'onboarding Binome (5 etapes + features + guide) est entierement en francais. Un utilisateur anglophone ne comprend pas ce qu'est le module Binome ni comment l'utiliser.

### UX-17 : Statistiques de communaute en francais

Le widget "Communaute en temps reel" sur la page Binome affiche "En ligne", "Creneaux", "Rencontres" meme en mode anglais.

### UX-18 : Suggestions IA non traduites

Le widget de recommandations IA affiche "Suggestions IA", "Recommandations personnalisees" en francais meme en mode anglais.

### UX-19 : Icebreaker card UI entierement en francais

Les labels "Copie !", "Icebreaker suggere", "Generation IA en cours..." sont en francais pour un utilisateur anglophone.

### UX-20 : Quota de sessions non traduit

Le badge de quota affiche "Illimite", "ce mois", "Passer Premium" en francais.

---

## PHASE 3 : Audit Beta-testeur (Utilisateur Final)

### BETA-10 : "Le tutoriel Binome est en francais meme si j'ai choisi anglais"

Un utilisateur anglophone ouvre le module Binome pour la premiere fois et voit un tutoriel entierement en francais.

### BETA-11 : "Les stats de communaute sont en francais"

Les labels "En ligne", "Creneaux", "Rencontres" restent en francais.

### BETA-12 : "Les suggestions IA et l'icebreaker sont en francais"

Les widgets d'IA ne suivent pas la langue choisie.

### BETA-13 : "Je vois une activite en anglais au lieu de la traduction"

Sur la page "People Met", le label d'activite utilise la valeur anglaise brute au lieu de la traduction.

---

## Plan de Corrections

### Etape 1 : i18n -- BinomeOnboarding (priorite haute, ~50 cles)

Ajouter les blocs `binomeOnboarding.*`, `binomeDescription.*`, `whyEasy.*`, `testimonials.*` dans `translations.ts`. Refactoriser les 4 sous-composants.

### Etape 2 : i18n -- CommunityStats (~10 cles)

Ajouter le bloc `communityStats.*` dans `translations.ts`. Refactoriser le composant.

### Etape 3 : i18n -- AIRecommendationsWidget (~10 cles)

Ajouter le bloc `aiRecommendations.*` dans `translations.ts`. Refactoriser le composant.

### Etape 4 : i18n -- SessionQuotaBadge (~8 cles)

Ajouter le bloc `sessionQuota.*` dans `translations.ts`. Refactoriser le composant.

### Etape 5 : i18n -- IcebreakerCard + VoiceIcebreakerButton (~12 cles)

Ajouter le bloc `icebreaker.*` dans `translations.ts`. Refactoriser les 2 composants.

### Etape 6 : Fix PeopleMetPage activity label

Remplacer `activityData.label` par `t(activityData.labelKey)` (ligne 163).

### Etape 7 : Fix LandingFooter forwardRef

Envelopper `LandingFooter` avec `forwardRef` pour supprimer le warning console.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +90 cles (binomeOnboarding, communityStats, aiRecommendations, sessionQuota, icebreaker) |
| `src/components/binome/BinomeOnboarding.tsx` | i18n complet (~50 textes) |
| `src/components/binome/CommunityStats.tsx` | i18n complet |
| `src/components/binome/AIRecommendationsWidget.tsx` | i18n complet |
| `src/components/binome/SessionQuotaBadge.tsx` | i18n complet |
| `src/components/social/IcebreakerCard.tsx` | i18n complet |
| `src/components/social/VoiceIcebreakerButton.tsx` | i18n complet |
| `src/pages/PeopleMetPage.tsx` | Fix activity label (1 ligne) |
| `src/components/landing/LandingFooter.tsx` | forwardRef wrapper |

---

## Estimation

- i18n composants Binome (BinomeOnboarding, CommunityStats, AIRecommendations, SessionQuotaBadge) : 4 fichiers, ~80 cles
- i18n composants Social (IcebreakerCard, VoiceIcebreakerButton) : 2 fichiers, ~12 cles
- Bug fixes (PeopleMetPage, LandingFooter) : 2 fichiers, ~5 lignes
- Total : ~9 fichiers modifies, ~90 nouvelles cles, ~400 lignes ajoutees/modifiees

