

# Plan: Corrections restantes (2 fichiers) + QA

## Etat des lieux

Sur les 8 tickets, **6 sont deja resolus** dans le code actuel. Seuls 2 fichiers necessitent encore une modification, plus un passage QA.

| Ticket | Statut |
|--------|--------|
| 1 - CreateSessionForm FormData | Deja fait |
| 2 - pushManager typing | Deja fait (cast `as any`) |
| 3 - forwardRef landing | Deja fait |
| 4 - Rebranding EASY -> NEARVITY | Deja fait (0 occurrence) |
| 5 - Stripe Nearvity+ | Deja fait |
| 6 - getUser -> getClaims | **2 fichiers restants** |
| 7 - verify_jwt config | Deja fait |
| 8 - QA end-to-end | A executer |

---

## Etape 1 - Migrer firecrawl-map vers getClaims()

**Fichier** : `supabase/functions/firecrawl-map/index.ts`

Remplacer le bloc `getUser()` (lignes 29-35) par le pattern `getClaims()` :
- Extraire le token du header Authorization
- Appeler `supabase.auth.getClaims(token)` 
- Utiliser `claimsData.claims.sub` comme userId pour la verification admin
- Adapter la requete profile pour utiliser le service role client (necessaire pour verifier le role admin)

## Etape 2 - Migrer firecrawl-scrape vers getClaims()

**Fichier** : `supabase/functions/firecrawl-scrape/index.ts`

Meme migration identique que firecrawl-map (meme structure de code).

## Etape 3 - Ajouter firecrawl au config.toml

Verifier que `firecrawl-map` et `firecrawl-scrape` sont declares avec `verify_jwt = false` dans `supabase/config.toml`. S'ils manquent, les ajouter.

## Etape 4 - Test QA rapide

Verifier via la console et le preview que :
- Pas d'erreur 401 sur les flux principaux
- Landing page propre (pas de warning ref)
- Le checkout Stripe pointe sur le bon prix Nearvity+

---

## Details techniques

Pattern de migration applique aux 2 fichiers firecrawl :

```text
AVANT:
  const { data: { user }, error } = await supabase.auth.getUser();
  // use user.id

APRES:
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error } = await supabase.auth.getClaims(token);
  const userId = claimsData.claims.sub;
  // use userId
```

Pour les fonctions admin (firecrawl), un second client Supabase avec `SUPABASE_SERVICE_ROLE_KEY` sera utilise pour la verification du role dans la table profiles, car le client anon ne peut pas lire le champ `role` via RLS.

**2 fichiers modifies, 0 migration de base de donnees.**

