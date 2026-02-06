

# Audit Multi-Roles - EASY v1.7.x (Iteration 14 - Final)

---

## Constat global

Apres 13 iterations, la couverture i18n est a 99.9%. Un seul composant utilisateur reste avec des textes hardcodes en anglais.

## BUG-20 : `InteractiveMap.tsx` -- 2 textes hardcodes en anglais (MOYENNE)

**Fichier** : `src/components/map/InteractiveMap.tsx`

- L134 : `setError('Map unavailable')` -- message d'erreur affiche a l'utilisateur
- L266 : `'Loading map...'` -- texte de chargement affiche a l'utilisateur
- L277 : `error || 'Map unavailable'` -- fallback affiche a l'utilisateur

Ces textes sont visibles par tous les utilisateurs sur la page carte (route principale `/map`).

---

## Plan de Corrections

### Etape 1 : Ajouter 2 cles dans translations.ts

```
map.loading: { fr: 'Chargement de la carte...', en: 'Loading map...' }
map.unavailable: { fr: 'Carte indisponible', en: 'Map unavailable' }
```

### Etape 2 : Implementer i18n dans `InteractiveMap.tsx`

Importer `useTranslation()`. Remplacer les 3 occurrences hardcodees par `t('map.loading')` et `t('map.unavailable')`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +2 cles (`map.loading`, `map.unavailable`) |
| `src/components/map/InteractiveMap.tsx` | import useTranslation + 3 remplacements |

---

## Bilan final

Avec cette derniere correction, la plateforme EASY v1.7.x atteint une couverture i18n FR/EN de **100%** sur tous les composants visibles par les utilisateurs. La page DiagnosticsPage conserve des labels techniques en anglais (dev-only), ce qui est acceptable.

Total iterations 8-14 : ~20 fichiers modifies, ~185 cles, ~520 lignes.

