
# Renommage EASY --> NEARVITY

Renommage complet de l'application de "EASY" en "NEARVITY" (near + activity) et de "Easy+" en "Nearvity+" sur l'ensemble du projet.

## Fichiers a modifier

### 1. Constante globale
- **`src/lib/constants.ts`** : `APP_NAME = 'NEARVITY'`

### 2. index.html (meta tags)
- apple-mobile-web-app-title : "NEARVITY"
- application-name : "NEARVITY"
- title : "NEARVITY - Le premier reseau social 100% reel"
- og:title, og:image:alt, og:site_name : remplacer EASY par NEARVITY
- twitter:card title, description, image:alt : idem

### 3. vite.config.ts (PWA manifest)
- name : "NEARVITY - Le premier reseau social 100% reel"
- short_name : "NEARVITY"

### 4. UI Components
- **`src/components/landing/LandingHeader.tsx`** : texte "EASY" --> "NEARVITY", lettre "E" --> "N" dans le logo
- **`src/components/landing/LandingFooter.tsx`** : texte "EASY" --> "NEARVITY", lettre "E" --> "N", email support@easy-app.fr --> support@nearvity.fr (ou garder l'ancien si le domaine n'existe pas encore)
- **`src/components/navigation/DesktopSidebar.tsx`** : alt="EASY" --> alt="NEARVITY", references a easy-logo.png
- **`src/pages/InstallPage.tsx`** : alt="EASY Logo" --> alt="NEARVITY Logo", lettre fallback "E" --> "N"
- **`src/pages/ProfilePage.tsx`** : "EASY v{APP_VERSION}" --> "NEARVITY v{APP_VERSION}"

### 5. Traductions (src/lib/i18n/translations.ts)
Toutes les occurrences de "EASY" dans les textes traduits :
- `wantsToBeApproached` : "EASY shows you who is." --> "NEARVITY shows you who is."
- `beTheFirst` : "Invite your friends to join EASY" --> "...NEARVITY"
- `howDoesEasyWork` --> renommer la cle en `howDoesNearvityWork` + texte mis a jour
- `howDoesEasyWorkAnswer` --> idem
- `isEasyFree` --> `isNearvityFree` + texte
- `isEasyFreeAnswer` --> `isNearvityFreeAnswer` + texte
- `howToContactSupportAnswer` : emails easy-app.fr
- `easyPlusTitle` : "Easy+" --> "Nearvity+"
- `subscribe` : "Upgrade to Easy+" --> "Upgrade to Nearvity+"
- `welcomeEasyPlus` : "You are Easy+!" --> "You are Nearvity+!"
- Toutes les cles `whyEasy.*` : renommer en `whyNearvity.*`

### 6. Pages
- **`src/pages/HelpPage.tsx`** : mettre a jour les cles FAQ renommees
- **`src/pages/PremiumPage.tsx`** : `EASY_PLUS_FEATURES` --> `NEARVITY_PLUS_FEATURES`, `handleEasyPlusSubscribe` --> `handleNearvityPlusSubscribe`
- **`src/pages/AboutPage.tsx`** : email support@easy-app.fr
- **`src/pages/TermsPage.tsx`** : email legal@easy-app.fr
- **`src/pages/PrivacyPage.tsx`** : email dpo@easy-app.fr

### 7. Hooks et stores
- **`src/hooks/useSubscription.ts`** : `createEasyPlusCheckout` --> `createNearvityPlusCheckout`, type `'easyplus'` --> `'nearvityplus'`
- **`src/components/binome/BinomeOnboarding.tsx`** : `WhyEasySection` --> `WhyNearvitySection`, cles `whyEasy.*`

### 8. Edge Functions
- **`supabase/functions/notifications/index.ts`** : "EASY Alerts" --> "NEARVITY Alerts", "[EASY]" --> "[NEARVITY]"
- **`supabase/functions/create-checkout/index.ts`** : commentaires "Easy+" --> "Nearvity+"

### 9. Cookie consent
- **`src/components/CookieConsent.tsx`** : `CONSENT_KEY = 'easy-cookie-consent'` --> `'nearvity-cookie-consent'`

### 10. Assets
- Le fichier `public/easy-logo.png` sera renomme en `public/nearvity-logo.png` (avec mise a jour de toutes les references)

### 11. Documentation
- **`README.md`** : EASY --> NEARVITY partout
- **`CHANGELOG.md`** : EASY --> NEARVITY partout

### 12. Tests
- **`src/test/premium-pricing.test.ts`** : "Easy+" --> "Nearvity+", `easyplus` --> `nearvityplus`
- **`src/test/e2e-critical-paths.test.tsx`** : idem
- **`src/test/components.test.tsx`** : `cookie-consent` key

---

## Section technique

### Emails
Les adresses `support@easy-app.fr`, `legal@easy-app.fr`, `dpo@easy-app.fr` seront remplacees par `support@nearvity.fr`, `legal@nearvity.fr`, `dpo@nearvity.fr`. Si le domaine n'est pas encore configure, ces emails seront tout de meme mis a jour pour coherence de marque.

### Retrocompatibilite cookie
Le changement de `CONSENT_KEY` signifie que les utilisateurs existants reverront le bandeau cookie. C'est acceptable puisque c'est un rebranding complet.

### Stripe
Les references internes `'easyplus'` dans le body envoye a l'edge function `create-checkout` seront renommees en `'nearvityplus'`. L'edge function devra accepter les deux valeurs temporairement, ou etre mise a jour en meme temps.

### Ordre d'execution
1. Constante + index.html + vite.config.ts (fondations)
2. Traductions (toutes les cles i18n)
3. Composants UI (header, footer, sidebar, pages)
4. Hooks et logique metier
5. Edge functions
6. Tests et documentation
