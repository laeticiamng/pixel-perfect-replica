

# Audit Multi-Roles - EASY v1.7.x (Iteration 21)

---

## Problemes identifies

### BUG-40 : Hardcoded French strings dans 4 hooks restants (MOYENNE)

| Fichier | Lignes | Texte hardcode | Remplacement |
|---------|--------|----------------|-------------|
| `src/hooks/useSubscription.ts` | L53, L74, L88, L102, L115 | `'Utilisateur non connecté'` | `'Not authenticated'` |
| `src/hooks/useSubscription.ts` | L59 | `'Session expirée, veuillez vous reconnecter'` | `'Session expired, please log in again'` |
| `src/hooks/useMessages.ts` | L48 | `'Non connecté'` | `'Not authenticated'` |
| `src/hooks/useEvents.ts` | L94, L121, L141, L158 | `'Non connecté'` | `'Not authenticated'` |
| `src/hooks/useSessionChat.ts` | L44, L101 | `'Utilisateur'` (fallback name) | `'User'` |

**Total** : 12 remplacements dans 4 fichiers.

---

## Plan de Corrections

### Etape 1 : Fix `useSubscription.ts` (6 remplacements)

- L53, L74, L88, L102, L115 : `'Utilisateur non connecté'` -> `'Not authenticated'`
- L59 : `'Session expirée, veuillez vous reconnecter'` -> `'Session expired, please log in again'`

### Etape 2 : Fix `useMessages.ts` (1 remplacement)

- L48 : `'Non connecté'` -> `'Not authenticated'`

### Etape 3 : Fix `useEvents.ts` (4 remplacements)

- L94, L121, L141, L158 : `'Non connecté'` -> `'Not authenticated'`

### Etape 4 : Fix `useSessionChat.ts` (2 remplacements)

- L44, L101 : `'Utilisateur'` -> `'User'` (fallback display name)

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/hooks/useSubscription.ts` | 6 remplacements |
| `src/hooks/useMessages.ts` | 1 remplacement |
| `src/hooks/useEvents.ts` | 4 remplacements |
| `src/hooks/useSessionChat.ts` | 2 remplacements |

---

## Estimation

- 4 fichiers, 0 nouvelles cles, 13 lignes modifiees
- Correction purement mecanique : remplacement de chaines francaises par des equivalents anglais neutres
- Apres cette iteration, tous les hooks du projet seront conformes i18n

