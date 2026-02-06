
# Audit Multi-Roles - EASY v1.7.x (Iteration 17)

---

## Problemes identifies

### BUG-30 : `activityData?.label` utilise dans 4 fichiers au lieu de la traduction (HAUTE)

Les fichiers suivants utilisent `activityData?.label` ou `currentActivityData?.label` qui retournent le label francais hardcode des constantes `ACTIVITIES[]`, au lieu d'utiliser `t(activityData?.labelKey)`.

| Fichier | Ligne | Code actuel |
|---------|-------|-------------|
| `src/pages/MapPage.tsx` | L138 | `currentActivityData?.label` |
| `src/components/map/MapHeader.tsx` | L72 | `currentActivityData?.label` |
| `src/pages/ProximityRevealPage.tsx` | L242 | `activityData?.label` |
| `src/components/binome/AIRecommendationsWidget.tsx` | L143 | `activityData?.label` |

Tous ces textes sont visibles par l'utilisateur final sur la carte, le header, la page de revelation et les recommandations IA.

---

## Plan de Corrections

### Etape 1 : Fix `MapPage.tsx` (1 ligne)

Remplacer `currentActivityData?.label` par `t(currentActivityData?.labelKey || 'activities.other')` a la ligne 138.

Le composant importe deja `useTranslation`.

### Etape 2 : Fix `MapHeader.tsx` (1 ligne)

Remplacer `currentActivityData?.label` par `t(currentActivityData?.labelKey || 'activities.other')` a la ligne 72.

Le composant importe deja `useTranslation`.

### Etape 3 : Fix `ProximityRevealPage.tsx` (1 ligne)

Remplacer `activityData?.label` par `t(activityData?.labelKey || 'activities.other')` a la ligne 242.

Verifier que `useTranslation` est deja importe (sinon l'ajouter).

### Etape 4 : Fix `AIRecommendationsWidget.tsx` (1 ligne)

Remplacer `activityData?.label || rec.activity` par `t(activityData?.labelKey || 'activities.other')` a la ligne 143.

Le composant importe deja `useTranslation`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/pages/MapPage.tsx` | 1 remplacement `.label` -> `t(.labelKey)` |
| `src/components/map/MapHeader.tsx` | 1 remplacement `.label` -> `t(.labelKey)` |
| `src/pages/ProximityRevealPage.tsx` | 1 remplacement `.label` -> `t(.labelKey)` + verif import |
| `src/components/binome/AIRecommendationsWidget.tsx` | 1 remplacement `.label` -> `t(.labelKey)` |

---

## Estimation

- 4 fichiers, 0 nouvelles cles, ~4 lignes modifiees
- Correction purement mecanique : remplacer `.label` par `t(.labelKey)`
