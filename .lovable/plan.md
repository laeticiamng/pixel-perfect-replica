

# Plan: Complete German (DE) Integration Across Platform

The `errors` and `hooks` sections in translations.ts are already present with DE strings. The remaining gaps are:

## 1. `useTranslation.ts` — 3 fixes
- **Line 42**: Update `getNestedValue` return type from `{ en: string; fr: string }` to `{ en: string; fr: string; de: string }`
- **Line 51**: Add `'de' in current` check
- **Line 120-121**: Change `toggleLocale` from binary to 3-way cycle: `en → fr → de → en`
- **Line 130**: Add `isGerman: locale === 'de'` to return

## 2. `LanguageToggle.tsx` — Add DE button
- Full mode: add third "DE" button with `locale === 'de'` active styling
- Compact mode (line 52): cycle `en → fr → de → en` instead of binary toggle
- Update tooltip text for 3 languages

## 3. Date locale mapping — 15 files
All files using `locale === 'fr' ? fr : enUS` need:
- Add `import { de } from 'date-fns/locale'`
- Change ternary to: `locale === 'fr' ? fr : locale === 'de' ? de : enUS`

Files: `SessionCard.tsx`, `CreateSessionForm.tsx`, `SessionFilters.tsx`, `ChatMessageBubble.tsx`, `EventReminderBanner.tsx`, `MiniChat.tsx`, `SignalHistoryPanel.tsx`, `UserPopupCard.tsx`, `CronJobsMonitor.tsx`, `EventDetailPage.tsx`, `EventsPage.tsx`, `FavoriteEventsPage.tsx`, `PremiumPage.tsx`, `SessionDetailPage.tsx`, `SessionHistoryPage.tsx`

## 4. Intl date formatting — 3 files
Files using `locale === 'fr' ? 'fr-FR' : 'en-US'` need `locale === 'de' ? 'de-DE' :` added:
- `AlertHistoryCard.tsx`, `EventScraperCard.tsx`, `BlockedUsersPage.tsx`, `AdminDashboardPage.tsx`, `PeopleMetPage.tsx`, `ChangelogPage.tsx`, `SessionCheckin.tsx`

## 5. `SignalHistoryPanel.tsx` — pass locale to `getActivityLabel`
Currently calls `getActivityLabel(entry.activity)` without locale param — needs `getActivityLabel(entry.activity, locale)`

## Implementation Order
1. Fix `useTranslation.ts` (type + cycle logic)
2. Update `LanguageToggle.tsx` (3 buttons + cycle)
3. Batch-update all 15 date-fns locale files
4. Batch-update all 7 Intl formatting files
5. Fix `getActivityLabel` call in SignalHistoryPanel

