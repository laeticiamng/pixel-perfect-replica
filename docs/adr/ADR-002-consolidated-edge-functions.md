# ADR-002 — Consolidation des edge functions

- **Statut** : Accepté
- **Date** : 2026-04-17
- **Décideurs** : Architecture
- **Plan associé** : `.lovable/plan.md` (Horizon 1, gouvernance)

## Contexte

Lovable Cloud impose une limite sur le nombre d'edge functions déployables.
Plusieurs domaines transverses (notifications, maintenance système,
nettoyage cron) génèrent naturellement de petites fonctions discrètes :

- `send-push`, `mark-notifications-read`, `register-push-subscription`
- `cleanup-signals`, `cleanup-rate-limits`, `system-stats`, `health-check`
- ...

Maintenir une fonction par action ferait exploser le quota.

## Décision

Nous **consolidons** ces fonctions par domaine fonctionnel :

| Edge function | Domaine | Routage interne |
|---|---|---|
| `notifications` | Push, mark-read, subscriptions | header/body `action` |
| `system` | Cron, stats, health | header/body `action` |

### Règles de routage

1. Le client passe `{ action: '<verb>', ...payload }`.
2. La fonction valide :
   - **Auth** via `getClaims()` partagé (`_shared/auth.ts`) si l'action exige
     un utilisateur authentifié.
   - **Service-role / cron** si l'action est interne (cleanup, stats admin).
3. Validation Zod par action (`_shared/validation.ts`).
4. Rate limit par action (`_shared/ratelimit.ts`).

## Conséquences

### Positives
- Quota d'edge functions préservé.
- Helpers partagés (`_shared/*`) appliqués uniformément.
- Une seule URL à monitorer par domaine.

### Négatives
- **Risque de fuite de métadonnées** : un endpoint `/health` qui listerait
  toutes les actions disponibles avec leur `auth_required` est interdit
  (cf. mémoire `information-leak-prevention`). Les fonctions retournent
  uniquement le statut de l'action demandée.
- **Couplage** : un bug dans une action peut impacter le déploiement de
  toutes les autres du même domaine. Mitigé par tests unitaires par action.
- **Logs moins lisibles** : impose de filtrer par `action` dans
  `edge_function_logs`.

## Garde-fous

- **Aucun endpoint public ne doit énumérer les actions disponibles** ni leurs
  exigences d'auth.
- Toute nouvelle action doit déclarer dans son code source :
  - schéma Zod du payload
  - règle de rate limit
  - exigence d'auth (utilisateur / service / aucun)
  - secrets utilisés
- Le routage `action` doit utiliser une `Map<string, Handler>` typée — jamais
  un `eval` ou un dispatch dynamique non typé.

## Références

- Code : `supabase/functions/notifications/index.ts`
- Code : `supabase/functions/system/index.ts`
- Code : `supabase/functions/_shared/auth.ts`
- Mémoire : `memory/architecture/backend-patterns`
- Mémoire : `memory/security/information-leak-prevention`
