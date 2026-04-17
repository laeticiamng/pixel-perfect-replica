# ADR-003 — Stratégie de rate limiting multi-couches

**Statut** : Accepté · 2026-04-17
**Auteurs** : Plateforme NEARVITY
**Liens** : ADR-001 (Stripe polling), ADR-002 (Edge functions consolidées)

## Contexte

NEARVITY combine des écritures fréquentes (signaux, messages, connexions) et
des appels coûteux (IA, scraping, recherche). Sans contrôle de débit
discipliné, un seul utilisateur abusif peut :

- inonder la base de signaux ou de messages,
- épuiser le quota Lovable AI Gateway,
- déclencher des cascades de notifications push,
- masquer l'activité légitime dans les dashboards.

Trois couches existent déjà mais sans doctrine unifiée :

1. **Client** (hooks `useRateLimit`, `useSignalRateLimit`, `useRevealRateLimit`) — limite l'UX et évite les double-clics.
2. **Edge** (`supabase/functions/_shared/ratelimit.ts`) — protège chaque fonction par clé `function:userId`, fenêtre glissante en mémoire.
3. **Base** (`signal_rate_limits`, `rate_limit_logs`, `edge_function_rate_limits` + RPCs `check_*_rate_limit`) — source de vérité partagée et auditable.

## Décision

**1. Trois couches, trois rôles distincts.**

| Couche | Rôle | Confiance | Persistance |
|--------|------|-----------|-------------|
| Client | UX, debounce, feedback immédiat | Aucune (contournable) | Aucune |
| Edge   | Burst protection, quota IA | Faible (in-memory, non partagé) | Volatile, par instance |
| DB     | Source de vérité, audit, anti-abus | Forte (RLS + RPC) | Persistante |

> Un contrôle qui n'existe que côté client n'existe pas. Tout endpoint
> sensible doit avoir au minimum une couche **DB ou edge**.

**2. Seuils par domaine** (canon, à respecter dans tous les endpoints) :

| Domaine | Seuil | Fenêtre | Couche prioritaire |
|---------|-------|---------|--------------------|
| Création de signal | 5 / 10 min | glissante | DB (`check_signal_rate_limit`) |
| Reveal d'identité | 10 / heure (strict 30/jour) | glissante + cumulative | DB (`check_reveal_rate_limit_strict`) |
| Création de connexion | 20 / heure | glissante | Edge + DB |
| Envoi message | 30 / minute | glissante | Edge |
| Assistant IA | 20 / minute | glissante | Edge (in-memory) |
| Voice icebreaker | 5 / minute | glissante | Edge |
| Scraping (Firecrawl) | 10 / heure | glissante | Edge + admin-only |
| Reports utilisateur | 5 / jour | journalière | DB (`check_report_rate_limit`) |
| Contact form | 3 / heure | glissante | Edge (anonyme, par IP/email) |

**3. Réponse normalisée** : `429 Too Many Requests` + header `Retry-After` (secondes) + corps `{ error, retry_after }`. Le client surface un toast neutre et bloque la prochaine action jusqu'à expiration.

**4. Burst-tolerant, sustained-strict** : on accepte une rafale courte mais on refuse le marathon. Concrètement, fenêtre glissante 1-10 min pour la plupart des cas, fenêtre journalière pour les actions à conséquence (reveal, report).

**5. Observabilité** : toute violation `429` produit un événement `track('rate_limit.exceeded', ...)` côté client et un log structuré côté edge. Trois violations en 24h sur un même utilisateur → alerte admin (cf. `useAdminAlerts`).

## Conséquences

**Positif**
- Un attaquant doit franchir 3 couches indépendantes pour exfiltrer ou spammer.
- Les seuils sont documentés et révisables sans relire le code.
- L'in-memory edge accepte les pertes au redémarrage : c'est un *speed bump*, pas une vérité — la DB protège le long terme.

**Négatif accepté**
- L'edge in-memory n'est pas partagé entre instances : un utilisateur peut momentanément doubler son quota si load-balancé sur deux pods. Mitigation : les domaines critiques (reveal, signal) tapent toujours la DB.
- Pas de rate limiting global IP-based pour l'instant : à reconsidérer si bots OAuth / contact form deviennent un problème.

## Trigger de réévaluation

- Plus de 1 % des requêtes `429` sur 7 jours glissants → revoir les seuils.
- Apparition d'un attaquant distribué (>10 IPs simultanées) → ajouter un layer Cloudflare / WAF.
- Coût Lovable AI > seuil prévu → durcir le quota assistant IA.

## Hors scope

- Quota par cohorte / par université (peut s'envisager dans le mode institutionnel).
- Rate limiting basé sur la réputation (`user_reliability.reliability_score`) — séduisant mais introduit un couplage produit/sécurité non souhaité aujourd'hui.
