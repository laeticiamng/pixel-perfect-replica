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
