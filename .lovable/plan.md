
# Audit Multi-Roles - EASY v1.7.x (Iteration 23)

## Audit Summary

After a page-by-page review of all 30+ pages and their components, the platform is in excellent shape. Two remaining bugs were identified:

---

## Issues Found

### BUG-41: Hardcoded French date format in EventsPage (LOW)

**File**: `src/pages/EventsPage.tsx`, line 194

The date formatting uses `'PPP a HH:mm'` which always shows the French "a" separator, regardless of locale. The EventDetailPage (line 203) already has the correct locale-aware implementation.

**Current**:
```
format(new Date(event.starts_at), 'PPP à HH:mm', { locale: dateLocale })
```

**Fix**:
```
format(new Date(event.starts_at), locale === 'fr' ? 'PPP à HH:mm' : "PPP 'at' HH:mm", { locale: dateLocale })
```

### BUG-42: Hardcoded French fallback name in PeopleMetPage (LOW)

**File**: `src/pages/PeopleMetPage.tsx`, line 37

The fallback name for unknown users is hardcoded as `'Anonyme'` (French). A translation key already exists: `eventsExtra.anonymous`.

**Current**:
```
firstName: interaction.target_profile?.first_name || 'Anonyme',
```

**Fix**:
```
firstName: interaction.target_profile?.first_name || t('eventsExtra.anonymous'),
```

---

## Pages Audited (All Clear)

| Page | Status | Notes |
|------|--------|-------|
| LandingPage | OK | Fully i18n, responsive |
| OnboardingPage | OK | Login/Signup with OAuth, rate limiting |
| PostSignupOnboardingPage | OK | 3-step onboarding flow |
| MapPage | OK | Radar, signals, filters, emergency |
| ProfilePage | OK | Stats, QR code, menu sections |
| EditProfilePage | OK | Avatar upload, bio, validation |
| SettingsPage | OK | Theme, language, admin access |
| EventsPage | BUG-41 | Date format hardcoded |
| EventDetailPage | OK | Locale-aware date format |
| BinomePage | OK | Tabs, quota, community stats |
| SessionDetailPage | OK | Chat, check-in, feedback |
| PremiumPage | OK | Stripe integration, pricing |
| StatisticsPage | OK | Charts, breakdowns |
| PeopleMetPage | BUG-42 | Hardcoded 'Anonyme' |
| HelpPage | OK | Searchable FAQ |
| FeedbackPage | OK | Star rating, rate limited |
| ReportPage | OK | 4 types, sanitization |
| ChangelogPage | OK | French content accepted |
| AdminDashboardPage | OK | Role-checked, charts |
| All other pages | OK | i18n compliant |

---

## Security Audit (CISO)

- All tables have RLS policies enforced
- Admin access verified via `has_role()` RPC (SECURITY DEFINER)
- Rate limiting on reveals, reports, feedback, edge functions
- Shadow-ban auto-applied after 3 reports in 24h
- Secrets properly managed (Stripe, Mapbox, Resend, etc.)
- No client-side admin checks

## GDPR Audit (DPO)

- Automated cleanup: signals (2h), rate limits (24h), locations (30d), analytics (90d)
- GDPR export available in settings
- Account deletion with cascade
- Location fuzzing (100m precision)
- Cookie consent banner present

---

## Plan

### Step 1: Fix EventsPage date format (1 line)
Replace line 194 with locale-aware format string.

### Step 2: Fix PeopleMetPage fallback name (1 line)
Replace `'Anonyme'` with `t('eventsExtra.anonymous')` on line 37.

### Files to modify

| File | Change |
|------|--------|
| `src/pages/EventsPage.tsx` | 1 line: locale-aware date format |
| `src/pages/PeopleMetPage.tsx` | 1 line: use translation key for fallback name |

### Estimation
- 2 files, 2 lines modified
- Minimal risk, mechanical fix
