# NEARVITY — Cadrage stratégique : architecture systémique & gouvernance

> Document de référence pour piloter la maturité de la plateforme.
> Lentille : *complex systems architecture* + *platform governance*.

---

## 1. Diagnostic systémique

NEARVITY est aujourd'hui un **système socio-technique multi-domaines** qui mélange :

- **Domaine temps-réel géospatial** (signaux, radar, group signals, événements)
- **Domaine relationnel asynchrone** (connexions, conversations, binôme, feedback)
- **Domaine économique** (Stripe, sessions payantes, premium, referral)
- **Domaine confiance & sécurité** (RLS, shadow ban, reports, reliability score, vérifications)
- **Domaine expérientiel** (Experience Orchestrator, immersion 3D, ambient, haptique)
- **Domaine institutionnel** (admin dashboard, président cockpit, alertes, cron)

Chaque domaine a sa propre cadence, son propre cycle de vie, ses propres invariants. **Le risque n°1** d'une plateforme à ce stade n'est plus la feature manquante — c'est la **dérive d'invariants** (un domaine qui casse silencieusement les garanties d'un autre).

### Symptômes observés
- `(supabase as any)` dans `useConnections` → couplage faible aux types DB
- `signalStore` mock encore présent → dette de migration non purgée
- `has_role` peut être probé sur n'importe quel UID → fuite d'information de gouvernance
- Edge functions consolidées en `notifications` / `system` → nécessaire mais opacifie le routage
- Pas de couche d'observabilité unifiée (logs dispersés entre `errorReporter`, `cron_job_executions`, `analytics_events`, `alert_logs`)

---

## 2. Cadre d'architecture cible : les 4 plans

Pour gouverner la complexité, on sépare explicitement **4 plans** qui aujourd'hui se chevauchent :

### Plan 1 — *Domain Core* (invariants métier)
- Tables, RPC `SECURITY DEFINER`, RLS, triggers, contraintes
- **Règle d'or** : aucune logique métier sensible ne vit hors de la base. Le client ne fait que *projeter*.
- À renforcer : retirer tout `as any`, générer des types stricts pour `connections`, `group_signals`, `discover_users`.

### Plan 2 — *Application Shell* (orchestration React)
- Hooks de domaine (`useActiveSignal`, `useBinomeSessions`, `useConnections`)
- Stores Zustand limités à l'**état UI éphémère** (pas de cache de données métier)
- **Règle d'or** : un hook = un agrégat. Pas de hook qui cross-domaine sans passer par une RPC.

### Plan 3 — *Experience Layer* (orchestrator immersif)
- `ExperienceProvider`, `capability-store`, `scene-runtime-store`
- **Règle d'or** : aucun side-effect métier déclenché par une scène. L'expérience *réagit* aux événements du domaine, jamais l'inverse.

### Plan 4 — *Governance & Observability*
- RLS, audit logs, rate limits, alertes admin, cron monitoring
- **Règle d'or** : tout événement à conséquence (bannissement, paiement, suppression) doit laisser une trace immuable dans `admin_audit_logs`.

---

## 3. Gouvernance : les 7 invariants à protéger

| # | Invariant | Mécanisme actuel | Risque résiduel |
|---|-----------|-----------------|-----------------|
| I1 | Un utilisateur ne peut pas s'auto-promouvoir premium / city_guide / unban | `WITH CHECK` sur `profiles` | ✅ Couvert |
| I2 | Un utilisateur ne peut pas modifier sa propre `reliability_score` | RLS `USING(false)` + RPC | ✅ Couvert |
| I3 | Le secret QR d'un événement n'est jamais exposé au participant | RPC `get_event_for_participant_secure` | ✅ Couvert |
| I4 | Les rôles ne peuvent être interrogés que pour soi-même | `has_role(_user_id, _role)` accepte n'importe quel UID | ⚠️ **À corriger** |
| I5 | Toute action admin est tracée | `admin_audit_logs` (INSERT bloqué côté client) | ⚠️ Dépend du déclenchement par triggers/RPC, à auditer |
| I6 | Aucun signal ne survit à son `expires_at` | `cleanup_expired_signals` (cron) | ✅ Couvert |
| I7 | Les paiements Stripe sont idempotents et réconciliables | Polling client + `confirm-session-purchase` | ⚠️ Pas de webhook → fenêtre de désync possible |

---

## 4. Roadmap de maturité (3 horizons)

### Horizon 1 — *Hardening* (1–2 sprints) — **stabiliser les fondations**
Objectif : zéro dette critique sur les 4 plans.

1. **[Gouvernance]** Restreindre `has_role` à `_user_id = auth.uid()` OU exiger `admin` pour interroger un autre UID. Migration SQL + audit des appels.
2. **[Domain Core]** Régénérer les types Supabase, supprimer `(supabase as any)` dans `useConnections`, `useGroupSignals`, etc.
3. **[Application Shell]** Supprimer `signalStore` (mock) — `useMapPageLogic` est déjà la source de vérité.
4. **[Observability]** Centraliser les logs : un module `lib/observability.ts` qui route vers `errorReporter` + `analytics_events` selon la sévérité.
5. **[Governance]** Ajouter un trigger d'audit sur les UPDATE sensibles de `profiles` (premium, shadow_ban) → `admin_audit_logs`.

### Horizon 2 — *Differentiation* (2–4 sprints) — **livrer l'unicité produit**
Reprend les priorités 1–2 du plan produit existant, mais en respectant les 4 plans.

6. **Découverte hors-proximité** (`discover_users` RPC existe déjà) → page `/discover` consommant la RPC, badge de vérification visible, filtre par activité/université.
7. **Group signals** UX complète : déjà en DB (`group_signals`, `group_signal_members`, `group_signal_messages`) mais sous-exploitée dans l'UI carte → marqueur dédié, popup, chat de groupe.
8. **Onboarding interactif carte** : tooltips séquentiels (radar vs map, activation signal, icebreakers) déclenchés via `Experience Orchestrator` (scène `onboarding`).
9. **Empty states enrichis** : intégrer `CommunityStats` + sessions binôme programmées + countdown.
10. **Badges de vérification visibles** sur `UserPopupCard` et marqueurs (RPC publique déjà compatible).

### Horizon 3 — *Scale & Trust* (continu) — **devenir une institution**
11. **Hub campus** : table `campus_feed` + RLS par université, dashboard admin par institution.
12. **Heatmap temporelle** : agrégat matérialisé `campus_activity_heatmap` (mardi 12h, etc.) rafraîchi par cron.
13. **Notes vocales** dans le chat (Storage bucket `voice-notes` + RLS par interaction).
14. **Webhook Stripe** pour réconciliation déterministe (remplace le polling comme source primaire).
15. **Offline-first** : Service Worker avec cache des conversations + queue d'actions.
16. **Tests E2E critiques** : Playwright sur le parcours signup → signal → match → chat.

---

## 5. Principes de gouvernance opérationnelle

### a. *Change Management*
- Toute migration touchant RLS / `SECURITY DEFINER` passe par revue : (1) invariant protégé, (2) policy avant/après, (3) test d'attaque.
- Toute nouvelle edge function déclare : auth requise, rate limit, schéma Zod, secrets utilisés.

### b. *Architectural Decision Records (ADR)*
Créer `docs/adr/` avec un fichier par décision structurante :
- ADR-001 : Polling Stripe vs Webhook (statu quo justifié)
- ADR-002 : Edge functions consolidées (`notifications`, `system`)
- ADR-003 : Experience Orchestrator séparé du domaine
- ADR-004 : Roles dans table dédiée (jamais sur `profiles`)

### c. *Definition of Done élargie*
Pour toute feature :
- [ ] Invariants identifiés et protégés (RLS / triggers / RPC)
- [ ] Hook isolé, pas de cross-domaine implicite
- [ ] Événements d'expérience émis (si pertinent)
- [ ] Trace d'audit (si action sensible)
- [ ] Empty / loading / error states
- [ ] i18n EN/FR/DE
- [ ] Test unitaire ou E2E

### d. *Métriques de santé systémique*
À exposer dans `AdminDashboardPage` :
- Taux d'erreur edge functions / 24h
- Signaux expirés non nettoyés (devrait être 0)
- Écarts polling Stripe (paiements en `pending` > 5min)
- Tentatives d'écriture RLS refusées / 24h (signal d'attaque)
- Latence p95 des RPC critiques (`discover_users`, `get_available_sessions`)

---

## 6. Décision de cadrage

**Recommandation** : exécuter **Horizon 1 en priorité absolue** avant toute nouvelle feature.
La plateforme a atteint une masse critique de domaines où une seule régression silencieuse (ex: `has_role` probable) peut compromettre la confiance — qui est *le* produit.

**Prochaine action concrète proposée** : commencer par I4 (corriger `has_role`) + purger `signalStore` + générer un ADR-001 documentant la stratégie polling Stripe.
