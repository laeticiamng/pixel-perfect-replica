

# Iteration 24 -- Fix last 3 hardcoded 'Anonyme' in hooks

## Audit Summary (All Roles)

After a complete page-by-page review and codebase-wide search, the platform is in excellent shape. BUG-41 and BUG-42 from Iteration 23 are confirmed fixed. **Three remaining hardcoded French strings** were found in hooks:

## Issues Found

### BUG-43: Hardcoded 'Anonyme' in useActiveSignal.ts (LOW)

**File**: `src/hooks/useActiveSignal.ts`, lines 200 and 274

Two occurrences of `'Anonyme'` used as fallback for nearby user names on the radar map.

**Fix**: Import `useTranslation` and replace both with `t('eventsExtra.anonymous')`.

### BUG-44: Hardcoded 'Anonyme' in useInteractions.ts (LOW)

**File**: `src/hooks/useInteractions.ts`, line 133

Fallback profile name for interactions where the target user profile is unavailable.

**Fix**: Import `useTranslation` and replace with `t('eventsExtra.anonymous')`.

---

## All Other Audits: PASS

| Role | Status | Notes |
|------|--------|-------|
| CEO | OK | Core value proposition clear, KPIs tracked, premium monetization active |
| CISO | OK | RLS on all 25+ tables, has_role() checks, rate limiting, shadow-ban automation |
| DPO | OK | Automated cleanup (2h/24h/30d/90d), GDPR export, location fuzzing, cookie consent |
| CDO | OK | Analytics pipeline functional, events tracked, admin dashboard with charts |
| COO | OK | Cron jobs monitored, edge functions rate-limited, automated moderation |
| Head of Design | OK | Responsive on mobile 375px+, dark/light theme, consistent component library |
| Beta Tester | OK | All flows functional, i18n switching works, no console errors |

## Pages Audited (30+): All Clear

No other issues found. Changelog and icebreaker French content are intentional (bilingual content, not UI labels).

---

## Plan

### Step 1: Fix useActiveSignal.ts (2 lines + 1 import)
- Add `import { useTranslation } from '@/lib/i18n';` 
- Add `const { t } = useTranslation();` inside the hook
- Replace `'Anonyme'` on line 200 with `t('eventsExtra.anonymous')`
- Replace `'Anonyme'` on line 274 with `t('eventsExtra.anonymous')`

### Step 2: Fix useInteractions.ts (1 line + 1 import)
- Add `import { useTranslation } from '@/lib/i18n';`
- Add `const { t } = useTranslation();` inside the hook
- Replace `'Anonyme'` on line 133 with `t('eventsExtra.anonymous')`

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/useActiveSignal.ts` | 2 lines: replace hardcoded 'Anonyme' + add i18n import |
| `src/hooks/useInteractions.ts` | 1 line: replace hardcoded 'Anonyme' + add i18n import |

### Estimation
- 2 files, 3 lines modified + 2 imports added
- Minimal risk, mechanical fix
- After this: 0 hardcoded French strings remain in source code

