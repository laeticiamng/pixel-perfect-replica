

## Plan : 8 Tickets Securite - Sprint "Prod Safe" + "Hardening"

Ce plan couvre les 8 tickets de securite identifies, organises en 2 sprints logiques.

---

### Sprint 1 : Prod Safe (P0 - Tickets 1, 2, 3, 4) ✅ DONE

#### Ticket 1 : RLS Hardening table `connections` ✅
- UNIQUE constraint sur (user_a, user_b)
- Index composite pour performance
- Trigger canonical order (user_a < user_b)

#### Ticket 2 : Auth centralisee `_shared/auth.ts` ✅
- Helper `authenticateRequest()` centralise dans `supabase/functions/_shared/auth.ts`
- 12 Edge Functions refactorees pour utiliser le helper
- Reponses 401/403 uniformes

#### Ticket 3 : Compensating controls pour `verify_jwt=false` ✅
- Verification presence claims obligatoires (sub, exp)
- Verification expiration token (exp vs Date.now())
- Logs securises (prefix 8 chars du token uniquement)
- Integre dans `_shared/auth.ts`

#### Ticket 4 : Rate limiting endpoints sensibles ✅
- Helper generique `_shared/ratelimit.ts` (in-memory)
- Rate limits ajoutes sur: customer-portal (5/min), confirm-session-purchase (5/min), firecrawl-map (10/min), firecrawl-scrape (10/min), scrape-events (5/min), recommend-locations (10/min)
- Rate limits existants standardises: create-checkout, purchase-session, ai-assistant, voice-icebreaker
- Reponse 429 avec header Retry-After

---

### Sprint 2 : Hardening + DX (P1-P2 - Tickets 5, 6, 7, 8) — TODO

#### Ticket 5 : Validation Zod dans Edge Functions
#### Ticket 6 : Stripe Webhook source of truth
#### Ticket 7 : Anti-polling check-subscription
#### Ticket 8 : Nettoyage forwardRef warnings

### Notes
- `notifications` et `system` conservent leur validateAuth interne (deja robuste, pattern similaire)
- Sprint 2 a implementer dans une prochaine session
