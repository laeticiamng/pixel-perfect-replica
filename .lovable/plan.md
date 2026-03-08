

# AUDIT PRE-PRODUCTION COMPLET — NEARVITY

## RESUME EXECUTIF

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Technique Frontend | 16/20 | Solide, quelques warnings React et probleme accessibilite |
| Securite Backend | 18/20 | RLS 31/31, auth centralisee, audit SEC-01→09 applique |
| SEO / GEO | 18/20 | Metadata, JSON-LD, llms.txt, robots.txt bien configures |
| UX / Mobile | 15/20 | Warning forwardRef, `user-scalable=no` penalisant |
| Infra / Ops | 14/20 | Secrets ok sauf STRIPE_WEBHOOK_SECRET absent, pas de monitoring |
| **Global** | **16/20** | Production-ready avec correctifs P0 ci-dessous |

---

## 10 PROBLEMES CRITIQUES

| # | Probleme | Priorite | Impact |
|---|----------|----------|--------|
| 1 | **`user-scalable=no` dans index.html** — bloque le zoom sur mobile, echec WCAG 2.1 AA, penalite Google accessibility | P0 | SEO + Accessibilite |
| 2 | **Warning React: TestimonialCard sans forwardRef** — `Marquee` passe des refs aux enfants `TestimonialCard` qui est une function component sans forwardRef | P0 | Console polluee, risque regression |
| 3 | **Sitemap pointe vers `nearvity.fr` mais le domaine deploye est `nearvity.lovable.app`** — Les URLs ne correspondent pas au domaine actuel si custom domain pas configure | P1 | Indexation cassee si domaine pas actif |
| 4 | **STRIPE_WEBHOOK_SECRET absent** — aucun webhook Stripe configure, desync abonnement possible | P1 | Monetisation |
| 5 | **Pas de page 404 avec status HTTP 404** — SPA retourne toujours 200 meme sur routes inexistantes (comportement normal SPA mais probleme SEO) | P1 | Crawl budget |
| 6 | **`robots.txt` Sitemap pointe vers `nearvity.fr/sitemap.xml`** — doit correspondre au domaine actif | P1 | Decouverte sitemap |
| 7 | **Aucun monitoring / alerting en production** — pas de Sentry, pas d'alerting sur erreurs Edge Functions | P1 | Fiabilite |
| 8 | **Duplication JSON-LD** — `index.html` contient SoftwareApplication + Organization + FAQPage statiques, et `LandingPage.tsx` injecte WebApplication + WebSite via Helmet. Duplication Organization/App | P2 | Confusion schema |
| 9 | **`HelmetProvider` wrappe `App` mais les meta OG statiques dans `index.html` ne sont pas ecrasees par Helmet** — Les crawlers voient les meta statiques + les meta dynamiques | P2 | Duplication meta |
| 10 | **Scan securite `up_to_date: false`** — le dernier scan date du 1er mars, pas de rescan recent | P2 | Conformite |

---

## 10 GAINS RAPIDES

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Retirer `maximum-scale=1.0, user-scalable=no` de index.html | 5 min | Accessibilite + SEO |
| 2 | Ajouter `forwardRef` a `TestimonialCard` | 10 min | 0 warning console |
| 3 | Verifier que le domaine `nearvity.fr` est bien configure et pointe vers le bon deploiement | 15 min | Indexation |
| 4 | Supprimer les JSON-LD statiques de `index.html` (garder uniquement ceux injectes par Helmet) | 20 min | Schema propre |
| 5 | Supprimer les meta OG/Twitter statiques de `index.html` (Helmet les gere par page) | 10 min | Pas de duplication |
| 6 | Ajouter `<meta name="robots" content="noindex">` sur les routes protegees via Helmet | 15 min | Crawl budget |
| 7 | Bouton "Retour" sur NotFound utilise `onClick` au lieu de `<Link>` — corriger pour crawlabilite | 5 min | SEO interne |
| 8 | Soumettre sitemap a Google Search Console + Bing Webmaster | 15 min | Indexation |
| 9 | Ajouter `rel="noopener"` sur les liens mailto dans le footer | 5 min | Securite |
| 10 | Rescan securite apres correctifs | 5 min | Conformite |

---

## PLAN D'IMPLEMENTATION — TICKETS LOVABLE

### Ticket 1 — P0 : Corriger accessibilite viewport zoom

**Fichier** : `index.html` ligne 5
**Correction** : Remplacer `maximum-scale=1.0, user-scalable=no` par juste `viewport-fit=cover`
**Acceptance** : L'utilisateur peut zoomer sur mobile. Lighthouse accessibility score ameliore.
**Estimation** : S (5 min)

### Ticket 2 — P0 : Corriger forwardRef TestimonialCard

**Fichier** : `src/components/landing/TestimonialsSection.tsx` ligne 14
**Correction** : Wrapper `TestimonialCard` avec `forwardRef`
**Acceptance** : 0 warning "Function components cannot be given refs" dans la console
**Estimation** : S (10 min)

### Ticket 3 — P0 : Nettoyer duplication meta et JSON-LD dans index.html

**Fichier** : `index.html`
**Correction** :
- Supprimer les 3 blocs `<script type="application/ld+json">` (lignes 26-174) — Helmet les injecte dynamiquement par page
- Supprimer les meta OG et Twitter Card statiques (lignes 182-198) — Helmet les gere par page
- Garder uniquement : charset, viewport, theme-color, PWA metas, title, description, canonical, hreflang, favicon/manifest, noscript
**Acceptance** : Pas de duplication JSON-LD ni meta OG dans le DOM final
**Estimation** : M (20 min)

