# ADR-001 — Stratégie de réconciliation Stripe par polling

- **Statut** : Accepté
- **Date** : 2026-04-17
- **Décideurs** : Architecture
- **Plan associé** : `.lovable/plan.md` (Horizon 1, gouvernance)

## Contexte

Le domaine économique de NEARVITY (sessions binôme payantes, premium) repose
sur Stripe Checkout. Trois options se présentent pour confirmer un paiement
côté serveur :

1. **Webhook Stripe** — Stripe POST sur une edge function publique signée.
2. **Polling client** — le client interroge Stripe via une edge function
   `confirm-session-purchase` après le retour de Checkout.
3. **Hybride** — webhook comme source primaire + polling comme filet.

## Décision

Nous retenons **l'option 2 (polling client)**.

Le flux est :

```
Client → Checkout Stripe → Retour avec session_id
       → Edge function confirm-session-purchase (auth requise)
         ↳ Stripe.checkout.sessions.retrieve(session_id)
         ↳ Vérifie payment_status === 'paid'
         ↳ Vérifie metadata.user_id === auth.uid()
         ↳ RPC add_purchased_sessions(user_id, count)
       → UI met à jour le solde
```

Si le retour n'aboutit pas (utilisateur ferme l'onglet, latence Stripe),
un polling exponentiel (1s, 2s, 4s, 8s, 16s, 30s) tente la confirmation.

## Conséquences

### Positives
- **Zéro secret webhook** à stocker / faire tourner.
- **Pas de surface publique non authentifiée** exposée.
- **Idempotence simple** : la RPC `add_purchased_sessions` est sûre car
  l'edge function vérifie l'état Stripe avant d'incrémenter.
- **Trace d'audit** : depuis ADR + trigger `audit_sensitive_profile_changes`,
  chaque incrément de `purchased_sessions` laisse une ligne dans
  `admin_audit_logs`.
- **Architecture cohérente** avec le reste : tout passe par auth utilisateur.

### Négatives
- **Fenêtre de désynchronisation** : si l'utilisateur ferme avant le polling,
  le crédit n'apparaît qu'au prochain login. Atténué par un re-check au
  démarrage de l'app pour les sessions Stripe récentes (< 24h).
- **Pas de notification serveur** sur événements Stripe non-paiement
  (chargeback, refund). Acceptable au stade actuel : faible volume.

## Indicateurs de réévaluation

Repasser sur webhook si **un seul** des seuils est franchi sur 7 jours :

- > 1 % des paiements en `pending` > 5 min
- > 0,1 % de cas de double-incrément détectés (audit logs)
- Volume mensuel > 5 000 transactions
- Besoin de gérer chargebacks / refunds de manière déterministe

## Références

- Code : `supabase/functions/confirm-session-purchase/index.ts`
- Code : `supabase/functions/create-checkout/index.ts`
- Mémoire : `memory/security/payment-verification-logic`
- Mémoire : `memory/security/compliance-standards`
