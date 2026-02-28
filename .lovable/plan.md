

## Plan : 8 Tickets Securite - Sprint "Prod Safe" + "Hardening"

Ce plan couvre les 8 tickets de securite identifies, organises en 2 sprints logiques.

---

### Sprint 1 : Prod Safe (P0 - Tickets 1, 2, 3, 4)

#### Ticket 1 : RLS Hardening table `connections`

**Etat actuel** : La table `connections` a deja des policies RLS correctes (SELECT/INSERT/UPDATE/DELETE scope par `user_a`/`user_b`). Le schema est bien contraint avec `initiated_by` et ordre canonique.

**Actions** :
- Ajouter un index composite sur `(user_a, user_b)` pour performance des lookups
- Ajouter une contrainte UNIQUE sur `(user_a, user_b)` pour eviter les doublons
- Ajouter une validation trigger : `user_a < user_b` (ordre canonique enforce cote DB)
- Migration SQL via l'outil de migration

**Fichiers** : `supabase/migrations/` (nouvelle migration)

---

#### Ticket 2 : Auth centralisee `_shared/auth.ts`

**Etat actuel** : Toutes les 14 Edge Functions utilisent deja `getClaims()` - bonne nouvelle. Mais le pattern est duplique partout avec des variations mineures (certaines retournent 401, d'autres throw).

**Actions** :
- Creer `supabase/functions/_shared/auth.ts` avec un helper :

```text
authenticateRequest(req, supabaseClient) -> { userId, email, claims } | Response(401)
```

- Refactorer chaque function pour importer et utiliser ce helper
- Standardiser les reponses 401/403 (format JSON uniforme)

**Fichiers** : 
- Nouveau : `supabase/functions/_shared/auth.ts`
- Modifier : les 14 fichiers `index.ts` de chaque function

---

#### Ticket 3 : Compensating controls pour `verify_jwt=false`

**Etat actuel** : Toutes les functions ont `verify_jwt = false` dans `config.toml`. La validation se fait en code via `getClaims()`.

**Actions** (integrees dans le helper du Ticket 2) :
- Verifier presence des claims obligatoires (`sub`, `exp`)
- Verifier que le token n'est pas expire (check `exp` vs `Date.now()`)
- Logger les tentatives echouees sans fuiter le token (log uniquement les 8 premiers chars)
- Retourner des erreurs claires et coherentes

**Fichiers** : `supabase/functions/_shared/auth.ts` (meme fichier que Ticket 2)

---

#### Ticket 4 : Rate limiting endpoints sensibles

**Etat actuel** : Rate limit en place sur `voice-icebreaker` (5/min in-memory) et `create-checkout` (5/min in-memory). Absent sur les autres endpoints couteux.

**Actions** :
- Creer `supabase/functions/_shared/ratelimit.ts` avec un helper generique in-memory
- Ajouter rate limiting sur :
  - `customer-portal` : 5/min
  - `confirm-session-purchase` : 5/min
  - `purchase-session` : 5/min
  - `firecrawl-map` : 10/min
  - `firecrawl-scrape` : 10/min
  - `scrape-events` : 5/min
  - `recommend-locations` : 10/min
  - `ai-assistant` : 20/min (deja en place dans le code, a confirmer)
- Reponse 429 avec header `Retry-After`

**Fichiers** :
- Nouveau : `supabase/functions/_shared/ratelimit.ts`
- Modifier : ~8 fichiers `index.ts`

---

### Sprint 2 : Hardening + DX (P1-P2 - Tickets 5, 6, 7, 8)

#### Ticket 5 : Validation Zod dans Edge Functions

**Actions** :
- Ajouter `zod` comme import Deno dans les functions qui acceptent un body
- Creer des schemas pour chaque endpoint :
  - `create-checkout` : `{ plan: z.enum(['nearvityplus','monthly','yearly']) }`
  - `purchase-session` : `{ quantity: z.number().int().min(1).max(10) }`
  - `confirm-session-purchase` : `{ sessions_purchased: z.number(), checkout_session_id: z.string() }`
  - `ai-assistant` : `{ prompt: z.string().max(2000) }`
  - `voice-icebreaker` : `{ text: z.string().max(500) }` (deja valide manuellement)
  - `firecrawl-*` : `{ url: z.string().url().max(2000) }`
  - `recommend-locations` : valider lat/lon/radius
  - `scrape-events` : valider url + options
- Retourner 400 avec details si invalide

**Fichiers** : ~10 fichiers `index.ts` + potentiellement `_shared/validation.ts`

---

#### Ticket 6 : Stripe Webhook source of truth

**Actions** :
- Creer une nouvelle Edge Function `supabase/functions/stripe-webhook/index.ts`
- Verifier la signature Stripe (`stripe.webhooks.constructEvent`)
- Gerer les evenements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Mettre a jour `profiles.is_premium` depuis le webhook (source of truth)
- Ajouter config dans `config.toml` avec `verify_jwt = false` (webhook public)
- Cote front : `check-subscription` devient un fallback/cache, le webhook est la source primaire
- Necessite que l'utilisateur configure le webhook URL dans le dashboard Stripe

**Fichiers** :
- Nouveau : `supabase/functions/stripe-webhook/index.ts`
- Modifier : `supabase/config.toml` (ajoute automatiquement)
- Secret necessaire : `STRIPE_WEBHOOK_SECRET` (a demander a l'utilisateur)

---

#### Ticket 7 : Anti-polling check-subscription

**Etat actuel** : Le bug de boucle infinie a ete corrige (useRef). Le polling 60s est en place.

**Actions** :
- Ajouter un cache en memoire (zustand ou state local) pour eviter les appels redondants
- Implementer un backoff : si erreur, doubler l'intervalle (60s -> 120s -> 240s, max 5min)
- Invalider le cache apres checkout reussi (`?success=true` dans l'URL)
- Reduire la frequence de polling a 5 minutes (au lieu de 60s) une fois le webhook en place

**Fichiers** :
- `src/hooks/useSubscription.ts`
- `src/pages/PremiumPage.tsx` (invalidation post-checkout)

---

#### Ticket 8 : Nettoyage forwardRef warnings

**Actions** :
- Identifier les warnings app-level (composants propres) vs libs tierces
- Corriger les composants internes utilisant `forwardRef` deprecated (React 19 pattern)
- Documenter les warnings non corrigeables (Radix UI, react-map-gl) dans `docs/known-issues.md`

**Fichiers** :
- Composants concernes (a identifier exactement)
- Nouveau : `docs/known-issues.md`

---

### Ordre d'implementation recommande

1. **Tickets 2+3** ensemble (helper auth centralise) - fondation pour tout le reste
2. **Ticket 4** (rate limiting) - utilise le helper auth
3. **Ticket 1** (RLS connections) - migration SQL independante
4. **Ticket 5** (validation Zod) - amelioration incrementale des functions
5. **Ticket 6** (Stripe webhook) - necessite secret utilisateur
6. **Ticket 7** (anti-polling) - depend du ticket 6
7. **Ticket 8** (forwardRef) - independant, faible priorite

### Estimation totale : ~3-4 sessions de travail

