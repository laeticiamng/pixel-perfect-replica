

# Audit UX Ultra Critique : Parcours Premium vs Reservation

## Synthese des Problemes Identifies

J'ai analyse en detail les fichiers `PremiumPage.tsx`, `BinomePage.tsx`, `SessionQuotaBadge.tsx`, `useSessionQuota.ts`, et les traductions i18n. Voici les points de friction classes par impact sur la conversion.

---

## CRITIQUE - Points de Friction Majeurs

### F1. Pas de mention du pay-per-use (0,99 euros) quand le quota est atteint sur BinomePage

**Fichier** : `BinomePage.tsx` (lignes 80-92)

Quand `canCreate === false`, le bandeau d'alerte ne mentionne que "Passe Premium" avec un bouton "Premium". L'option session a l'unite (0,99 euros) n'est jamais mentionnee. L'utilisateur pense qu'il doit payer 9,90 euros/mois pour creer 1 session de plus.

**Impact** : Perte directe de conversion sur le tier intermediaire. Un etudiant a 0 euros ne cliquera pas sur "Premium" mais acheterait peut-etre 1 session a 0,99 euros.

**Correction** : Ajouter un second CTA "Acheter 1 session (0,99 euros)" dans le bandeau d'alerte, a cote du bouton Premium.

### F2. Le toast d'erreur est identique qu'on clique sur "+" ou qu'on ouvre le sheet

**Fichier** : `BinomePage.tsx` (lignes 34, 43)

`handleCreate` et `handleOpenCreate` affichent un toast quasi-identique (`quotaReached` vs `quotaReachedCreate`) puis redirigent immediatement vers `/premium`. L'utilisateur est ejecte de la page sans comprendre ce qui se passe.

**Impact** : Friction maximale. L'utilisateur perd son contexte et son intention.

**Correction** : Afficher une modale in-page avec les 2 options (session unit / Nearvity+) au lieu de rediriger brutalement.

### F3. La page Premium affiche Free > Session Unit > Nearvity+ (ordre inverse de la valeur)

**Fichier** : `PremiumPage.tsx` (lignes 274-419)

L'utilisateur redirige depuis le quota atteint arrive sur la page Premium et voit d'abord "Free - 0 euros - Your Plan" en haut. Il doit scroller pour trouver la solution. Le "RECOMMANDE" est tout en bas.

**Impact** : L'utilisateur qui arrive frustre voit d'abord "ton plan actuel" ce qui ne l'aide pas. Il doit scroller pour trouver la solution.

**Correction** : Inverser l'ordre : Nearvity+ en premier (recommande, hero), puis session unit, puis Free en dernier. Quand l'utilisateur arrive depuis un `?from=quota`, auto-scroller vers le CTA Nearvity+.

---

## IMPORTANT - Clarte des Messages Quota

### F4. Le SessionQuotaBadge ne montre pas les sessions achetees

**Fichier** : `SessionQuotaBadge.tsx`

Le composant affiche `sessionsCreated / sessionsLimit` mais ne distingue pas les sessions gratuites des sessions achetees. Un utilisateur qui a achete 3 sessions a l'unite voit "2/5" sans comprendre d'ou viennent les 3 extra.

**Correction** : Ajouter une ligne sous la progress bar : "dont X achetees" quand `purchasedSessions > 0`.

### F5. Le message "oneLeft" est trop vague

**Traduction** : `'Plus qu'un créneau disponible ce mois-ci'`

Pas de CTA, pas de contexte prix. L'utilisateur ne sait pas quoi faire.

**Correction** : `'Plus qu'1 créneau gratuit. Achete des sessions extra des 0,99 euros'` avec un lien cliquable vers `/premium`.

### F6. Le quota "remaining" dans le bouton header est confus

**Fichier** : `BinomePage.tsx` (ligne 72)

`{!isPremium && remaining < 5 && <span>({remaining})</span>}` affiche juste un chiffre entre parentheses a cote du "+". Sans contexte, "(1)" ne signifie rien pour l'utilisateur.

**Correction** : Remplacer par un tooltip ou un texte explicite comme "1 restant".

---

## MINEUR - Polish et Micro-Conversions

### F7. Checkout ouvre un nouvel onglet au lieu de rediriger

**Fichier** : `PremiumPage.tsx` (lignes 119, 142)

`window.open(checkoutUrl, '_blank')` ouvre Stripe dans un nouvel onglet. Sur mobile, cela cree de la confusion (l'utilisateur ne sait pas revenir). Le retour post-paiement avec `?success=true` ne fonctionnera que si l'utilisateur revient sur l'onglet original.

**Correction** : Utiliser `window.location.href = checkoutUrl` pour une redirection directe, surtout sur mobile.

### F8. Pas d'ancre visuelle "economie" pour Nearvity+

La page Premium ne montre pas le calcul de rentabilite. A 0,99 euros/session, 10 sessions = 9,90 euros = le prix du premium. Mais cela n'est ecrit nulle part.

**Correction** : Ajouter un texte sous le prix Nearvity+ : "Rentable des 10 sessions/mois" ou "= 10 sessions au prix de l'abonnement".

### F9. Pas de confirmation visuelle apres retour Stripe

Le toast `welcomeNearvityPlus` est ephemere (quelques secondes). L'utilisateur qui revient de Stripe ne voit peut-etre pas la confirmation.

**Correction** : Afficher un bandeau persistant ou une animation (confetti ?) quand `?success=true`.

---

## Plan d'Implementation (par priorite)

| # | Correction | Fichier(s) | Effort |
|---|---|---|---|
| F1 | Ajouter CTA "0,99 euros" dans le bandeau quota atteint | `BinomePage.tsx` | S |
| F3 | Inverser l'ordre des cards Premium (Nearvity+ en haut) | `PremiumPage.tsx` | S |
| F2 | Remplacer redirect par modale in-page quand quota atteint | `BinomePage.tsx` | M |
| F7 | Redirect au lieu de nouvel onglet pour checkout | `PremiumPage.tsx` | S |
| F4 | Afficher "dont X achetees" dans SessionQuotaBadge | `SessionQuotaBadge.tsx` | S |
| F5 | Enrichir message "oneLeft" avec prix et lien | `translations.ts`, `SessionQuotaBadge.tsx` | S |
| F6 | Ajouter contexte au "(remaining)" dans le header | `BinomePage.tsx` | S |
| F8 | Ajouter ligne "rentable des 10 sessions" | `PremiumPage.tsx`, `translations.ts` | S |
| F9 | Confetti + bandeau persistant post-paiement | `PremiumPage.tsx` | M |

**6 fichiers modifies, 0 migration de base de donnees.**

