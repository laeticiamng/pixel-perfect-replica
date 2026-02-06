

# Audit Multi-Roles - EASY v1.7.x (Iteration 13 - Final Cleanup)

---

## Constat

Apres 12 iterations d'audit, la couverture i18n est quasi-complete. Il ne reste que **2 problemes mineurs** :

### BUG-18 : `PageHeader.tsx` -- aria-label "Retour" hardcode (BASSE)

**Fichier** : `src/components/shared/PageHeader.tsx` L35

Ce composant partage est utilise sur toutes les pages internes. Il ne dispose pas de `useTranslation()`. Le `aria-label="Retour"` doit etre traduit.

### BUG-19 : `AdminDashboardPage.tsx` L305 -- aria-label "Retour" hardcode (BASSE)

**Fichier** : `src/pages/AdminDashboardPage.tsx` L305

Meme probleme, mais ici `useTranslation()` est deja importe. Simple remplacement.

---

## Plan de Corrections

### Etape 1 : Ajouter une cle `common.back` dans translations.ts

Ajouter une cle generique reutilisable :
- `common.back` : `{ fr: 'Retour', en: 'Back' }`

### Etape 2 : i18n `PageHeader.tsx`

Importer `useTranslation()`. Remplacer `aria-label="Retour"` par `aria-label={t('common.back')}`.

### Etape 3 : Fix `AdminDashboardPage.tsx` L305

Remplacer `aria-label="Retour"` par `aria-label={t('common.back')}` (le hook est deja present).

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +1 cle (`common.back`) |
| `src/components/shared/PageHeader.tsx` | import useTranslation + aria-label traduit |
| `src/pages/AdminDashboardPage.tsx` | aria-label traduit (1 ligne) |

---

## Bilan global apres Iteration 13

La plateforme EASY v1.7.x atteint une couverture i18n FR/EN de **100%** sur l'ensemble des composants, pages, hooks et ARIA labels. Plus aucun texte visible par l'utilisateur n'est hardcode en francais. Total sur les iterations 8-13 : ~15 fichiers, ~180 cles, ~500 lignes modifiees.

