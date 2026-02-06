

# Audit Multi-Roles - EASY v1.7.x (Iteration 20)

---

## Problemes identifies

### BUG-36 : Fallback icebreakers 100% francais dans `useAIAssistant.ts` (HAUTE)

**Fichier** : `src/hooks/useAIAssistant.ts` L129-164

La fonction `getFallbackIcebreakers()` contient 18 phrases d'icebreaker entierement en francais, utilisees quand l'API IA echoue. Un utilisateur anglophone verra des phrases comme "Hey ! Tu revises quoi en ce moment ?" sans aucune adaptation linguistique.

**Solution** : Dupliquer les fallbacks en anglais et selectionner selon la locale. Comme le hook n'a pas acces au contexte React, passer la locale en parametre depuis le composant appelant.

### BUG-37 : `useVoiceIcebreaker.ts` L84 - encore un fallback francais oublie (MOYENNE)

**Fichier** : `src/hooks/useVoiceIcebreaker.ts` L84

```tsx
setError('Impossible de lire l\'audio');
```

Ce message a ete oublie dans l'Iteration 19. Il est visible dans l'UI.

**Solution** : Remplacer par `'Unable to play audio'`.

### BUG-38 : `adminAlerts.ts` - Messages admin en francais (BASSE)

**Fichier** : `src/lib/adminAlerts.ts` L42-43, L51-52, L60-61

Les messages d'alerte admin (email) sont en francais. Comme ces messages sont envoyes par email aux administrateurs (contexte interne), c'est un choix delibere et non un bug. Aucune action requise.

### BUG-39 : `ChangelogPage.tsx` - Items du changelog en francais uniquement (BASSE)

Le changelog contient des items en francais brut avec un avertissement `frenchOnly` pour les non-francophones. C'est un choix accepte -- traduire tout l'historique n'est pas prioritaire. Aucune action requise.

---

## Plan de Corrections

### Etape 1 : i18n des fallback icebreakers dans `useAIAssistant.ts`

Modifier `getFallbackIcebreakers()` pour accepter un parametre `locale: string` et retourner les phrases dans la langue correspondante.

Ajouter un second jeu de fallbacks en anglais :
- studying: "Hey! What are you studying right now?", etc.
- eating: "Hungry? I know a great spot!", etc.
- working: "What are you working on?", etc.
- talking: "Hey! Fancy a coffee break?", etc.
- sport: "Ready for a workout?", etc.
- other: "Hey! What are you up to?", etc.

Mettre a jour les appels a `getFallbackIcebreakers()` pour passer la locale courante.

### Etape 2 : Fix `useVoiceIcebreaker.ts` L84

Remplacer `'Impossible de lire l\'audio'` par `'Unable to play audio'`.

---

## Fichiers a modifier

| Fichier | Changements |
|---------|------------|
| `src/hooks/useAIAssistant.ts` | Ajouter fallbacks EN, parametre locale |
| `src/hooks/useVoiceIcebreaker.ts` | 1 remplacement de fallback |

---

## Estimation

- 2 fichiers, ~30 lignes modifiees
- Icebreakers FR conserves, equivalents EN ajoutes

