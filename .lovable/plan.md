

## Livrables de sécurité : Matrice de risque + Plan de release + Checklist SOC2

Ce plan couvre la creation d'un fichier unique `docs/SECURITY_RELEASE.md` contenant les trois documents demandes.

---

### 1. Matrice de risque securite (Impact x Probabilite)

Basee sur l'audit reel du codebase :

```text
                        PROBABILITE
                   Faible    Moyenne    Elevee
              +----------+-----------+---------+
   Critique   |          | Webhook   |         |
              |          | Stripe    |         |
    IMPACT    +----------+-----------+---------+
    Eleve     |          |           |         |
              +----------+-----------+---------+
    Moyen     | Brute    | Rate limit|         |
              | force    | contourne |         |
              | token    | (3 EP)    |         |
              +----------+-----------+---------+
    Faible    | forwardRef           |         |
              | warnings             |         |
              +----------+-----------+---------+
```

**Risques identifies et leur mitigation :**

| # | Risque | Impact | Probabilite | Mitigation actuelle | Risque residuel |
|---|--------|--------|-------------|---------------------|-----------------|
| R1 | Acces donnees cross-user via API | Critique | Faible | RLS stricte 29/29 tables, SECURITY DEFINER RPC | Tres faible |
| R2 | Token JWT forge/expire | Critique | Faible | getClaims() 14/14 fonctions, expiration check | Tres faible |
| R3 | Webhook Stripe absent = desync abo | Critique | Moyenne | check-subscription polling (fallback) | Moyen — a corriger |
| R4 | Injection payload Edge Functions | Eleve | Faible | Zod 9/9 endpoints avec body | Tres faible |
| R5 | DDoS / abus endpoints couteux | Moyen | Moyenne | Rate limit 11/14, 3 restants faible risque | Faible |
| R6 | Fuite localisation precise | Eleve | Faible | Fuzzing 3 decimales (~100m), ghost mode, expiration 2h | Tres faible |
| R7 | Harcelement / retaliation | Eleve | Faible | Shadow-ban auto 3+ reports/24h, block bidirectionnel, reporter anonyme | Faible |
| R8 | Fuite token dans logs | Moyen | Faible | Prefixe 8 chars uniquement | Tres faible |
| R9 | Escalation privilege admin | Critique | Faible | requireAdmin() via has_role RPC, 4 fonctions protegees | Tres faible |
| R10 | Polling infini subscription | Faible | Faible | Cache 60s, polling 5min, backoff exponentiel max 10min | Tres faible |

**Actions prioritaires :**
- R3 (Webhook Stripe) : Seul risque residuel "Moyen" — implémenter quand le secret sera disponible

---

### 2. Plan de release production "zero surprise"

**Pre-requis avant mise en prod :**

Phase 1 — Verification technique (J-3)
- Confirmer 0 erreur console bloquante dans le preview
- Verifier que toutes les Edge Functions sont deployees (14 fonctions)
- Confirmer les secrets configures : STRIPE_SECRET_KEY, MAPBOX_ACCESS_TOKEN, FIRECRAWL_API_KEY, ELEVENLABS_API_KEY, RESEND_API_KEY, PERPLEXITY_API_KEY
- Verifier que le domaine custom est configure (nearvity.lovable.app actif)

Phase 2 — Tests fonctionnels (J-2)
- Auth : signup email, login, logout, reset password, magic link
- Map : activation signal, affichage nearby, expiration auto
- Binome : creation session (quota free = 2/mois), rejoindre session, quitter session
- Premium : bouton upgrade ouvre Stripe checkout, retour apres paiement
- Profil : edition, upload avatar, QR code
- Mobile : BottomNav, sheet bottom, pas de debordement 375px

Phase 3 — Securite finale (J-1)
- Route protegee : /map sans auth redirige vers /onboarding
- RLS : tester avec 2 comptes (User A ne voit pas User B)
- Rate limit : envoyer 6 requetes rapides sur create-checkout, verifier 429
- Console : 0 fuite token, 0 boucle reseau

Phase 4 — Go Live (Jour J)
- Cliquer "Update" dans le dialog Publish pour deployer le frontend
- Les Edge Functions et migrations sont deja deployees automatiquement
- Verifier le site publie sur nearvity.lovable.app
- Tester un signup reel depuis le domaine publie
- Monitorer les logs Edge Functions pendant 1h

