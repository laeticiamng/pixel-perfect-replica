

## Rapport E2E : Verification des flux critiques

### Resultats des tests

| Flux | Statut | Details |
|------|--------|---------|
| Landing page `/` | OK | Cookie consent fonctionne, page charge correctement |
| Route protegee `/map` | OK | Redirection vers `/onboarding` si non connecte, affichage radar + carte si connecte |
| Signup `/onboarding` | OK | Formulaire complet (email, password, prenom, universite), OAuth Google/Apple, validation Zod |
| Login `/onboarding` (toggle) | OK | Bascule signup/login, mot de passe oublie, lien magique |
| Premium `/premium` | OK | Quota sessions (1/2), Nearvity+ 9.90EUR, session unitaire 0.99EUR, pas de boucle reseau |
| `check-subscription` | OK | 1 seul appel, reponse en ~2.6s, cache 60s actif |

### Problemes identifies

#### P1 — Spam requetes `user_settings` (13 appels au chargement)

**Severite** : Moyenne (performance)

**Cause** : Le hook `useTranslation()` dans `src/lib/i18n/useTranslation.ts` appelle `fetchLanguagePreference()` a chaque montage de composant. Comme ce hook est utilise dans de nombreux composants (ProtectedRoute, PageLayout, BottomNav, MapHeader, etc.), chaque instance declenche une requete independante vers `user_settings`.

**Evidence** : 13 requetes `GET user_settings?select=language_preference` observees lors d'une navigation vers `/premium`.

**Correction proposee** :
- Ajouter un cache dans le Zustand store pour eviter les appels redondants
- Verifier `lastFetchedAt` avant chaque appel (pattern identique a `useSubscription`)
- Alternative : deplacer le fetch dans `AuthProvider` pour ne le faire qu'une seule fois

**Fichier concerne** : `src/lib/i18n/useTranslation.ts` (lignes 57-76)

#### P2 — forwardRef warning (connu)

**Severite** : Faible (cosmétique)

**Cause** : `AnimatePresence` de framer-motion passe un ref a `AnimatedRoutes` qui est un function component.

**Statut** : Documente dans `docs/known-issues.md`. Pas de correction possible sans migration Framer Motion v13+.

#### P3 — Auth errors dans les logs Edge Functions

**Severite** : Faible (pas d'impact utilisateur)

**Cause** : La fonction `notifications` est appelee par un cron job avec un token invalide. L'erreur `403: invalid claim: missing sub claim` apparait regulierement dans les logs.

**Correction proposee** : Le cron job appelant `notifications` devrait utiliser le `SUPABASE_SERVICE_ROLE_KEY` au lieu d'un token utilisateur, ou la fonction devrait gerer le cas d'un appel systeme sans JWT.

### Actions recommandees

1. **Corriger le spam `user_settings`** dans `useTranslation.ts` — ajouter un mecanisme de cache/deduplication similaire a `useSubscription` (lastFetchedAt + CACHE_TTL de 60s)
2. **Corriger l'appel cron `notifications`** — utiliser le service role key ou ajouter une detection d'appel systeme dans la fonction

### Details techniques de la correction P1

Dans `src/lib/i18n/useTranslation.ts`, ajouter un ref de cache au niveau du store Zustand :

```text
// Ajouter au store
lastLanguageFetchAt: number (default 0)
setLastLanguageFetch: () => void

// Dans le useEffect fetchLanguagePreference
if (Date.now() - lastLanguageFetchAt < 60000) return; // Skip si < 60s
```

Cela reduira les 13 requetes a 1 seule par minute maximum.