### Ticket 4 — P1 : Verifier domaine nearvity.fr

**Action manuelle** : Verifier dans Settings > Domains que `nearvity.fr` est configure et pointe vers le deploiement. Si non, soit configurer le domaine, soit mettre a jour `SITE_URL`, `sitemap.xml`, `robots.txt` pour pointer vers `nearvity.lovable.app`.
**Estimation** : M (30 min)

### Ticket 5 — P1 : Ajouter noindex sur routes protegees

**Fichiers** : Pages protegees majeures (MapPage, ProfilePage, SettingsPage, AdminDashboardPage, etc.)
**Correction** : Ajouter `<Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>` sur les pages protegees qui n'ont pas encore de Helmet
**Acceptance** : Les routes `/map`, `/profile`, `/settings`, `/admin` ont un noindex
**Estimation** : M (30 min)

### Ticket 6 — P1 : Corriger lien NotFound pour crawlabilite

**Fichier** : `src/pages/NotFound.tsx`
**Correction** : Remplacer `<Button onClick={() => navigate("/")}...>` par `<Button asChild><Link to="/">...</Link></Button>`
**Estimation** : S (5 min)

### Ticket 7 — P2 : Configurer STRIPE_WEBHOOK_SECRET quand disponible

**Action** : Implementer endpoint webhook Stripe pour synchroniser les abonnements. Actuellement le polling client est le seul mecanisme.
**Risque residuel** : Moyen — desync possible si le polling echoue
**Estimation** : L (4h)

---

## CHECKLIST PRE-PRODUCTION

### Infrastructure
- [ ] Domaine `nearvity.fr` configure et pointe vers le deploiement
- [ ] Secrets configures : STRIPE_SECRET_KEY ✅, MAPBOX_ACCESS_TOKEN ✅, FIRECRAWL_API_KEY ✅, ELEVENLABS_API_KEY ✅, RESEND_API_KEY ✅, PERPLEXITY_API_KEY ✅, LOVABLE_API_KEY ✅
- [ ] Secret manquant : STRIPE_WEBHOOK_SECRET ⚠️

### Securite
- [x] RLS active 31/31 tables
- [x] Auth centralisee getClaims() 14/14 Edge Functions
- [x] Rate limiting 11/14 endpoints
- [x] Shadow-ban auto 3+ reports/24h
- [x] Audit SEC-01→09 applique
- [x] Scan securite : tous findings resolved/ignored
- [ ] Rescan securite a effectuer (dernier : 1er mars)

### SEO / Metadata
- [x] Title + meta description sur toutes les pages publiques
- [x] Canonical tags
- [x] OG + Twitter Cards
- [x] JSON-LD (WebApplication, Organization, FAQPage, BreadcrumbList)
- [x] robots.txt avec AI crawlers autorises
- [x] sitemap.xml avec 9 URLs publiques
- [x] llms.txt complet
- [x] noscript fallback
- [ ] Supprimer duplication JSON-LD/OG dans index.html (Ticket 3)
- [ ] Soumettre sitemap a GSC + Bing Webmaster

### Accessibilite
- [ ] Retirer `user-scalable=no` (Ticket 1)
- [x] aria-labels sur navigation
- [x] aria-current sur BottomNav
- [x] Semantic HTML (main, nav, header, footer, section)

### Console / Erreurs
- [ ] Corriger warning forwardRef TestimonialCard (Ticket 2)
- [x] ErrorBoundary global + par route
- [x] OfflineBanner
- [x] 0 erreur bloquante

### Mobile
- [x] BottomNav responsive avec safe-bottom
- [x] Navigation par gestes
- [x] PWA manifest + service worker
- [x] Icons PWA 192x192 + 512x512

### RGPD
- [x] Cookie consent
- [x] Page privacy avec 10 sections
- [x] Export donnees (DataExportPage)
- [x] Suppression compte (DeleteAccountDialog)
- [x] DPO configure (contact@emotionscare.com)
- [x] Cleanup auto : signaux 2h, rate limits 24h, locations 30j, analytics 90j

### Performance
- [x] Code-splitting avec lazy() sur toutes les pages
- [x] Manual chunks (vendor-react, vendor-ui, vendor-mapbox, etc.)
- [x] Workbox caching (fonts, assets)
- [x] staleTime 5min sur React Query

---

## 5 ACTIONS AUJOURD'HUI
1. Retirer `user-scalable=no` de index.html
2. Ajouter forwardRef a TestimonialCard
3. Supprimer les JSON-LD et meta OG statiques en doublon dans index.html
4. Corriger le lien NotFound (onClick → Link)
5. Verifier le domaine `nearvity.fr` dans Settings > Domains

## 5 ACTIONS CETTE SEMAINE
1. Ajouter `<meta name="robots" content="noindex">` sur les routes protegees
2. Soumettre sitemap a Google Search Console + Bing Webmaster Tools
3. Lancer un rescan securite
4. Tester signup/login/signal/session sur le domaine publie
5. Monitorer logs Edge Functions pendant 24h post-deploy

## 5 ACTIONS CE MOIS
1. Implementer webhook Stripe (STRIPE_WEBHOOK_SECRET)
2. Ajouter monitoring erreurs (Sentry ou equivalent)
3. Tester rich snippets (FAQ, breadcrumbs) via Rich Results Test
4. Verifier citations IA (ChatGPT Search, Perplexity) pour "reseau social IRL etudiants"
5. Analyser Core Web Vitals post-deploy et optimiser si necessaire

