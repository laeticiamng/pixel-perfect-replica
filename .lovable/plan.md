
# Audit Securite Production Complet

## Resume Executif

L'architecture securite est globalement solide. J'ai identifie **3 vulnerabilites critiques**, **4 problemes importants**, et **5 points d'amelioration mineurs**.

---

## CRITIQUE - Vulnerabilites a corriger immediatement

### S1. getClaims() ne fonctionne pas sur les anciennes versions supabase-js

**Impact** : Les Edge Functions `notifications` et `system` utilisent `@supabase/supabase-js@2.49.1`, et `ai-assistant`, `voice-icebreaker`, `recommend-locations` utilisent `@2.39.3`. La methode `getClaims()` n'existe pas dans ces versions anciennes.

**Preuve** : Les logs de production montrent l'erreur runtime :
```
TypeError: userClient.auth.getClaims is not a function
```
sur la fonction `notifications` (timestamp recent dans les logs).

**Fonctions affectees** (5 sur 13) :
- `notifications/index.ts` -- `@2.49.1`
- `system/index.ts` -- `@2.49.1`
- `ai-assistant/index.ts` -- `@2.39.3`
- `voice-icebreaker/index.ts` -- `@2.39.3`
- `recommend-locations/index.ts` -- `@2.39.3`

**Fonctions OK** (8 sur 13) :
- `check-subscription`, `create-checkout`, `customer-portal`, `purchase-session`, `confirm-session-purchase` -- `@2.57.2` (OK)
- `get-mapbox-token` -- `@2` (latest, OK)
- `firecrawl-map`, `firecrawl-scrape` -- `@2` (latest, OK)
- `scrape-events` -- `@2.93.2` (OK)

**Correction** : Aligner toutes les fonctions sur `@supabase/supabase-js@2` (latest) ou au minimum `@2.57.2`.

### S2. Firecrawl functions querying non-existent `profiles.role` column

**Impact** : `firecrawl-map` et `firecrawl-scrape` (lignes 46-50) font un `SELECT role FROM profiles WHERE id = userId`. La table `profiles` n'a **pas** de colonne `role`. La query retournera toujours une erreur ou `null`, rendant le premier check admin non-fonctionnel.

Le code a un fallback vers `user_roles` (lignes 53-59 dans les deux fichiers), donc l'acces admin fonctionne quand meme, mais c'est une erreur silencieuse qui genere du bruit dans les logs et une requete inutile.

**Correction** : Supprimer le check `profiles.role` et utiliser directement la fonction RPC `has_role()` comme les autres Edge Functions.

### S3. confirm-session-purchase : pas de verification de paiement Stripe

**Impact** : La fonction `confirm-session-purchase` ajoute des sessions achetees au profil utilisateur sur simple appel authentifie, **sans verifier qu'un paiement Stripe a reellement ete effectue**. Un utilisateur authentifie pourrait appeler cette fonction directement pour s'ajouter des sessions gratuites.

```typescript
// Ligne 50-55 : Accepte n'importe quel count entre 1 et 10
const { sessions_purchased } = await req.json();
const count = parseInt(sessions_purchased, 10);
// -> Ajoute directement via RPC sans verification Stripe
```

**Correction** : Soit verifier le `checkout.session.id` Stripe cote serveur avant d'ajouter les sessions, soit utiliser un webhook Stripe pour la confirmation au lieu d'un appel client direct. Alternative minimale : restreindre cette fonction a un appel admin/service-role uniquement.

---

## IMPORTANT - Problemes de securite

### S4. Pas de rate limiting sur les fonctions Stripe

Les fonctions `create-checkout`, `purchase-session`, `customer-portal`, et `check-subscription` n'ont aucun rate limiting. Un attaquant pourrait spam ces endpoints pour generer des sessions Stripe en boucle, ce qui pourrait impacter les couts API Stripe.

**Correction** : Ajouter un rate limit en memoire (comme `ai-assistant` et `voice-icebreaker`) ou via la table `edge_function_rate_limits`.

### S5. ai-assistant accessible sans authentification

La fonction `ai-assistant` applique le rate limiting uniquement si l'utilisateur est authentifie (`if (userId)`). Un utilisateur non-authentifie peut appeler la fonction sans limite (le rate limit est simplement skippe).

```typescript
// Ligne 104-122 : Rate limit conditionnel
if (userId) {
  const rateLimitResult = checkInMemoryRateLimit(userId, action);
  // ...
}
// Si pas de userId -> pas de rate limit, execution continue
```

**Correction** : Exiger l'authentification ou appliquer un rate limit par IP pour les appels anonymes.

### S6. scrape-events insere des events avec un organizer_id fictif

Ligne 233 : `organizer_id: '00000000-0000-0000-0000-000000000000'` -- Ce UUID fictif ne correspond a aucun utilisateur reel dans `auth.users`. Cela pourrait causer des erreurs de jointure et bypass les policies RLS si des queries filtrent par `organizer_id`.

**Correction** : Utiliser l'`userId` de l'admin qui declenche le scraping comme `organizer_id`.

