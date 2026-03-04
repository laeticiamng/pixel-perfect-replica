

# Plan: Add German (DE) as Third Language Across the Platform

## Scope

The platform currently supports English (EN) and French (FR) via a `{ en: string; fr: string }` pattern across ~2040 lines of translations. Adding German requires changes to:

1. **Translation type & data** — extend every translation entry with `de: string`
2. **Locale type** — add `'de'` to the `Locale` union
3. **LanguageToggle** — add a DE button in both full and compact modes
4. **useTranslation hook** — update the toggle logic for 3 languages
5. **Signal types** — add `de` to `ACTIVITY_LABELS`, `ICEBREAKERS_I18N`
6. **Date locale mapping** — add `de` locale from `date-fns/locale` where `fr`/`enUS` is used (~4 files)
7. **Intl date formatting** — map `'de'` → `'de-DE'` in admin components

## Technical Details

### 1. `src/lib/i18n/translations.ts` (major)
- Line 1: `export type Locale = 'en' | 'fr' | 'de';`
- Every translation entry (600+ keys) gets a `de: '...'` value added
- This is the bulk of the work — all German strings need to be written

### 2. `src/lib/i18n/useTranslation.ts`
- `getNestedValue` return type: `{ en: string; fr: string; de: string }`
- `toggleLocale`: change from binary toggle to cycle `en → fr → de → en`
- Add `isGerman: locale === 'de'` to return value

### 3. `src/components/LanguageToggle.tsx`
- Full mode: add a third "DE" button alongside EN/FR
- Compact mode: cycle through 3 locales instead of toggling between 2

### 4. `src/types/signal.ts`
- `ACTIVITY_LABELS`: add `de` to each entry (e.g. `studying: { en: 'Study', fr: 'Réviser', de: 'Lernen' }`)
- `ICEBREAKERS_I18N`: add `de` arrays for each activity
- `getActivityLabel` / `getIcebreaker`: update type signatures from `'en' | 'fr'` to `Locale`

### 5. Date locale mapping (~4 files)
- `EventDetailPage.tsx`, `SignalHistoryPanel.tsx`, etc.: add `import { de as deLocale } from 'date-fns/locale'` and extend the ternary to handle `'de'`
- `AlertHistoryCard.tsx`, `EventScraperCard.tsx`: add `'de-DE'` mapping for `Intl.DateTimeFormat`

### 6. `deleteAccount.confirmWord`
- Add German confirmation word: `{ en: 'DELETE', fr: 'SUPPRIMER', de: 'LÖSCHEN' }`

## Estimated Size
- **translations.ts**: ~600 keys × add 1 German string each — largest file change
- **6-8 other files**: small targeted edits
- Total: ~10 files modified

## Implementation Order
1. Extend `Locale` type and translation structure with all German strings
2. Update `useTranslation` hook and `LanguageToggle` component
3. Update `signal.ts` types with German icebreakers & activity labels
4. Fix date locale mappings across pages
5. Verify the delete account confirmation word pattern

