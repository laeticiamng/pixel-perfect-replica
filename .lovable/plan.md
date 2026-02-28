

## Plan : Tickets restants (5 + 8)

### Ticket 5 : Stripe Webhook securise

**Statut** : Bloque sur le secret `STRIPE_WEBHOOK_SECRET`

**Prerequis utilisateur** :
1. Aller dans le Dashboard Stripe > Developers > Webhooks
2. Creer un webhook pointant vers : `https://afvssugntxjolqqeyffn.supabase.co/functions/v1/stripe-webhook`
3. Selectionner les events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copier le "Signing secret" (commence par `whsec_...`)
5. Ajouter ce secret dans Lovable Cloud

**Implementation** :
- Creer `supabase/functions/stripe-webhook/index.ts`
- Verifier signature Stripe via `stripe.webhooks.constructEvent(body, sig, secret)`
- Gerer les events :
  - `checkout.session.completed` : marquer `profiles.is_premium = true`
  - `customer.subscription.deleted` : marquer `profiles.is_premium = false`
  - `customer.subscription.updated` : mettre a jour selon status
  - `invoice.payment_failed` : log evenement
- Pas de JWT requis (webhook public, signature = auth)
- `verify_jwt = false` dans config.toml (deja le cas pour toutes les functions)

**Fichiers** :
- Nouveau : `supabase/functions/stripe-webhook/index.ts`

---

### Ticket 8 : Audit final securite + Smoke Test

**Implementation** :
- Mettre a jour `.lovable/plan.md` avec le statut final de tous les tickets
- Verifier que toutes les Edge Functions utilisent bien :
  - `authenticateRequest()` (sauf webhook et endpoints publics)
  - `checkRateLimit()` sur endpoints sensibles
  - `validateBody()` avec schema Zod
- Lister les verifications manuelles a effectuer (checklist)

**Checklist E2E a valider manuellement** :

Auth :
- `/map` non connecte redirige vers login
- Signup / login / logout fonctionnels
- Reset password fonctionne
- 0 erreur 401 inattendue

Stripe :
- Bouton upgrade ouvre checkout
- `check-subscription` retourne donnees coherentes
- Pas de boucle reseau sur `/premium`

Sessions binome :
- Creation session respecte quota
- RLS protege les donnees

Console :
- 0 erreur bloquante
- 0 boucle reseau
- 0 fuite token dans les logs

**Fichiers** :
- Mise a jour : `.lovable/plan.md` (statut final)

---

### Ordre

1. Demander a l'utilisateur de configurer le webhook Stripe + fournir le secret
2. Implementer `stripe-webhook/index.ts`
3. Mettre a jour le plan avec statut final
4. Recommander les tests manuels E2E

### Note importante

Le Ticket 5 ne peut pas avancer tant que le `STRIPE_WEBHOOK_SECRET` n'est pas configure. Si vous preferez, on peut finaliser le Ticket 8 (audit + plan) maintenant et revenir au webhook quand le secret sera pret.

