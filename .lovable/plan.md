
# Audit Multi-Roles - EASY v1.7.x (Iteration 18)

---

## Problemes identifies

### BUG-31 : `ThemeToggle.tsx` -- Labels "Clair", "Sombre", "Systeme" hardcodes (HAUTE)

**Fichier** : `src/components/ThemeToggle.tsx` L16-18

```tsx
{ value: 'light', icon: Sun, label: 'Clair' },
{ value: 'dark', icon: Moon, label: 'Sombre' },
{ value: 'system', icon: Monitor, label: 'Système' },
```

Labels visibles dans les tooltips et les boutons. Pas de `useTranslation()` importe.

### BUG-32 : `useVerificationBadges.ts` -- 4 labels et descriptions hardcodes en francais (HAUTE)

**Fichier** : `src/hooks/useVerificationBadges.ts` L87-108

La fonction `getBadgeInfo()` retourne des labels et descriptions en francais brut :
- `'Etudiant verifie'` / `'Email universitaire verifie'`
- `'LinkedIn'` / `'Compte LinkedIn connecte'`
- `'Instagram'` / `'Compte Instagram connecte'`
- `'Photo verifiee'` / `'Selfie de verification valide'`

Ces textes sont affiches dans `VerificationBadges.tsx` (tooltips + labels visibles).

### BUG-33 : `LocationDescriptionInput.tsx` -- Placeholder + hint hardcodes (MOYENNE)

**Fichier** : `src/components/radar/LocationDescriptionInput.tsx`

- L22 : `placeholder = "Ex: BU 2eme etage, Cafe du coin..."` (francais)
- L67 : `"Optionnel - aide les autres a te trouver"` (francais)

Pas de `useTranslation()` importe.

### BUG-34 : Tests avec assertions en francais obsoletes (BASSE - non bloquant)

**Fichiers** : `src/test/e2e-signup-signal.test.tsx`, `src/test/validation.test.ts`

Les tests verifient `label === 'Faible'` / `'Fort'` alors que `getPasswordStrength()` retourne maintenant `'weak'` / `'strong'`. Ces tests echoueront. Correction simple : mettre a jour les assertions.

---

## Plan de Corrections

### Etape 1 : Ajouter les cles dans `translations.ts` (~10 cles)

Ajouter :
- `theme.light`, `theme.dark`, `theme.system`
- `badges.emailEdu.label`, `badges.emailEdu.description`
- `badges.linkedin.label`, `badges.linkedin.description`
- `badges.instagram.label`, `badges.instagram.description`
- `badges.photoLiveness.label`, `badges.photoLiveness.description`
- `locationInput.placeholder`, `locationInput.hint`

### Etape 2 : i18n `ThemeToggle.tsx`

Importer `useTranslation()`. Remplacer les labels hardcodes par `t('theme.light')`, `t('theme.dark')`, `t('theme.system')`.

### Etape 3 : i18n `useVerificationBadges.ts`

Le hook ne peut pas utiliser `useTranslation()` directement car il faudrait le passer en parametre. Solution : transformer `getBadgeInfo` pour accepter une fonction `t` en parametre, ou deplacer la logique dans le composant `VerificationBadges.tsx` qui a deja acces au contexte React.

Approche retenue : Deplacer le mapping des labels dans `VerificationBadges.tsx` en utilisant `useTranslation()`, et faire retourner uniquement le `badge_type` depuis le hook.

### Etape 4 : i18n `LocationDescriptionInput.tsx`

Importer `useTranslation()`. Remplacer le placeholder et le hint par des cles traduites.

### Etape 5 : Fix tests obsoletes

Mettre a jour les assertions dans les fichiers de test pour utiliser `'weak'`/`'medium'`/`'strong'` au lieu de `'Faible'`/`'Moyen'`/`'Fort'`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/lib/i18n/translations.ts` | +10 cles |
| `src/components/ThemeToggle.tsx` | import useTranslation + 3 labels |
| `src/hooks/useVerificationBadges.ts` | retourner cles i18n au lieu de texte |
| `src/components/social/VerificationBadges.tsx` | utiliser t() pour les labels |
| `src/components/radar/LocationDescriptionInput.tsx` | import useTranslation + 2 textes |
| `src/test/validation.test.ts` | fix 3 assertions |
| `src/test/e2e-signup-signal.test.tsx` | fix 2 assertions |

---

## Estimation

- 7 fichiers, ~10 nouvelles cles, ~25 lignes modifiees
