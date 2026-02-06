

# Audit Multi-Roles - EASY v1.7.x (Iteration 15)

---

## Problemes identifies

### BUG-21 : `SearchingIndicator.tsx` -- 100% hardcode en francais (~4 textes) (CRITIQUE)

**Fichier** : `src/components/radar/SearchingIndicator.tsx`

Composant visible sur la carte quand le signal est actif. **Aucun `useTranslation()`**. Tous les textes sont en francais brut :
- L47 : `"Recherche en cours"`
- L55 : `"Tu seras notifié dès qu'une personne arrive"`
- L61 : `"{nearbyCount} personne{nearbyCount > 1 ? 's' : ''} à proximité"`
- L64 : `"Explore le radar pour les découvrir !"`

### BUG-22 : `MapStyleSelector.tsx` -- Labels francais hardcodes (~4 textes) (HAUTE)

**Fichier** : `src/components/map/MapStyleSelector.tsx`

Les noms des styles de carte (`'Rues'`, `'Satellite'`, `'Navigation'`, `'Plein air'`) sont hardcodes en francais. Le composant a un champ `nameEn` mais ne l'utilise jamais -- il affiche toujours `style.name` (francais).
- L26 : `'Rues'`
- L34 : `'Satellite'`
- L42 : `'Navigation'`
- L50 : `'Plein air'`
- L84, L98 : affiche `style.name` au lieu de la version locale

### BUG-23 : `SmartLocationRecommender.tsx` L98 -- `"Source {i + 1}"` hardcode (BASSE)

**Fichier** : `src/components/social/SmartLocationRecommender.tsx` L98

Le label `Source {i + 1}` n'est pas traduit.

### BUG-24 : `OnboardingPage.tsx` L394 -- Fallback francais hardcode (BASSE)

**Fichier** : `src/pages/OnboardingPage.tsx` L394

```tsx
{t('auth.continueWithApple') || 'Continuer avec Apple'}
```

Le fallback `'Continuer avec Apple'` est en francais. La cle existe dans les traductions, donc le fallback ne devrait jamais s'afficher, mais c'est une mauvaise pratique.

### BUG-25 : `UserPopupCard.tsx` L118 -- Utilise `activity?.label` au lieu de la traduction (MOYENNE)

**Fichier** : `src/components/map/UserPopupCard.tsx` L118

```tsx
<span className="text-foreground font-medium">{activity?.label || t('activities.other')}</span>
```

`activity?.label` retourne toujours le label francais hardcode de `ACTIVITIES[]` (`'Réviser'`, `'Manger'`, etc.). Devrait utiliser `t(activity?.labelKey)`.

### BUG-26 : `SignalHistoryPanel.tsx` L119 -- Meme probleme `activity?.label` (MOYENNE)

**Fichier** : `src/components/map/SignalHistoryPanel.tsx` L70, L119

La fonction `getActivityLabel()` retourne `activity?.label` (francais hardcode) au lieu de la traduction.

---

## Plan de Corrections

### Etape 1 : i18n `SearchingIndicator.tsx` (~4 cles)

Ajouter `searchIndicator.*` dans `translations.ts`. Implementer `useTranslation()`. Gerer le pluriel `personne/personnes` via une interpolation.

### Etape 2 : i18n `MapStyleSelector.tsx`

Importer `useTranslation()`. Utiliser `locale === 'fr' ? style.name : style.nameEn` pour afficher le bon label.

### Etape 3 : Fix `UserPopupCard.tsx` et `SignalHistoryPanel.tsx`

Remplacer `activity?.label` par `t(activity?.labelKey || 'activities.other')` dans les deux composants.

### Etape 4 : Corrections mineures

- `SmartLocationRecommender.tsx` : traduire `"Source"` (1 cle)
- `OnboardingPage.tsx` : supprimer le fallback francais hardcode

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +5 cles (searchIndicator.*, locationRecommender.source) |
| `src/components/radar/SearchingIndicator.tsx` | i18n complet (import + 4 remplacements) |
| `src/components/map/MapStyleSelector.tsx` | i18n labels dynamiques |
| `src/components/map/UserPopupCard.tsx` | fix activity label (1 ligne) |
| `src/components/map/SignalHistoryPanel.tsx` | fix activity label (1 ligne) |
| `src/components/social/SmartLocationRecommender.tsx` | i18n "Source" (1 ligne) |
| `src/pages/OnboardingPage.tsx` | supprimer fallback hardcode (1 ligne) |

---

## Estimation

- 7 fichiers, ~6 nouvelles cles, ~30 lignes modifiees

