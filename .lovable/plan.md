

# Plan: Add Erasmus+ Features Section to Landing Page

## Problem
All 5 Erasmus+ features (City Guides, First Week Checklist, Inclusion Radar, Events Hub, Wellbeing Check, Institutional Dashboard) exist in the codebase but are completely invisible from the landing page. Zero references in any landing component or translations.

## Solution
Create a new `ErasmusFeaturesSection` component and insert it into the landing page between `UseCasesSection` and `PricingPreviewSection`. This section will showcase the 5 Erasmus+ features as a visually distinct "Erasmus+ Integration" block.

### 1. Create `src/components/landing/ErasmusFeaturesSection.tsx`

A dedicated section with:
- A distinctive header badge ("Erasmus+ Ready" or "🇪🇺 Erasmus+ Integration")
- Title + subtitle explaining the Erasmus specialization
- 5 feature cards in a responsive grid (2 cols on tablet, 3 on desktop), each with:
  - Icon (Globe for City Guides, CheckSquare for Checklist, Heart for Inclusion, Calendar for Events, Brain for Wellbeing)
  - Title
  - Short description
- A CTA button linking to `/onboarding`
- Visual styling consistent with existing sections (glass cards, coral accents, RevealText animations)

### 2. Update `src/components/landing/index.ts`
Add the export for `ErasmusFeaturesSection`.

### 3. Update `src/pages/LandingPage.tsx`
Insert `<ErasmusFeaturesSection />` between `<UseCasesSection />` and `<PricingPreviewSection />`.

### 4. Update `src/lib/i18n/translations.ts`
Add translation keys for EN, FR, and DE:
- `landing.erasmusBadge` — "Erasmus+ Ready" / "Prêt pour Erasmus+" / "Erasmus+ Ready"
- `landing.erasmusTitle` — "Built for international students" / "Conçu pour les étudiants internationaux"
- `landing.erasmusSubtitle` — subtitle text
- `landing.erasmusFeature1Title` through `landing.erasmusFeature5Title`
- `landing.erasmusFeature1Desc` through `landing.erasmusFeature5Desc`
- `landing.erasmusCTA` — "Start your Erasmus journey"

### Files changed
- **New:** `src/components/landing/ErasmusFeaturesSection.tsx`
- **Edit:** `src/components/landing/index.ts` (1 line)
- **Edit:** `src/pages/LandingPage.tsx` (2 lines: import + render)
- **Edit:** `src/lib/i18n/translations.ts` (~40 lines of new keys)

