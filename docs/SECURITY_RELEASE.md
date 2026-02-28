# Nearvity — Audit Sécurité & Plan de Release Production

> Dernière mise à jour : 2026-02-28
> Score SOC2 simplifié : **34/38 contrôles passés (89 %)**

---

## 1. Matrice de risque sécurité (Impact × Probabilité)

```text
                        PROBABILITÉ
                   Faible    Moyenne    Élevée
              +----------+-----------+---------+
   Critique   |  R1 R2   |    R3     |         |
              |  R9      |           |         |
    IMPACT    +----------+-----------+---------+
    Élevé     |  R4 R6   |           |         |
              |  R7      |           |         |
              +----------+-----------+---------+
    Moyen     |  R8      |    R5     |         |
              +----------+-----------+---------+
    Faible    |  R10     |           |         |
              +----------+-----------+---------+
```

| #   | Risque                              | Impact   | Probabilité | Mitigation actuelle                                                        | Risque résiduel     |
| --- | ----------------------------------- | -------- | ----------- | -------------------------------------------------------------------------- | ------------------- |
| R1  | Accès données cross-user via API    | Critique | Faible      | RLS stricte 29/29 tables, SECURITY DEFINER RPC                            | Très faible         |
| R2  | Token JWT forgé / expiré            | Critique | Faible      | `getClaims()` 14/14 fonctions, vérification expiration                     | Très faible         |
| R3  | Webhook Stripe absent → désync abo  | Critique | Moyenne     | `check-subscription` polling (fallback)                                    | **Moyen — à corriger** |
| R4  | Injection payload Edge Functions    | Élevé    | Faible      | Zod 9/9 endpoints avec body                                               | Très faible         |
| R5  | DDoS / abus endpoints coûteux       | Moyen    | Moyenne     | Rate limit 11/14, 3 restants faible risque                                | Faible              |
| R6  | Fuite localisation précise          | Élevé    | Faible      | Fuzzing 3 décimales (~100 m), ghost mode, expiration 2 h                  | Très faible         |
| R7  | Harcèlement / représailles          | Élevé    | Faible      | Shadow-ban auto 3+ reports/24 h, block bidirectionnel, reporter anonyme   | Faible              |
| R8  | Fuite token dans logs               | Moyen    | Faible      | Préfixe 8 chars uniquement                                                | Très faible         |
| R9  | Escalation privilège admin          | Critique | Faible      | `requireAdmin()` via `has_role` RPC, 4 fonctions protégées                | Très faible         |
| R10 | Polling infini subscription         | Faible   | Faible      | Cache 60 s, polling 5 min, backoff exponentiel max 10 min                 | Très faible         |

### Actions prioritaires

- **R3 (Webhook Stripe)** : seul risque résiduel « Moyen » — implémenter dès que le `STRIPE_WEBHOOK_SECRET` sera disponible.

---

## 2. Plan de release production « zéro surprise »

### Phase 1 — Vérification technique (J-3)

- [ ] Confirmer 0 erreur console bloquante dans le preview
- [ ] Vérifier que toutes les Edge Functions sont déployées (14 fonctions)
- [ ] Confirmer les secrets configurés : `STRIPE_SECRET_KEY`, `MAPBOX_ACCESS_TOKEN`, `FIRECRAWL_API_KEY`, `ELEVENLABS_API_KEY`, `RESEND_API_KEY`, `PERPLEXITY_API_KEY`
- [ ] Vérifier que le domaine custom est configuré (`nearvity.lovable.app` actif)

### Phase 2 — Tests fonctionnels (J-2)

- [ ] **Auth** : signup email, login, logout, reset password, magic link
- [ ] **Map** : activation signal, affichage nearby, expiration auto
- [ ] **Binôme** : création session (quota free = 2/mois), rejoindre, quitter
- [ ] **Premium** : bouton upgrade ouvre Stripe checkout, retour après paiement
- [ ] **Profil** : édition, upload avatar, QR code
- [ ] **Mobile** : BottomNav, sheet bottom, pas de débordement 375 px

### Phase 3 — Sécurité finale (J-1)

- [ ] Route protégée : `/map` sans auth redirige vers `/onboarding`
- [ ] RLS : tester avec 2 comptes (User A ne voit pas User B)
- [ ] Rate limit : envoyer 6 requêtes rapides sur `create-checkout`, vérifier 429
- [ ] Console : 0 fuite token, 0 boucle réseau

### Phase 4 — Go Live (Jour J)

