# Security Audit — March 2026

> Date: 2026-03-21
> Scope: Edge Functions, SQL migrations, RLS policies, frontend security

---

## Executive Summary

Comprehensive audit of 17 Edge Functions, 50+ SQL migrations, and frontend code.
**No critical vulnerabilities found.** Two medium-severity issues fixed in this audit.

| Category | Secure | Minor | Medium | Critical |
|----------|--------|-------|--------|----------|
| Edge Functions (17) | 15 | 1 | 1 | 0 |
| SQL Functions | - | 0 | 1 | 0 |
| Frontend | All clear | - | - | - |

---

## Issues Found & Fixed

### SEC-01: `join_group_signal()` race condition (MEDIUM — FIXED)

**File:** `supabase/migrations/20260304215219_f9abdc9d-de5e-4757-960c-15cdab8b1c93.sql:185`

The function reads `max_participants` and counts current members without row-level locking. Concurrent `join_group_signal()` calls can exceed the max_participants limit.

**Fix:** New migration `20260321170000_fix_join_group_signal_race_condition.sql` adds:
- `SELECT ... FOR UPDATE` on the group_signals row to serialize concurrent joins
- `auth.uid()` NULL check for explicit authentication enforcement
- Duplicate membership check to prevent double-joining
- NULL check for non-existent group signals

This mirrors the fix previously applied to `join_session()` in migration `20260213100000`.

### SEC-02: `apply-referral` missing shared auth & rate limiting (MEDIUM — FIXED)

**File:** `supabase/functions/apply-referral/index.ts`

The function implemented custom JWT validation instead of using the shared `authenticateRequest()` helper, and had no rate limiting — allowing brute-force referral code guessing.

**Fix:** Rewrote to use:
- `authenticateRequest()` from `_shared/auth.ts` for consistent auth
- `checkRateLimit()` with 5 requests/minute limit
- `validateBody()` with Zod schema for input validation
- `errorResponse()` for consistent error formatting

---

## Audit Results by Category

### Edge Functions (17 total)

All functions verified for: authentication, rate limiting, input validation, CORS, OPTIONS handling, secret protection, error sanitization.

| Function | Auth | Rate Limit | Validation | Status |
|----------|------|------------|------------|--------|
| ai-assistant | `authenticateRequest()` | 20/min (icebreaker), 10/min (recs) | Zod | Secure |
| apply-referral | `authenticateRequest()` | 5/min | Zod | **Fixed** |
| check-subscription | `authenticateRequest()` | Yes | Yes | Secure |
| confirm-session-purchase | `authenticateRequest()` | Yes | Yes | Secure |
| create-checkout | `authenticateRequest()` | Yes | Yes | Secure |
| customer-portal | `authenticateRequest()` | Yes | Yes | Secure |
| firecrawl-map | `authenticateRequest()` + `requireAdmin()` | 10/min | Zod | Secure |
| firecrawl-scrape | `authenticateRequest()` + `requireAdmin()` | 10/min | Zod | Secure |
| get-mapbox-token | `authenticateRequest()` | Yes | — | Secure |
| log-client-error | Anonymous + auth | Yes | Yes | Secure |
| notifications | Custom admin auth | — | — | Acceptable |
| purchase-session | `authenticateRequest()` | 5/min | Zod | Secure |
| recommend-locations | `authenticateRequest()` | 10/min | Zod | Secure |
| scrape-events | `authenticateRequest()` + `requireAdmin()` | 5/min | Zod | Secure |
| send-contact | `authenticateRequest()` | Yes | Yes | Secure |
| system | Custom auth (cron + admin) | — | Type-safe routing | Acceptable |
| voice-icebreaker | `authenticateRequest()` | 5/min | Zod | Secure |

### SQL / RLS Policies

- All tables have RLS enabled
- Overly permissive `USING (true)` policies from initial migration were corrected in later migrations
- SECURITY DEFINER functions properly validate `auth.uid()` and admin roles
- No SQL injection vectors (all use parameterized queries via PL/pgSQL)
- `join_group_signal()` race condition **fixed** in this audit

### Frontend Security

- **XSS:** DOMPurify used for sanitization (`src/lib/sanitize.ts`). Only `dangerouslySetInnerHTML` usage is in shadcn chart.tsx for CSS generation (safe — no user input).
- **eval/Function:** None found in source code
- **Hardcoded secrets:** None found. Supabase keys properly loaded from environment variables.
- **localStorage:** Used for Zustand persistence (settings, locale) — no sensitive tokens stored directly
- **Auth tokens:** Managed by Supabase SDK (not manually stored in localStorage)
- **Input validation:** Zod schemas for auth forms (`src/lib/validation.ts`)
- **Error reporting:** `errorReporter.ts` sends structured errors without sensitive data

---

## Remaining Recommendations

1. **Stripe webhook:** Implement `STRIPE_WEBHOOK_SECRET` validation when available (R3 from prior audit)
2. **MFA/2FA:** Consider implementing for admin accounts
3. **`system` function:** Consider migrating user-initiated admin actions to use shared `authenticateRequest()` for consistency
4. **`notifications` function:** Consider using JWT validation instead of token string comparison for admin auth
5. **Log centralization:** External log aggregation service for production monitoring

---

## Prior Audit Reference

See `docs/SECURITY_RELEASE.md` for the February 2026 audit with SOC2 checklist (34/38 controls, 89%).
