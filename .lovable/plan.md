

# Audit Complet NEARVITY - Rapport et Plan de Corrections

## Resultats de l'Audit

### 1. CRITIQUE - Fonctions Edge utilisant `getUser()` au lieu de `getClaims()`

6 fonctions backend utilisent encore `getUser()` pour l'authentification, ce qui provoque des erreurs **401 Invalid JWT** avec Lovable Cloud. Seules 3 fonctions sont correctement migrées (`check-subscription`, `create-checkout`, `get-mapbox-token`).

**Fonctions en erreur :**

| Fonction | Methode actuelle | Impact |
|---|---|---|
| `customer-portal` | `getUser(token)` | Gestion abonnement cassee |
| `purchase-session` | `getUser(token)` | Achat de sessions casse |
| `confirm-session-purchase` | `getUser(token)` | Confirmation achat cassee |
| `notifications` | `getUser()` (via `validateAuth`) | Alertes admin, push, rappels casses |
| `system` | `getUser()` (via `validateAuth`) | Dashboard admin, cleanup casses |
| `ai-assistant` | `getUser()` | Icebreakers IA casses |
| `voice-icebreaker` | `getUser()` | Generation vocale cassee |
| `scrape-events` | `getUser()` | Scraping evenements casse |
| `recommend-locations` | `getUser()` | Recommandations cassees |

### 2. MINEUR - Branding residuel "Signal" dans les emails

Dans `notifications/index.ts` (ligne 245) : `"Cet email a ete envoye automatiquement par Signal."` doit etre remplace par `"Cet email a ete envoye automatiquement par NEARVITY."`.

### 3. MINEUR - Ancien prix ID pour sessions unitaires

Le fichier `purchase-session/index.ts` utilise `price_1SvGdqDFa5Y9NR1IrL2P71Ms` (ancien produit "EASY+ Session Unit"). Ce prix est fonctionnel mais porte l'ancien branding dans Stripe.

---

## Plan de Corrections

### Etape 1 - Migrer `customer-portal` vers `getClaims()`
- Remplacer `getUser(token)` par `getClaims(token)`
- Extraire `userId` et `email` depuis `claimsData.claims`
- Ajouter la validation du header Bearer

### Etape 2 - Migrer `purchase-session` vers `getClaims()`
- Meme pattern que customer-portal
- Utiliser `SUPABASE_ANON_KEY` avec `getClaims()` au lieu de `getUser()`

### Etape 3 - Migrer `confirm-session-purchase` vers `getClaims()`
- Remplacer `getUser(token)` par `getClaims(token)` avec le service role client
- Extraire le `userId` depuis les claims

### Etape 4 - Migrer `notifications` (validateAuth) vers `getClaims()`
- Remplacer la fonction `validateAuth` pour utiliser `getClaims(token)` au lieu de `getUser()`
- Corriger le branding "Signal" en "NEARVITY" dans le footer email (ligne 245)

### Etape 5 - Migrer `system` (validateAuth) vers `getClaims()`
- Meme correction que notifications dans la fonction `validateAuth`

### Etape 6 - Migrer `ai-assistant` vers `getClaims()`
- Remplacer `getUser()` par `getClaims(token)` pour l'extraction du userId

### Etape 7 - Migrer `voice-icebreaker` vers `getClaims()`
- Meme pattern de migration

### Etape 8 - Migrer `scrape-events` vers `getClaims()`
- Remplacer `getUser()` par `getClaims(token)`

### Etape 9 - Migrer `recommend-locations` vers `getClaims()`
- Remplacer `getUser()` par `getClaims(token)`

---

## Details Techniques

Chaque migration suit le meme pattern :

```text
AVANT:
  const { data: userData, error } = await supabase.auth.getUser(token);
  const user = userData.user;

APRES:
  const { data: claimsData, error } = await supabase.auth.getClaims(token);
  const userId = claimsData.claims.sub;
  const userEmail = claimsData.claims.email;
```

**9 fichiers modifies, 0 migration de base de donnees necessaire.**