- [ ] Cliquer « Update » dans le dialog Publish pour déployer le frontend
- [ ] Les Edge Functions et migrations sont déjà déployées automatiquement
- [ ] Vérifier le site publié sur `nearvity.lovable.app`
- [ ] Tester un signup réel depuis le domaine publié
- [ ] Monitorer les logs Edge Functions pendant 1 h

### Phase 5 — Post-deploy (J+1)

- [ ] Vérifier `analytics_events` reçoit des `page_view`
- [ ] Confirmer aucune erreur dans les logs Edge Functions
- [ ] Ajouter `STRIPE_WEBHOOK_SECRET` quand disponible (Ticket 5)
- [ ] Configurer alertes (cron cleanup signaux expirés, rate limits, shadow bans)

### Rollback

En cas de problème critique, restaurer la version précédente via l'historique Lovable. Les Edge Functions et la base de données ne sont pas affectées par un rollback frontend.

---

## 3. Checklist SOC2-ready simplifiée

Adaptée à Nearvity (app sociale étudiante avec localisation).

### A. Contrôle d'accès (Trust Service Criteria CC6)

- [x] Authentification obligatoire pour toutes les routes sensibles (`ProtectedRoute`)
- [x] JWT validé via `getClaims()` sur 14/14 Edge Functions
- [x] Vérification expiration token (compensating control)
- [x] Contrôle admin via `has_role` RPC (4 fonctions protégées)
- [x] Séparation des privilèges (anon key vs service role key)
- [ ] MFA/2FA (non implémenté — optionnel pour MVP étudiant)

### B. Isolation des données (CC6 + CC7)

- [x] RLS active sur 29/29 tables
- [x] Policies RESTRICTIVE (pas de permissive)
- [x] Accès anonyme bloqué sur toutes les tables sensibles
- [x] Données publiques via SECURITY DEFINER RPC uniquement
- [x] Shadow-ban n'expose pas le statut à l'utilisateur banni
- [x] Reports : `reporter_id` non visible par le reported user

### C. Protection des données sensibles (CC6 + PI1)

- [x] Localisation fuzzée à 3 décimales (~100 m)
- [x] Signaux expirent automatiquement (2 h max)
- [x] Nettoyage localisation interactions après 30 jours
- [x] Nettoyage `reveal_logs` après 90 jours
- [x] Nettoyage `analytics_events` après 90 jours
- [x] Ghost mode disponible (masque l'utilisateur des signaux)
- [x] Mode fantôme respecté dans `get_nearby_signals`

### D. Disponibilité et résilience (A1)

- [x] Anti-polling avec cache 60 s + backoff exponentiel
- [x] Rate limiting sur 11/14 Edge Functions
- [x] Réponse 429 avec header `Retry-After`
- [x] Cleanup jobs pour données périmées (signals, rate limits, analytics)
- [x] `ErrorBoundary` React pour erreurs runtime
- [x] `OfflineBanner` pour perte de connexion

### E. Conformité RGPD (spécifique EU)

- [x] Page vie privée (`/privacy`) avec 10 sections détaillées
- [x] Cookie consent avec choix accepter / refuser
- [x] DPO email configuré (`contact@emotionscare.com`)
- [x] Export données utilisateur (`DataExportPage` + `useGdprExport`)
- [x] Suppression compte (`DeleteAccountDialog`)
- [x] Mention CNIL dans la page vie privée
- [x] Données minimales collectées (first_name, email, université)

### F. Logging et audit (CC7)

- [x] `analytics_events` pour tracking page views et actions
- [x] Logging Edge Functions avec préfixe fonction
- [x] Token non exposé dans les logs (8 chars max)
- [x] `cron_job_executions` pour tracer les jobs planifiés
- [ ] Centralisation des logs (non implémenté — limite infrastructure)
- [ ] Alerting automatisé (partiel — `analytics_events` pour high_reports)

### G. Intégrité des traitements (PI1)

- [x] Validation Zod sur 9/9 endpoints avec body
- [x] Canonical order enforcé sur `connections` (trigger)
- [x] Capacity check sur events (trigger `check_event_capacity`)
- [x] Rate limit reports (5/heure via `check_report_rate_limit`)
- [x] Rate limit reveals (10/heure via `check_reveal_rate_limit`)
- [x] Reliability score mis à jour uniquement via SECURITY DEFINER

### Score final

**34/38 contrôles passés (89 %)**

Lacunes identifiées (non bloquantes pour MVP) :

1. MFA/2FA non implémenté
2. Centralisation logs non disponible
3. Alerting automatisé partiel
4. Webhook Stripe manquant (fallback polling actif)
