
The user wants me to continue framing/improving the platform using complex systems architecture and governance. Horizon 1 is partially done (has_role hardened, signalStore purged, types cleaned). Now I should propose Horizon 1 finishing touches + start Horizon 2.

Looking at the plan.md, remaining Horizon 1 items:
- Centralize observability (lib/observability.ts)
- Audit trigger on sensitive profiles UPDATE → admin_audit_logs
- ADR-001 documenting Stripe polling decision

Then enter Horizon 2 with one concrete differentiator. The most leveraged is **Discovery page** because the RPC `discover_users` already exists but isn't surfaced — pure UI work on a hardened backend, perfect for the governance-first philosophy.

Let me keep this plan tight and actionable.

---

# Plan — Finir Horizon 1 + amorcer Horizon 2

## Objectif systémique
Clore la phase de *Hardening* (observabilité + audit trail + ADR) puis livrer la **première brique de différenciation produit** (Découverte hors-proximité) sur des fondations propres.

## Bloc 1 — Clôture Horizon 1 (gouvernance)

### 1.1 Audit trail automatique sur `profiles`
Trigger SQL `audit_sensitive_profile_changes` qui écrit dans `admin_audit_logs` à chaque UPDATE touchant `is_premium`, `is_city_guide`, `shadow_banned`, `purchased_sessions`. Capture : ancien/nouveau, `admin_id = auth.uid()` (ou `service_role`), timestamp.

**Invariant protégé** : I5 (toute action à conséquence laisse une trace immuable).

### 1.2 Module d'observabilité centralisé
Création de `src/lib/observability.ts` :
- `track(event, payload)` → route vers `analytics_events`
- `report(error, context)` → route vers `errorReporter`
- `audit(action, target)` → route vers RPC dédiée (pas d'INSERT direct, RLS bloque)
- Sévérité unifiée : `info | warn | error | critical`
- Échantillonnage configurable pour `info` en production

Migration progressive : les nouveaux call-sites l'utilisent, les anciens restent fonctionnels.

### 1.3 ADR-001 : Stratégie polling Stripe
`docs/adr/ADR-001-stripe-polling.md` documentant :
- Contexte : pas de webhook Stripe
- Décision : polling client avec backoff exponentiel + RPC `confirm-session-purchase`
- Conséquences : fenêtre de désync ≤ 30s, simplicité opérationnelle, pas de secret webhook à gérer
- Trigger de réévaluation : > 1% de paiements en `pending` > 5min sur 7 jours

### 1.4 ADR-002 : Edge functions consolidées
`docs/adr/ADR-002-consolidated-edge-functions.md` : pourquoi `notifications` et `system` regroupent plusieurs actions (limite plateforme), comment router via `action`, comment éviter les fuites de métadonnées.

## Bloc 2 — Première brique Horizon 2 : page Découverte

### 2.1 Route `/discover` (déjà présente comme page mais à câbler proprement)
- Hook `useDiscoverUsers(filters)` consommant `discover_users` RPC
- Filtres : activité favorite, université, ville, badge vérifié
- Pagination cursor-based (pas d'offset → scalable)
- Empty state enrichi (CommunityStats + suggestion d'activer un signal)

### 2.2 Composant `UserDiscoveryCard`
Affiche : prénom, avatar, bio courte, badges de vérification (via `useBatchVerificationBadges`), activités favorites, université. CTA : "Envoyer un signal d'intérêt" (crée une `connection` en `pending`).

### 2.3 Respect des invariants
- Aucune donnée sensible exposée (RPC `discover_users` filtre déjà)
- Ghost mode respecté côté serveur
- Bloqués/bloqueurs exclus côté serveur
- Rate limit sur création de connexion (réutilise `useRateLimit`)

## Hors scope (laissé pour itérations suivantes)
- Group signals UX complète
- Onboarding interactif carte
- Hub campus / heatmap temporelle
- Webhook Stripe (cf. ADR-001, pas de déclencheur)

## Plan technique condensé

```text
supabase/migrations/
  └── <timestamp>_audit_sensitive_profile_changes.sql   (trigger + fn)

docs/adr/
  ├── ADR-001-stripe-polling.md
  └── ADR-002-consolidated-edge-functions.md

src/lib/
  └── observability.ts                                  (nouveau)

src/hooks/
  └── useDiscoverUsers.ts                               (nouveau)

src/components/discover/
  ├── UserDiscoveryCard.tsx                             (nouveau)
  ├── DiscoverFilters.tsx                               (nouveau)
  └── index.ts

src/pages/
  └── DiscoverPage.tsx                                  (refonte)
```

## Critères de "Done"
- [ ] Trigger d'audit testé : un UPDATE sur `is_premium` génère bien une ligne dans `admin_audit_logs`
- [ ] `observability.ts` utilisé par au moins un nouveau call-site (DiscoverPage)
- [ ] Les 2 ADR sont commités et lisibles
- [ ] `/discover` charge < 500ms p95, respecte ghost mode et blocages
- [ ] Empty / loading / error states présents
- [ ] i18n FR/EN/DE pour les nouveaux textes
- [ ] Pas de `as any` introduit

## Décision proposée
Exécuter ce bloc dans l'ordre : **1.1 → 1.2 → 1.3/1.4 (parallèle) → 2.1 → 2.2 → 2.3**.
À l'issue, la plateforme aura : audit trail complet, observabilité unifiée, décisions documentées, et une nouvelle surface produit livrée sur des fondations gouvernées.
