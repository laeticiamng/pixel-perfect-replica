

## Plan d'implementation — 8 Tickets Marketing & Commercial

### Ticket 1 — SocialProofBar optimisee (P0, ~3h)

**Probleme** : Le composant affiche des chiffres hardcodes (500+, 1 200+, 15+). La memory note dit "aucune statistique factice ou hardcodee n'est autorisee". Le backend a deja `get_community_stats()` qui retourne `active_users_now`, `sessions_this_month`, `completed_sessions`.

**Plan** :
- Modifier `SocialProofBar.tsx` pour appeler `get_community_stats()` via RPC
- Afficher les vrais chiffres avec fallback sur les valeurs actuelles si la requete echoue (visiteur non-auth)
- Ajouter compteur anime au scroll (useInView + animation de 0 a la valeur)
- Tracker `social_proof_view` dans analytics

**Fichiers** : `SocialProofBar.tsx`

---

### Ticket 2 — Section Pricing publique sur Landing (P0, ~5h)

**Plan** :
- Creer `PricingPreviewSection.tsx` : mini-tableau comparatif Free (0EUR, 2 sessions/mois) vs Nearvity+ (9,90EUR/mois, illimite) vs Session Unit (0,99EUR)
- CTA principal vers `/premium`, CTA secondaire vers `/onboarding`
- Ajouter dans `LandingPage.tsx` entre `UseCasesSection` et `GuaranteeSection`
- Exporter dans `landing/index.ts`
- Traductions i18n FR/EN completes

**Fichiers** : `PricingPreviewSection.tsx` (nouveau), `LandingPage.tsx`, `landing/index.ts`, `translations.ts`

---

### Ticket 3 — Temoignages utilisateurs (P1, ~4h)

**Plan** :
- Creer `TestimonialsSection.tsx` : charger les temoignages approuves depuis `user_testimonials` (RLS permet deja SELECT `is_approved = true`)
- Carousel horizontal avec avatar anonymise (initiales), quote, activite
- Fallback : si aucun temoignage approuve, section cachee
- Traductions i18n pour les labels

**Fichiers** : `TestimonialsSection.tsx` (nouveau), `LandingPage.tsx`, `landing/index.ts`, `translations.ts`

---

### Ticket 4 — Tracking UTM + Attribution (P1, ~4h)

**Plan** :
- Creer `useUTM.ts` : capturer `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` depuis l'URL au mount
- Persister en `sessionStorage`
- Injecter les UTM dans `useAnalytics.ts` `page_view` event_data automatiquement
- Envoyer les UTM lors du signup event

**Fichiers** : `useUTM.ts` (nouveau), `useAnalytics.ts`, `translations.ts` (aucune trad necessaire)

---

### Ticket 5 — Nudge Premium contextuel (P1, ~4h)

**Plan** :
- Le composant `SessionQuotaBadge` existe deja et gere l'affichage quota
- Ajouter un composant `PremiumNudge.tsx` : banner non-intrusif quand `freeRemaining <= 0`
- Afficher dans `BinomePage.tsx` (page sessions) quand quota atteint
- CTA vers `/premium`, bouton dismiss (persiste en sessionStorage pour ne pas re-afficher)

**Fichiers** : `PremiumNudge.tsx` (nouveau), `BinomePage.tsx`

---

### Ticket 6 — JSON-LD Product + Pricing enrichi (P1, ~2h)

**Plan** :
- Ajouter un bloc `<script type="application/ld+json">` Product/SoftwareApplication dans `index.html`
- Inclure `offers` avec les 3 tiers de pricing (Free, Session Unit, Nearvity+)
- Valider via Rich Results Test schema

**Fichiers** : `index.html`

---

### Ticket 7 — Systeme de Parrainage MVP (P2, ~10h)

**Plan** :
- Migration DB : table `referrals` (id, referrer_id, referred_id, code, status, rewarded, created_at) avec RLS
- Ajouter `referral_code` a `profiles` (genere au signup via trigger)
- Edge function `apply-referral` : valider le code, attribuer +1 session bonus au parrain
- UI : bouton "Inviter des amis" sur ProfilePage avec lien `https://nearvity.fr/?ref=CODE`
- `useReferral.ts` hook pour gerer le code

**Fichiers** : migration SQL, `apply-referral/index.ts` (nouveau), `useReferral.ts` (nouveau), `ProfilePage.tsx`, `OnboardingPage.tsx`, `translations.ts`

---

### Ticket 8 — Re-engagement automatise (P2, ~8h)

**Plan** :
- Modifier l'Edge Function `notifications/index.ts` pour ajouter un job `send-reengagement`
- Query : utilisateurs avec derniere activite > 3 jours (via `analytics_events` ou `active_signals`)
- Envoyer push notification via `push_subscriptions` (pas d'email pour MVP)
- Respecter opt-out (`push_notifications = false` dans `user_settings`)
- Max 1 notification par cycle de 7 jours (tracking via `analytics_events`)
- Cron schedule : 1x/jour

**Fichiers** : `notifications/index.ts`, cron SQL

---

### Ordre d'implementation recommande

**Sprint 1 (Conversion)** : Tickets 1 → 2 → 6 → 5
**Sprint 2 (Croissance)** : Tickets 4 → 3
**Sprint 3 (Viral)** : Tickets 7 → 8

