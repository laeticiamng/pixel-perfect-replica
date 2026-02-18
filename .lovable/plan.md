

## Audit final et corrections pre-production NEARVITY

### Problemes identifies

**1. Erreurs console : forwardRef manquant sur GuaranteeSection et FinalCTASection**
La `LandingPage` passe un `ref` (via `useScroll` / framer-motion) a `GuaranteeSection` et `FinalCTASection` qui sont des function components sans `forwardRef`. Ces warnings polluent la console.

- **Correction** : Verifier dans `LandingPage.tsx` -- ces composants ne recoivent pas de `ref` directement (lignes 171-172 le confirment). Le warning vient de framer-motion qui tente de passer un ref via `AnimatePresence`. Ce n'est pas un bug bloquant mais on va quand meme wrapper les deux composants avec `forwardRef` pour supprimer le warning.

**2. Derniere reference "easy" residuelle dans le code**
- `src/lib/recommendationCache.ts` ligne 26 : `easy_location_cache_` doit devenir `nearvity_location_cache_`

**3. Premium et Reservation : clarifier le lien UX**
- La page Premium est deja complete avec les 3 tiers (Free, Pay-per-use, Nearvity+)
- Le `SessionQuotaBadge` redirige deja vers `/premium`
- Le `BinomePage` redirige deja vers `/premium` quand le quota est atteint
- **Amelioration** : Ajouter un bandeau explicatif en haut de BinomePage quand le quota est epuise, avec un message clair "Debloquez plus de sessions" pointant vers Premium, pour que l'utilisateur comprenne immediatement

**4. Responsive : verification des composants cles**
- `SessionCard`, `CreateSessionForm`, `PremiumPage` utilisent des classes Tailwind responsive (grid, flex-wrap, etc.) -- ils sont deja responsive
- La `BottomNav` est presente sur `BinomePage` pour mobile
- Le `Sheet` de creation utilise `side="bottom"` avec `h-[90vh]` -- fonctionne sur mobile et desktop

**5. Connexion A-Z : flux complet**
- Signup email/password fonctionne (avec validation Zod, retry profile, confirmation email)
- Login email/password fonctionne (avec rate limiting, gestion "Email not confirmed")
- Magic Link fonctionne
- Google OAuth fonctionne (avec fallback Lovable -> Supabase)
- Forgot password -> Reset password fonctionne
- Le trigger `handle_new_user` cree automatiquement le profil, les stats et les settings

**6. Reservation A-Z : flux complet**
- Creation de session via `CreateSessionForm` -> `useBinomeSessions.createSession` -> insert dans `scheduled_sessions`
- Quota verifie via `useSessionQuota` -> RPC `get_current_month_usage`
- Join session via RPC `join_session` (verifie capacite, statut)
- Leave session via RPC `leave_session` (penalite fiabilite si <2h)
- Cancel session (creator only)
- Detail session, chat, check-in, feedback -- tous les composants existent

### Plan d'execution (7 corrections)

1. **`GuaranteeSection.tsx`** : Wrapper avec `forwardRef` pour supprimer le warning console
2. **`FinalCTASection.tsx`** : Wrapper avec `forwardRef` pour supprimer le warning console
3. **`src/lib/recommendationCache.ts`** : Renommer `easy_location_cache_` en `nearvity_location_cache_`
4. **`BinomePage.tsx`** : Ajouter un bandeau d'alerte visible quand `!canCreate` avec bouton "Debloquer plus de sessions" pointant vers `/premium`, pour rendre le lien Premium/Reservation explicite
5. **`LandingPage.tsx`** : Ajouter `position: relative` au container pour corriger le warning framer-motion sur le scroll offset
6. **Verification finale** : S'assurer qu'il n'y a plus d'erreur console, de reference "easy", et que le build passe

### Impact utilisateur

- **Connexion** : Fonctionne deja de A a Z (email, Google, Magic Link, reset password)
- **Reservation** : Fonctionne deja de A a Z avec quota, redirection Premium, et bandeau explicatif ameliore
- **Premium** : Les 3 tiers sont clairs (Free 2 sessions/mois, 0.99EUR/session, 9.90EUR/mois illimite)
- **Responsive** : Mobile-first avec BottomNav, Sheet bottom, grilles adaptatives
- **Pas de breaking change** : Seuls des warnings console et un cache key sont corriges

