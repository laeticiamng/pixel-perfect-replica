# Hero 3D — QA Checklist & Performance Budgets

## Visual Validation

- [ ] Landing loads without black screen on desktop Chrome, Firefox, Safari
- [ ] Hero orb displays with organic displacement, iridescence visible
- [ ] Orb does not block or reduce readability of H1, subtitle, badge, CTA
- [ ] Particles give depth perception, not flat dust
- [ ] Orbital rings visible on Retina and non-Retina displays
- [ ] No aliasing artifacts on ring edges
- [ ] Post-processing bloom is cinematic, not blown out
- [ ] Vignette does not darken text area

## Interaction

- [ ] Mouse tracking on orb responds smoothly (no jitter)
- [ ] Scroll-driven fade/scale works without glitch
- [ ] Window resize does not break canvas or cause artifacts
- [ ] Tab switch → return: scene resumes without flicker
- [ ] CTA buttons remain clickable with canvas active (pointer-events: none on canvas)

## Presets & Fallback

- [ ] `full` preset: 1200 particles, 3 rings, bloom + CA + DOF + vignette
- [ ] `lite` preset: 400 particles, 2 rings, bloom + vignette only
- [ ] `off` preset: CSS fallback, no canvas rendered
- [ ] Runtime degradation: FPS drop triggers automatic downgrade
- [ ] `prefers-reduced-motion`: no 3D scene, CSS fallback
- [ ] Data saver mode: no 3D scene, CSS fallback
- [ ] WebGL unavailable: CSS fallback renders correctly

## Accessibility

- [ ] Canvas has `aria-hidden="true"` and `role="presentation"`
- [ ] `pointer-events: none` on canvas wrapper
- [ ] `prefers-reduced-motion` disables all animations (CSS fallback is static)
- [ ] Text remains readable at all viewport sizes
- [ ] Keyboard navigation unaffected by canvas

## Performance Budgets

| Metric | Target |
|--------|--------|
| Desktop full preset FPS | >= 55 fps sustained |
| Desktop lite preset FPS | >= 55 fps sustained |
| Mobile lite preset FPS | >= 30 fps sustained |
| 3D bundle chunk size | < 200 KB gzipped |
| Time to first paint (hero text) | < 1.5s |
| Lazy-load 3D init | < 3s after FCP |

## Module Architecture

```
hero3d/
├── types.ts              # Shared types & constants
├── deviceCapabilities.ts # Tier detection, presets, perf regressor
├── SceneController.tsx   # Scene orchestrator
├── OrganicOrb.tsx        # Main sphere + inner glow
├── ParticleField.tsx     # Point cloud particles
├── OrbitalRings.tsx      # Animated torus rings
├── HeroPostFX.tsx        # Post-processing stack
├── AtmosphereFog.tsx     # Fullscreen fog quad
├── CameraBreathing.tsx   # Lissajous camera animation
├── index.ts              # Barrel export
├── shaders/
│   ├── index.ts
│   ├── noise.glsl.ts
│   ├── orbVertex.glsl.ts
│   ├── orbFragment.glsl.ts
│   ├── innerGlowFragment.glsl.ts
│   ├── particlesVertex.glsl.ts
│   ├── particlesFragment.glsl.ts
│   ├── ringFragment.glsl.ts
│   └── atmosphereFog.glsl.ts
└── dev/
    └── HeroSceneDiagnostic.tsx
```
