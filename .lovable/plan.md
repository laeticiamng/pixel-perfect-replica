

# Audit Multi-Roles - EASY v1.7.x (Iteration 19)

---

## Problemes identifies

### BUG-35 : Fallback d'erreur hardcodes en francais dans 6 hooks (MOYENNE)

Les hooks suivants utilisent des messages d'erreur en francais comme fallback dans les blocs catch. Ces messages sont affiches aux utilisateurs via `toast.error()` ou `setError()` et ne respectent pas le systeme i18n.

| Fichier | Ligne | Texte hardcode |
|---------|-------|----------------|
| `src/hooks/useBinomeSessions.ts` | L109 | `'Erreur lors du chargement'` |
| `src/hooks/useBinomeSessions.ts` | L200 | `'Erreur lors de la creation'` |
| `src/hooks/useBinomeSessions.ts` | L225 | `'Erreur'` |
| `src/hooks/useBinomeSessions.ts` | L247 | `'Erreur'` |
| `src/hooks/useAIAssistant.ts` | L66 | `'Erreur inconnue'` |
| `src/hooks/useAIAssistant.ts` | L112 | `'Erreur inconnue'` |
| `src/hooks/useVoiceIcebreaker.ts` | L40 | `'Erreur inconnue'` |
| `src/hooks/useVoiceIcebreaker.ts` | L77 | `'Erreur de lecture audio'` |
| `src/hooks/useLocationRecommendations.ts` | L86 | `'Erreur inconnue'` |
| `src/hooks/useEventScraper.ts` | L53 | `'Erreur inconnue'` |
| `src/hooks/useSubscription.ts` | L45 | `'Erreur de verification'` |

**Pourquoi c'est un probleme** : En mode anglais, l'utilisateur voit un message en francais quand une erreur survient. Ces fallbacks sont utilises quand l'objet catch n'est pas une instance de Error.

**Solution** : Remplacer par des messages anglais neutres (puisque les erreurs Supabase arrivent deja en anglais). Utiliser des messages generiques comme `'Unknown error'`, `'Loading error'`, `'Audio playback error'`, etc. Les hooks n'ayant pas acces au contexte React, l'utilisation de `useTranslation()` n'est pas possible sans refactoring plus lourd.

---

## Plan de Corrections

### Etape 1 : Fix `useBinomeSessions.ts` (4 remplacements)

- L109 : `'Erreur lors du chargement'` -> `'Loading error'`
- L200 : `'Erreur lors de la creation'` -> `'Creation error'`
- L225, L247 : `'Erreur'` -> `'Error'`

### Etape 2 : Fix `useAIAssistant.ts` (2 remplacements)

- L66, L112 : `'Erreur inconnue'` -> `'Unknown error'`

### Etape 3 : Fix `useVoiceIcebreaker.ts` (2 remplacements)

- L40 : `'Erreur inconnue'` -> `'Unknown error'`
- L77 : `'Erreur de lecture audio'` -> `'Audio playback error'`

### Etape 4 : Fix `useLocationRecommendations.ts` (1 remplacement)

- L86 : `'Erreur inconnue'` -> `'Unknown error'`

### Etape 5 : Fix `useEventScraper.ts` (1 remplacement)

- L53 : `'Erreur inconnue'` -> `'Unknown error'`

### Etape 6 : Fix `useSubscription.ts` (1 remplacement)

- L45 : `'Erreur de verification'` -> `'Verification error'`

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/hooks/useBinomeSessions.ts` | 4 remplacements de fallback |
| `src/hooks/useAIAssistant.ts` | 2 remplacements de fallback |
| `src/hooks/useVoiceIcebreaker.ts` | 2 remplacements de fallback |
| `src/hooks/useLocationRecommendations.ts` | 1 remplacement de fallback |
| `src/hooks/useEventScraper.ts` | 1 remplacement de fallback |
| `src/hooks/useSubscription.ts` | 1 remplacement de fallback |

---

## Estimation

- 6 fichiers, 0 nouvelles cles, 11 lignes modifiees
- Correction purement mecanique : remplacement de chaines francaises par des equivalents anglais neutres

