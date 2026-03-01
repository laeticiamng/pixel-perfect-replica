

## Audit Directeur Marketing & Commercial — NEARVITY v2.0.0

**Date** : 1er mars 2026 | **Score global** : 62/100

---

### 1. FUNNEL D'ACQUISITION (Score : 7/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Landing page structure | OK | Funnel complet : Hero > Problem > Solution > Features > Comparison > Use Cases > Guarantees > CTA |
| Hero CTA principal | OK | "Creer mon compte" en gradient coral, taille XXL, visible immediatement |
| CTA secondaire (Sign In) | OK | Bouton outline bien differencie du CTA principal |
| CTA final (bottom of page) | OK | Section FinalCTASection avec fond gradient et CTA identique |
| SEO on-page | OK | Title, meta description, keywords, canonical, hreflang FR/EN, Open Graph complet |
| JSON-LD structure | OK | WebApplication + Organization + FAQPage — excellent pour le GEO |
| Scroll indicator | OK | Animation subtile invitant au scroll |
| **Social Proof Bar** | **ABSENT** | Le composant `SocialProofBar` existe (500+ users, 1200+ sessions, 15+ villes) mais n'est PAS integre dans la landing page |
| Nombre de CTA intermediaires | FAIBLE | Un seul CTA en haut et un en bas — aucun CTA intermediaire dans les sections Problem, Features ou Use Cases |
| Badge "NOT a dating app" | OK | Present dans le Hero et dans la section Guarantees — positionement clair |

**Lacunes identifiees** :
- Social Proof Bar inutilisee — element de conversion critique manquant
- Pas de CTA intermediaire entre le Hero et le CTA final (gap de ~5 ecrans de scroll)
- Pas de compteur anime (animated counter) pour les chiffres cles

---

### 2. CONVERSION & ONBOARDING (Score : 8/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Formulaire inscription | OK | Email + password + prenom + universite (optionnel) |
| Indicateur force mot de passe | OK | PasswordStrengthIndicator integre |
| OAuth Google + Apple | OK | Boutons presents avec fallback Supabase |
| Magic Link | OK | Option alternative pour login sans mot de passe |
| Rate limiting | OK | Presets login/signup pour eviter le brute force |
| Confirmation email | OK | Ecran de confirmation avec bouton "Renvoyer" |
| Post-signup onboarding | OK | Route `/welcome` avec `PostSignupOnboardingPage` |
| Forgot password flow | OK | Page dediee `/forgot-password` |
| Redirection apres login | OK | Retour vers `returnPath` ou `/map` |
| **Page Premium accessible sans auth** | **NON** | La page `/premium` est protegee — les visiteurs non connectes ne peuvent PAS voir les offres |

**Lacunes identifiees** :
- Page Premium protegee : un visiteur qui arrive via une campagne marketing ne peut pas voir les prix sans s'inscrire d'abord — friction majeure
- Pas de page `/pricing` publique distincte

---

### 3. MONETISATION & PRICING (Score : 7/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Offre Free | OK | 2 sessions/mois, bien affichee |
| Offre Nearvity+ | OK | 9,90 EUR/mois, mise en avant "Recommande", ROI anchor ("rentable des 10 sessions") |
| Offre Session Unit | OK | 0,99 EUR/unite, selector de quantite (1-10) |
| Flux Stripe | OK | Redirect direct (window.location) optimise mobile |
| Success flow | OK | Banniere + confetti + toast apres paiement |
| Portal de gestion | OK | Bouton "Gerer mon abonnement" avec Stripe Customer Portal |
| **Upsell in-app** | PARTIEL | Modale quota atteint existe mais pas de nudge proactif |
| **Trial / Free tier visible sur landing** | ABSENT | Aucune mention des prix ou du modele freemium sur la landing page |
| **Comparaison tiers visible publiquement** | ABSENT | Le tableau Free vs Premium n'est visible qu'apres authentification |

**Lacunes identifiees** :
- Les prix ne sont visibles nulle part pour un visiteur non authentifie
- Pas de section pricing/tarification sur la landing page
- Pas de nudge premium contextuel (ex: apres la 2e session gratuite)

---

### 4. SEO & GEO (Generative Engine Optimization) (Score : 9/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| robots.txt | OK | AI crawlers (GPTBot, ClaudeBot, PerplexityBot, cohere-ai) autorises avec restrictions intelligentes sur /map, /profile, /admin |
| sitemap.xml | OK | 9 pages, hreflang FR/EN + x-default |
| llms.txt | OK | Description complete du produit, features, company |
| JSON-LD WebApplication | OK | Riche avec featureList, offers, audience |
| JSON-LD Organization | OK | Avec knowsAbout pertinent |
| JSON-LD FAQPage | OK | 6 questions/reponses pour featured snippets |
| JSON-LD AboutPage | OK | Sur la page /about |
| Canonical + hreflang | OK | Correctement configure dans index.html |
| **Page /about enrichie** | OK | Manifesto, values, origin story, key figures — excellent pour la credibilite GEO |

