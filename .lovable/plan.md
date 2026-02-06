

# Audit Multi-Roles - EASY v1.7.x (Iteration 16)

---

## Problemes identifies

### BUG-27 : `ActivityFilterBar.tsx` -- "Tous" + aria-label hardcodes en francais (HAUTE)

**Fichier** : `src/components/map/ActivityFilterBar.tsx`

- L35 : `Tous` -- texte visible hardcode en francais
- L48 : `aria-label={`Filtrer par ${activity.label}`}` -- aria-label en francais + utilise `activity.label` (francais)

Le composant n'importe pas `useTranslation()`.

### BUG-28 : `SmartLocationRecommender.tsx` L39 -- `activityConfig.label` francais dans le bouton (MOYENNE)

**Fichier** : `src/components/social/SmartLocationRecommender.tsx` L39

```tsx
{t('locationRecommender.suggestButton').replace('{activity}', activityConfig.label)}
```

`activityConfig.label` provient de `ACTIVITY_CONFIG` qui contient des labels francais hardcodes (`'Reviser'`, `'Manger'`). Devrait utiliser le label traduit via `t()`.

### BUG-29 : `SmartLocationRecommender.tsx` L98 -- fallback `'Source'` inutile (BASSE)

**Fichier** : `src/components/social/SmartLocationRecommender.tsx` L98

```tsx
{t('locationRecommender.source') || 'Source'}
```

Le fallback `'Source'` est inutile car la cle existe. Simple nettoyage.

---

## Plan de Corrections

### Etape 1 : Ajouter des cles dans translations.ts

Ajouter :
- `activityFilter.all` : `{ fr: 'Tous', en: 'All' }`
- `activityFilter.filterBy` : `{ fr: 'Filtrer par {activity}', en: 'Filter by {activity}' }`

### Etape 2 : i18n `ActivityFilterBar.tsx`

Importer `useTranslation()`. Remplacer :
- L35 : `Tous` par `{t('activityFilter.all')}`
- L48 : aria-label par `t('activityFilter.filterBy').replace('{activity}', t(activity.labelKey))`

### Etape 3 : Fix `SmartLocationRecommender.tsx`

- L39 : Remplacer `activityConfig.label` par le label traduit via les `ACTIVITIES` et `t(activityLabelKey)`
- L98 : Supprimer le fallback `|| 'Source'`

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +2 cles (`activityFilter.all`, `activityFilter.filterBy`) |
| `src/components/map/ActivityFilterBar.tsx` | import useTranslation + 2 remplacements |
| `src/components/social/SmartLocationRecommender.tsx` | fix activity label traduit + cleanup fallback |

---

## Estimation

- 3 fichiers, 2 nouvelles cles, ~10 lignes modifiees

