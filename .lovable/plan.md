

## Beta Test Final - Corrections avant production

### 3 erreurs de build a corriger

**1. `CreateSessionForm.tsx` - `formSchema` utilise avant d'etre defini (ligne 33)**

Le type `FormData` est derive de `formSchema` au niveau du module, mais `formSchema` est cree dynamiquement dans le composant (car il depend de `t()` pour l'i18n). La solution : remplacer le type `FormData` par une inference basee sur `ReturnType` du schema factory, ou definir le type manuellement.

**2. `useBinomeSessions.ts` - Type `SessionRow` incompatible (ligne 111)**

Le RPC `get_available_sessions` retourne des colonnes differentes de `SessionRow` (pas de `created_at`, mais a `creator_name`, `creator_avatar`, etc.). La solution : caster via `unknown` ou creer un type intermediaire `RpcSessionRow` separe.

**3. `usePushSubscription.ts` - `pushManager` non reconnu (lignes 30, 73, 116)**

TypeScript ne reconnait pas `pushManager` sur `ServiceWorkerRegistration`. La solution : ajouter un cast `as any` ou declarer le type globalement dans `vite-env.d.ts`.

### 4 references residuelles "EASY" a renommer en "NEARVITY"

| Fichier | Ancien | Nouveau |
|---|---|---|
| `useGdprExport.ts` | `easy-data-export-` | `nearvity-data-export-` |
| `useTheme.ts` | `easy-theme-storage` | `nearvity-theme-storage` |
| `useTranslation.ts` | `easy-i18n` | `nearvity-i18n` |
| `ProfileQRCode.tsx` | `easy-profile-` | `nearvity-profile-` |

### Plan d'execution

1. Corriger `CreateSessionForm.tsx` : deplacer le type `FormData` pour utiliser `z.infer` avec le schema factory via un type generique
2. Corriger `useBinomeSessions.ts` : caster le resultat RPC via `unknown` avant `SessionRow[]`
3. Corriger `usePushSubscription.ts` : ajouter un cast `(registration as any).pushManager` aux 3 endroits
4. Renommer les 4 references "easy" restantes en "nearvity"
5. Verifier que le build passe sans erreur

### Details techniques

- Le storage key change (`easy-theme-storage` vers `nearvity-theme-storage`) reinitialise les preferences theme/langue des utilisateurs existants au prochain chargement -- c'est acceptable pour un rebranding
- Le cast `as any` pour `pushManager` est la solution standard car les types DOM de TypeScript ne l'incluent pas toujours selon la version de `lib` dans tsconfig