**Lacunes identifiees** :
- Pas de JSON-LD `Product` ou `SoftwareApplication` avec pricing (permettrait d'apparaitre dans les resultats enrichis prix)
- sameAs vide dans Organization (pas de liens reseaux sociaux)

---

### 5. RETENTION & ENGAGEMENT (Score : 5/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Analytics | OK | Tracking page views, signup, login, signal, interaction, engagement |
| Push notifications | OK | Service worker `sw-push.js` + hook `usePushNotifications` |
| PWA Install page | OK | Page dediee `/install` avec detection OS, QR code desktop, confetti |
| Changelog | OK | Page `/changelog` traduite FR/EN |
| Feedback page | OK | Formulaire de retour utilisateur |
| **Referral / Parrainage** | ABSENT | Aucun systeme de parrainage ou d'invitation |
| **UTM tracking** | ABSENT | Pas de capture UTM dans l'analytics |
| **Email marketing / Welcome email** | ABSENT | Pas de sequence email post-signup (au-dela de la confirmation) |
| **Onboarding gamification** | FAIBLE | Pas de checklist, pas de progression, pas de badges onboarding |
| **Share / Invite friends** | PARTIEL | Bouton share natif sur events et profils, mais pas de programme d'invitation structure |
| **Re-engagement** | ABSENT | Pas de notification "Tu n'as pas active ton signal depuis X jours" |

---

### 6. COMMUNICATION & BRANDING (Score : 8/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Identite visuelle | OK | Coherente : coral gradient, glass morphism, dark theme |
| Positionnement clair | OK | "NOT a dating app" repete strategiquement |
| i18n FR/EN | OK | Complete sur toutes les pages publiques |
| Tagline | OK | "Vois qui est dispo pres de toi, maintenant" |
| Ton de voix | OK | Direct, jeune, sans jargon technique |
| Legal (CGU, Privacy) | OK | Pages completes avec sections RGPD |
| **Temoignages / Reviews** | ABSENT | Aucun temoignage utilisateur sur la landing page |
| **Press / Media mentions** | ABSENT | Pas de section presse ou couverture media |

---

### 7. COMPETITIVE INTELLIGENCE (Score : 6/10)

| Element | Statut | Commentaire |
|---------|--------|-------------|
| Comparison section | OK | "Avant vs Apres" sur la landing page — efficace |
| Differentiation claire | OK | Badge "NOT a dating app", section Guarantees |
| **Competitor naming** | ABSENT | Pas de comparaison directe avec des concurrents nommes (Bumble BFF, Meetup, etc.) |
| **Unique Value Proposition** | PARTIEL | Le "signal system" est bien explique mais pas assez mis en avant comme USP technique |

---

## PLAN D'ACTION PRIORITAIRE

### P0 — Quick Wins (Impact eleve, effort faible)

1. **Integrer SocialProofBar dans la landing page** — Le composant existe deja, il suffit de l'ajouter entre AppPreviewSection et ProblemSection
2. **Rendre la page Premium publique** — Retirer le `ProtectedRoute` de `/premium` pour que les visiteurs puissent voir les prix
3. **Ajouter un CTA intermediaire** dans FeaturesSection ou UseCasesSection

### P1 — Impact moyen (1-2 sprints)

4. **Ajouter une section Temoignages** sur la landing page avec des citations d'utilisateurs beta
5. **Section Pricing publique** sur la landing page (mini-tableau Free vs Nearvity+)
6. **Capturer les UTM parameters** dans l'analytics pour tracker les campagnes
7. **JSON-LD Product avec pricing** pour les resultats enrichis Google

### P2 — Impact strategique (2-4 sprints)

8. **Systeme de parrainage** avec lien d'invitation + recompense (session gratuite)
9. **Email welcome sequence** post-signup (J+0, J+1, J+3, J+7)
10. **Notifications de re-engagement** ("Tu n'as pas active ton signal depuis 3 jours")
11. **Onboarding gamifie** avec checklist de progression

---

## RESUME EXECUTIF

La plateforme NEARVITY dispose d'une base marketing solide : landing page bien structuree, SEO/GEO optimise, positionnement clair, et flux de paiement fonctionnel. Cependant, plusieurs leviers de croissance critiques sont inexploites :

- **La Social Proof est absente de la landing page** alors que le composant existe deja
- **Les prix sont invisibles** pour les visiteurs non authentifies (friction d'achat majeure)
- **Aucun mecanisme de viralite** (referral, invitation, partage incitatif)
- **Le funnel de re-engagement est vide** (pas d'emails, pas de notifications de rappel)

Les 3 actions prioritaires (P0) peuvent etre implementees en moins d'une heure et auraient un impact immediat sur le taux de conversion.

