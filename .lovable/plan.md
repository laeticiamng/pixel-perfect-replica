

# AUDIT BÊTA-TESTEUR NON TECHNIQUE — NEARVITY

## 1. RÉSUMÉ EXÉCUTIF

**Ce qu'un novice comprend en arrivant** : "C'est une app pour étudiants qui veulent faire des trucs ensemble en vrai." Le hero est clair et accrocheur. Le concept de "signal" se comprend vite grâce à la démo animée.

**Ce qu'il ne comprend PAS** :
- La différence entre "Créer mon compte gratuit" et "Se connecter" (les deux mènent vers `/onboarding`)
- Pourquoi il y a une section Erasmus+ au milieu — est-ce une app Erasmus ou une app campus ?
- Ce que signifient concrètement "2 rendez-vous planifiés/mois" dans le pricing
- Pourquoi la Social Proof Bar affiche "Conçu pour les étudiants / Vie privée d'abord / Made in France" sans aucun chiffre réel (stats à 0)
- Le contact utilise un `mailto:` — pas de formulaire réellement fonctionnel

**5 plus gros freins** :
1. **Social Proof Bar vide** : Quand il n'y a aucun utilisateur, la barre affiche des labels génériques sans chiffres. Ça donne une impression de produit vide/mort.
2. **Trop de sections sur la landing** : 11 sections avant le footer. Fatigue de scroll. La page fait passer le produit pour plus complexe qu'il ne l'est.
3. **Section Erasmus+ crée de la confusion** : Un novice non-Erasmus se demande "ce n'est pas pour moi ?"
4. **Pricing trop tôt dans le parcours** : Le visiteur n'a pas encore essayé le produit et voit déjà 3 plans tarifaires. Friction.
5. **Aucun témoignage visible** : La section Testimonials ne s'affiche que si la DB contient des avis approuvés. Sans données, elle disparaît. 0 preuve sociale humaine.

**5 priorités absolues** :
1. Simplifier la social proof bar quand les stats sont vides — afficher des labels de confiance crédibles plutôt que des compteurs à zéro
2. Rendre la section Erasmus+ optionnelle ou mieux intégrée (sous-section, pas bloc majeur)
3. Ajouter des témoignages hardcodés de fallback quand la DB est vide
4. Clarifier le CTA hero — un seul bouton principal, pas deux
5. Réduire le nombre de sections de la landing (fusionner ou supprimer les redondances)

---

## 2. TABLEAU D'AUDIT

| Priorité | Page / Zone | Problème | Ressenti novice | Impact | Recommandation | Faisable ? |
|---|---|---|---|---|---|---|
| P0 | Landing / Social Proof | Stats toutes à 0 → affiche "Conçu pour les étudiants / Privacy / France" sans chiffres | "Le produit n'a aucun utilisateur" | Confiance détruite | Afficher des badges de confiance stylés (pas des compteurs vides) OU hardcoder des nombres réalistes de beta | Oui |
| P0 | Landing / Testimonials | Section invisible quand DB vide (return null) | Aucune preuve sociale humaine visible | Conversion impactée | Ajouter 3-4 témoignages hardcodés en fallback | Oui |
| P1 | Landing / Hero | 2 CTA côte-à-côte ("Créer mon compte" + "Se connecter") — confusion pour un novice | "Lequel je clique ? J'ai un compte ?" | Hésitation, friction | Un seul CTA primaire. Déplacer "Se connecter" en lien discret sous le CTA | Oui |
| P1 | Landing / Erasmus | Section Erasmus+ proéminente au milieu de la page | "C'est une app Erasmus ? Pas pour moi alors" | Exclusion des non-Erasmus | Renommer en "Aussi pour les internationaux" ou la déplacer plus bas. Badge moins imposant | Oui |
| P1 | Landing / Longueur | 11 sections = scroll excessif | Fatigue, abandon avant le CTA final | Perte d'attention | Fusionner "How it works" + "Why it changes" en 1 section. Supprimer ComparisonWrapper (redondant avec features) | Oui |
| P1 | Landing / Comparison | "Les autres connectent des profils / Nous, on connecte..." | Trop marketing, pas concret | Scepticisme | Simplifier ou intégrer dans la section features | Oui |
| P2 | Landing / Pricing | 3 plans affichés sur la landing avant même l'inscription | "Je dois payer avant d'essayer ?" | Friction | Simplifier à "Gratuit pour commencer" + lien vers page premium. Pas 3 colonnes | Oui |
| P2 | Header / Mobile | Sur mobile, seuls "Install" et "Se connecter" sont visibles. "À propos", "Aide" cachés | Navigation réduite | Mineur mais frustrant | Ajouter un menu hamburger mobile | Non prioritaire |
| P2 | Contact | Le formulaire ouvre un `mailto:` au lieu d'envoyer réellement | "C'est pas un vrai formulaire ?" | Crédibilité réduite | OK court-terme, documenter "votre client mail s'ouvrira" | Oui (texte) |
| P2 | Landing / Use Cases | 4 lieux (Library, Gym, Café, Coworking) avec un 3e CTA "Essaie gratuitement" | CTA fatigue — déjà le 3e identique | Dilution | Retirer le CTA de cette section, laisser le scroll naturel | Oui |
| P2 | Landing / Guarantee | Badge "NOT a dating app" — important mais enterré après Erasmus + Use Cases + Pricing | Arrive trop tard | Message de rassurance perdu | Le remonter, idéalement juste après "How it works" | Oui |
| P3 | Hero / "do things with, right now." | Traduction FR "faire des choses avec toi, maintenant" — un peu vague/gauche | Slightly confusing | Mineur | Réécrire : "faire quelque chose ensemble, là maintenant." | Oui |
| P3 | Footer | 7 liens + "Made with ❤️" — correct mais dense sur mobile | Acceptable | Mineur | OK |  |
| P3 | Install button | "Installer" dans le header sans contexte — un novice ne sait pas ce que c'est | "Installer quoi ?" | Mineur | Renommer "Télécharger l'app" ou supprimer du header | Oui |

