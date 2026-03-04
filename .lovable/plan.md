

# Audit NEARVITY — What's Missing to Be Unique & Revolutionary

## What's Already Strong
- Signal system (green/yellow/red) with real-time geolocation
- Binome session scheduling with quota management & Stripe monetization
- Events with QR check-in, favorites, categories, recurrence
- Real-time connections with Supabase Realtime
- AI icebreakers & session recommendations
- Full i18n (EN/FR/DE), dark/light theme, PWA
- Security: RLS, rate limiting, shadow banning, HIBP password check
- Stats dashboard with charts (recharts)
- Referral system, admin dashboard, reliability scoring
- Desktop sidebar + mobile bottom nav, command palette

---

## Critical Gaps (Functional)

### 1. No Real Messaging System
The MiniChat is limited to 10 messages per interaction. There's no persistent chat, no conversation list, no message notifications. For a social platform, this is the biggest gap. Users meet IRL but have no way to stay in touch digitally.

**Missing:** Conversations page, unread badges, push notifications for messages, message search.

### 2. No User Discovery Beyond Proximity
Users can only find others via the live map radar. There's no way to browse profiles, search by activity/university/interests, or see who's regularly active nearby. The platform is empty when nobody has their signal on.

**Missing:** User directory/discovery feed, "people near your campus" section, activity-based matching.

### 3. No Notification Center
Push subscription exists but there's no in-app notification inbox. Users miss connection requests, session reminders, new messages. The `NotificationsSettingsPage` only configures preferences — there's no notification list.

**Missing:** `/notifications` page with unread count, real-time badge on nav, notification grouping.

### 4. Events Are Isolated from the Map
Events exist on their own page but are invisible on the map. There's no event pin on the interactive map, no "happening now" indicator, no event-signal link.

**Missing:** Event markers on map, "Join nearby event" flow, event proximity alerts.

### 5. No Social Graph / Friend List
Connections exist in the DB but there's no `/connections` or `/friends` page. Users can request connections but can't browse accepted connections, view connection profiles, or initiate chats from the friend list.

**Missing:** Connections list page, mutual activity tracking, "see when friends are active".

---

## UX Gaps

### 6. No Onboarding Tutorial for Core Features
`PostSignupOnboardingPage` exists but the main map features (signal activation, radar vs map view, icebreakers) have no guided tour. First-time users see an empty map with no guidance.

**Missing:** Interactive walkthrough (tooltips/coach marks) on first map visit.

### 7. No Haptic/Audio Feedback for Key Actions
Signal activation, receiving a connection request, nearby user detection — none of these trigger haptic feedback (despite `proximity_vibration` setting existing) or sound.

**Missing:** Vibration API integration, audio cues for proximity alerts.

### 8. Empty States Need More Engagement
When no users are nearby (which is most of the time for a new platform), the empty radar state just shows "Activate your signal". It should show social proof, suggest activities, or encourage inviting friends.

**Missing:** Rich empty states with invite CTA, "be the first" gamification, scheduled session suggestions.

### 9. No Profile Badges Visibility on Map
Verification badges (student verified) exist in DB but aren't shown on map markers or user popup cards.

**Missing:** Badge icons on map markers, trust indicators in UserPopupCard.

---

## Missing Differentiators (to be "revolutionary")

### 10. No Group Formation / Spontaneous Meetup
The platform connects 1-to-1 but has no concept of group activities. If 4 people are studying nearby, there's no "form a group" feature.

**Missing:** Group signal ("I'm looking for 3+ people"), group chat, group activity card.

### 11. No Activity Streaks / Gamification
There's basic stats (interactions, hours active) but no engagement hooks: no streaks, no achievements, no levels, no leaderboards.

**Missing:** Weekly streaks, achievement badges ("Met 10 people", "5-day streak"), campus leaderboard.

### 12. No Smart Time Suggestions
AI recommendations exist but are basic. There's no analysis of "Your campus is most active on Tuesdays at noon" or "3 people usually study here at 2pm".

**Missing:** Campus heatmap by time, "best time to activate" suggestions, historical activity patterns.

### 13. No Campus/Community Hub
The platform is generic — there's no campus-specific content, bulletin board, or community feed. Universities should have their own space.

**Missing:** Campus page, community feed, campus-specific events, university admin tools.

### 14. No Offline Mode / PWA Robustness
PWA is configured but there's no offline data caching, no service worker for background sync, no offline indicator beyond `OfflineBanner`.

**Missing:** Offline-first architecture with cached sessions, queued actions, background sync.

### 15. No Voice/Video Integration
`VoiceIcebreakerButton` exists but appears to only generate audio icebreakers. No voice note capability, no quick audio message.

**Missing:** Voice notes in chat, audio icebreaker playback, walkie-talkie style proximity feature.

---

## Technical Debt

### 16. Type Casting Overuse
`useConnections` uses `(supabase as any)` throughout — indicating the `connections` table may not be in the generated types, or there's a type mismatch.

### 17. Mock Data Still Used in Signal Store
`src/stores/signalStore.ts` uses `generateMockUsers` for nearby users. The real `useActiveSignal` hook exists but the store still references mocks.

### 18. No End-to-End Test Coverage for Core Flows
Test files exist but are mostly unit tests. No real E2E test for: signup → activate signal → see nearby user → send icebreaker → chat.

---

## Priority Implementation Order

```text
Priority 1 (Core social loop):
  [1] Full messaging system with conversations list
  [5] Connections/friends page
  [3] Notification center with unread count

Priority 2 (Engagement & retention):
  [11] Gamification (streaks, achievements)
  [8] Rich empty states with invite CTAs
  [6] First-time user tutorial

Priority 3 (Differentiation):
  [10] Group meetup formation
  [4] Events on map integration
  [2] User discovery beyond proximity
  [12] Smart time/location suggestions

Priority 4 (Polish):
  [13] Campus community hub
  [7] Haptic/audio feedback
  [9] Badges on map markers
  [14] Offline robustness
```