### S7. CORS Access-Control-Allow-Origin: * sur toutes les fonctions

Toutes les Edge Functions utilisent `Access-Control-Allow-Origin: *`. En production, cela permet a n'importe quel site web d'appeler les API. Bien que les endpoints soient proteges par JWT, cela augmente la surface d'attaque (CSRF potentiel si un token est recupere).

**Correction** : Restreindre a `https://nearvity.fr` et `https://nearvity.lovable.app` en production.

---

## RLS Policies - Analyse Complete

### Points forts (conforme)
- **Isolation utilisateur** : Toutes les tables sensibles (`profiles`, `user_settings`, `emergency_contacts`) ont des policies `auth.uid() = id/user_id`
- **Protection admin** : `user_roles` et `edge_function_rate_limits` bloquent tout acces direct (`USING (false)`)
- **Immutabilite** : `messages`, `session_feedback`, `app_feedback` sont proteges contre UPDATE/DELETE
- **Shadow ban** : Les fonctions RPC (`get_nearby_signals`, `get_profile_for_display`, etc.) excluent les shadow-banned
- **Blocage bidirectionnel** : `get_nearby_signals` et `get_available_sessions` filtrent les bloques dans les 2 sens
- **Protection des secrets** : `qr_code_secret` est exclu des fonctions publiques (`get_event_for_participant_secure`)
- **Floutage GPS** : Les coordonnees sont arrondies a 3 decimales (~100m) via `validate_interaction_location` et `fuzz_coordinates`

### Points a surveiller
- La table `profiles` expose potentiellement `shadow_banned`, `shadow_ban_reason` et `email` via le SELECT RLS (`auth.uid() = id`). Cela est acceptable car seul l'utilisateur lui-meme peut voir ses propres donnees, mais la fonction `get_own_profile()` est plus securisee car elle exclut `shadow_banned`.
- La table `active_signals` a un SELECT large pour les utilisateurs authentifies -- filtre par ghost mode et expiration, mais pas par distance (fait cote RPC).

---

## Input Validation - Analyse

### Points forts
- **Zod schemas** : Validation stricte sur email, password, firstName, university avec regex et limites de longueur
- **DOMPurify** : Module `sanitize.ts` complet avec sanitizeText, sanitizeUrl, sanitizeDbText
- **Protection URL** : Blocage de `javascript:`, `vbscript:`, `data:` URIs
- **Pas de innerHTML** : Seul `chart.tsx` (shadcn/ui) utilise `dangerouslySetInnerHTML` pour du CSS genere, pas de donnees utilisateur
- **Contraintes DB** : Bio limitee a 500 chars, description a 200 chars via triggers

### Points faibles
- **Edge Functions** : Les inputs des Edge Functions (ex: `university_url` dans scrape-events, `url` dans firecrawl) ne sont pas sanitizes avant d'etre passes aux APIs externes. Un admin malveillant pourrait injecter des URLs internes (SSRF).
- **confirm-session-purchase** : Le `sessions_purchased` est parse comme int mais n'est valide que pour la plage 1-10. C'est correct mais devrait aussi verifier le type string avant `parseInt`.

---

## Rate Limiting - Inventaire

| Fonction | Rate Limit | Type |
|----------|-----------|------|
| ai-assistant | 20 req/min (icebreaker), 10 req/min (recommendations) | In-memory |
| voice-icebreaker | 5 req/min | In-memory |
| Reveal profiles | 10/heure, 50/jour | DB (reveal_logs) |
| Reports | 5/heure | DB (check_report_rate_limit) |
| create-checkout | Aucun | -- |
| purchase-session | Aucun | -- |
| customer-portal | Aucun | -- |
| check-subscription | Aucun | -- |
| confirm-session-purchase | Aucun | -- |
| notifications | Aucun | -- |
| system | Aucun | -- |

---

## Plan de Corrections (par priorite)

| # | Correction | Fichier(s) | Severite |
|---|---|---|---|
| S1 | Aligner @supabase/supabase-js sur @2 (latest) dans 5 fonctions | `notifications`, `system`, `ai-assistant`, `voice-icebreaker`, `recommend-locations` | CRITIQUE |
| S3 | Ajouter verification paiement Stripe dans confirm-session-purchase | `confirm-session-purchase/index.ts` | CRITIQUE |
| S2 | Remplacer profiles.role par has_role() dans firecrawl functions | `firecrawl-map/index.ts`, `firecrawl-scrape/index.ts` | CRITIQUE |
| S5 | Exiger auth dans ai-assistant ou rate limit par IP | `ai-assistant/index.ts` | IMPORTANT |
| S4 | Ajouter rate limiting aux fonctions Stripe | 4 fichiers Stripe | IMPORTANT |
| S6 | Utiliser userId admin comme organizer_id dans scrape-events | `scrape-events/index.ts` | IMPORTANT |
| S7 | Restreindre CORS en production | Toutes les Edge Functions | MINEUR |

**Estimation** : 5 fichiers Edge Functions a mettre a jour pour S1 (changement d'import), 2 fichiers pour S2 (refactoring admin check), 1 fichier pour S3 (ajout verification Stripe).