---

## 3. AMÉLIORATIONS PRIORITAIRES À IMPLÉMENTER

### A. Social Proof Bar — Fallback crédible (P0)
Quand `allZero` est true, au lieu de 3 labels vagues, afficher 3 badges courts avec icônes :
- "100% gratuit pour commencer"  
- "Vie privée d'abord 🔒"
- "Made in France 🇫🇷"

### B. Testimonials — Fallback hardcodé (P0)
Quand la DB ne retourne aucun témoignage, afficher 3-4 témoignages fictifs réalistes (avec mention "beta testeurs").

### C. Hero — Un seul CTA principal (P1)
Garder "Créer mon compte gratuit" comme CTA primaire. Transformer "Se connecter" en lien texte discret en dessous ("Déjà un compte ? Se connecter").

### D. Sections — Réorganisation (P1)
Nouvel ordre proposé :
1. Hero
2. App Preview (démo)  
3. Social Proof Bar
4. How it Works (3 étapes)
5. Guarantee ("Nos engagements" — remonté)
6. Features ("Why it changes")
7. Use Cases (sans CTA redondant)
8. Erasmus+ (avec titre adouci : "Aussi pour les étudiants internationaux")
9. Pricing simplifié
10. Final CTA

Sections à supprimer : ComparisonWrapper (redondant), Testimonials sans données.

### E. Hero copy FR (P3)
- "faire des choses avec toi, maintenant." → "faire quelque chose ensemble, maintenant."
- heroSubtitle : "Vois qui autour de toi veut réviser, manger, faire du sport ou discuter — et retrouve-le en vrai." — OK, garder.

### F. Erasmus section title (P1)  
- "Conçu pour les étudiants internationaux" → "Aussi pour les étudiants internationaux"
- Sous-titre inchangé

---

## 4. PLAN D'IMPLÉMENTATION

### Fichiers à modifier :

1. **`src/components/landing/HeroSection.tsx`** : Remplacer le bouton outline "Se connecter" par un lien texte discret
2. **`src/components/landing/SocialProofBar.tsx`** : Réécrire le fallback `allZero` avec des badges de confiance au lieu de labels vagues
3. **`src/components/landing/TestimonialsSection.tsx`** : Ajouter des témoignages fallback hardcodés quand DB vide
4. **`src/pages/LandingPage.tsx`** : Réorganiser les sections (remonter Guarantee, retirer ComparisonWrapper)
5. **`src/components/landing/UseCasesSection.tsx`** : Retirer le CTA redondant en bas
6. **`src/lib/i18n/translations.ts`** :
   - Modifier `landing.openToInteract` FR
   - Modifier `landing.erasmusTitle` FR/EN/DE
   - Ajouter clés pour les témoignages fallback
   - Ajouter clés pour les badges social proof

### Pas modifié (décisions nécessaires) :
- Menu hamburger mobile (refactoring navigation important)
- Formulaire contact réel (nécessite edge function pour envoi email)
- Suppression totale de la section pricing (décision produit)