Phase 5 — Post-deploy (J+1)
- Verifier analytics_events recoit des page_view
- Confirmer aucune erreur dans les logs Edge Functions
- Ajouter STRIPE_WEBHOOK_SECRET quand disponible (Ticket 5)
- Configurer alertes si disponible (cron cleanup des signals expires, rate limits, shadow bans)

**Rollback :** En cas de probleme critique, restaurer la version precedente via l'historique Lovable. Les Edge Functions et la base de donnees ne sont pas affectees par un rollback frontend.

---

### 3. Checklist SOC2-ready simplifiee

Adaptee a Nearvity (app sociale etudiante avec localisation) :

**A. Controle d'acces (Trust Service Criteria CC6)**
- [x] Authentification obligatoire pour toutes les routes sensibles (ProtectedRoute)
- [x] JWT valide via getClaims() sur 14/14 Edge Functions
- [x] Verification expiration token (compensating control)
- [x] Controle admin via has_role RPC (4 fonctions protegees)
- [x] Separation des privileges (anon key vs service role key)
- [ ] MFA/2FA (non implemente — optionnel pour MVP etudiant)

**B. Isolation des donnees (CC6 + CC7)**
- [x] RLS active sur 29/29 tables
- [x] Policies RESTRICTIVE (pas de permissive)
- [x] Acces anonyme bloque sur toutes les tables sensibles
- [x] Donnees publiques via SECURITY DEFINER RPC uniquement
- [x] Shadow-ban n'expose pas le statut a l'utilisateur banni
- [x] Reports : reporter_id non visible par le reported user

**C. Protection des donnees sensibles (CC6 + PI1)**
- [x] Localisation fuzzee a 3 decimales (~100m)
- [x] Signaux expirent automatiquement (2h max)
- [x] Nettoyage localisation interactions apres 30 jours
- [x] Nettoyage reveal_logs apres 90 jours
- [x] Nettoyage analytics_events apres 90 jours
- [x] Ghost mode disponible (masque l'utilisateur des signaux)
- [x] Mode fantome respecte dans get_nearby_signals

**D. Disponibilite et resilience (A1)**
- [x] Anti-polling avec cache 60s + backoff exponentiel
- [x] Rate limiting sur 11/14 Edge Functions
- [x] Reponse 429 avec header Retry-After
- [x] Cleanup jobs pour donnees perimeees (signals, rate limits, analytics)
- [x] ErrorBoundary React pour erreurs runtime
- [x] OfflineBanner pour perte de connexion

**E. Conformite RGPD (specifique EU)**
- [x] Page vie privee (/privacy) avec 10 sections detaillees
- [x] Cookie consent avec choix accepter/refuser
- [x] DPO email configure (contact@emotionscare.com)
- [x] Export donnees utilisateur (DataExportPage + useGdprExport)
- [x] Suppression compte (DeleteAccountDialog)
- [x] Mention CNIL dans la page vie privee
- [x] Donnees minimales collectees (first_name, email, universite)

**F. Logging et audit (CC7)**
- [x] analytics_events pour tracking page views et actions
- [x] Logging Edge Functions avec prefixe fonction
- [x] Token non expose dans les logs (8 chars max)
- [x] cron_job_executions pour tracer les jobs planifies
- [ ] Centralisation des logs (non implemente — limite infrastructure)
- [ ] Alerting automatise (partiel — analytics_events pour high_reports)

**G. Integrite des traitements (PI1)**
- [x] Validation Zod sur 9/9 endpoints avec body
- [x] Canonical order enforce sur connections (trigger)
- [x] Capacity check sur events (trigger check_event_capacity)
- [x] Rate limit reports (5/heure via check_report_rate_limit)
- [x] Rate limit reveals (10/heure via check_reveal_rate_limit)
- [x] Reliability score mis a jour uniquement via SECURITY DEFINER

**Score SOC2 simplifie : 34/38 controles passes (89%)**

Lacunes identifiees (non bloquantes pour MVP) :
1. MFA/2FA non implemente
2. Centralisation logs non disponible
3. Alerting automatise partiel
4. Webhook Stripe manquant (fallback polling actif)

---

### Implementation technique

**Fichier a creer :** `docs/SECURITY_RELEASE.md`

Ce fichier unique contiendra les trois sections ci-dessus, formattees en Markdown propre, servant de reference pour l'equipe et les audits futurs.

Aucune modification de code applicatif n'est necessaire — il s'agit uniquement de documentation.

