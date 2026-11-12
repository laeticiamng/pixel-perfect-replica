# Known Issues

## forwardRef Warnings (React dev mode)

### Status: Won't Fix (third-party)

Several `forwardRef` deprecation warnings appear in the browser console during development. These originate from **third-party libraries** and cannot be resolved in application code:

| Library | Component(s) | Notes |
|---------|-------------|-------|
| `@radix-ui/*` | Dialog, Popover, Tooltip, Select, etc. | Radix UI uses `forwardRef` internally. A fix requires Radix to migrate. Tracked upstream. |
| `react-map-gl` / `mapbox-gl` | `InteractiveMap`, map controls | The library wraps Mapbox GL in React components using `forwardRef`. |
| `framer-motion` | `AnimatePresence`, `motion.*` | Some motion wrappers trigger the warning in strict mode. |
| `cmdk` | Command palette | Uses Radix primitives internally. |

### What we did

- Ensured all **app-level** components that forward refs use the React 19 pattern (ref as prop) where possible.
- Wrapped third-party components to avoid unnecessary ref forwarding when not needed.
- These warnings are **dev-mode only** and do not appear in production builds.

### How to verify

Run a production build (`npm run build`) and confirm zero `forwardRef` warnings in the output.

## Debug registry

### 2026-11-12 — Users signed out when opening /map
- **Symptom**: opening the map redirected signed-in users to /onboarding ("Connexion requise").
- **Cause**: `InteractiveMap` called `supabase.auth.refreshSession()` on every mount. A forced refresh rotates the refresh token; any failure (stale/reused token, multi-tab race) makes the client clear the session.
- **Fix**: use `supabase.auth.getSession()` (auto-refreshes only when needed). Same change in `useSubscription` checkout.
- **Do not retry**: forcing `refreshSession()` before edge function calls — `functions.invoke` already sends the current token.
- **Also seen**: backend briefly unreachable (HTTP 521) while Lovable Cloud was restarting; recovered on its own, no code change.
