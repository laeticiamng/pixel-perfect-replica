import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { getDeviceCapabilities, getScenePreset, type DeviceTier } from '@/utils/deviceCapabilities';

// ── Lazy-load the entire 3D chunk ────────────────────────────────────
// React.lazy ensures three / r3f / postprocessing are never on the
// critical path.  The CSS fallback renders instantly while the chunk loads.
const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D }))
);

// ── Premium CSS fallback ─────────────────────────────────────────────
// Shown when:
//  - device tier is "off"
//  - 3D chunk is still loading (Suspense fallback)
//  - prefers-reduced-motion (no 3D, gentle CSS motion only)
//
// Deliberately lightweight: CSS blur orbs + optional subtle grid.
// No requestAnimationFrame, no canvas, no JS animation loop.
function CSSFallback({ reducedMotion }: { reducedMotion: boolean }) {
  // When reduced motion is preferred, show static orbs (no animation)
  const animProps = reducedMotion
    ? {}
    : {
        animate: { x: [0, 30, -20, 0], y: [0, -20, 10, 0] },
        transition: { duration: 20, repeat: Infinity, ease: 'linear' as const },
      };

  const animProps2 = reducedMotion
    ? {}
    : {
        animate: { x: [0, -40, 20, 0], y: [0, 30, -10, 0] },
        transition: { duration: 25, repeat: Infinity, ease: 'linear' as const },
      };

  const animProps3 = reducedMotion
    ? {}
    : {
        animate: { x: [0, 20, -30, 0], y: [0, -30, 20, 0] },
        transition: { duration: 30, repeat: Infinity, ease: 'linear' as const },
      };

  const animProps4 = reducedMotion
    ? {}
    : {
        animate: { opacity: [0.5, 0.8, 0.5] },
        transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' as const },
      };

  return (
    <div
      className="fixed inset-0 overflow-hidden z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
      role="presentation"
    >
      <motion.div
        {...animProps}
        className="absolute -top-1/4 left-1/4 w-[800px] h-[600px] bg-coral/15 rounded-full blur-[150px]"
      />
      <motion.div
        {...animProps2}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'hsl(var(--purple-accent) / 0.12)' }}
      />
      <motion.div
        {...animProps3}
        className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-signal-green/8 rounded-full blur-[120px]"
      />
      <motion.div
        {...animProps4}
        className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-coral/8 rounded-full blur-[100px]"
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// ── Orchestrator ─────────────────────────────────────────────────────
interface FloatingOrbsProps {
  scrollProgress?: MotionValue<number>;
}

export function FloatingOrbs({ scrollProgress }: FloatingOrbsProps) {
  // Evaluate device capabilities once at mount
  const capabilities = useMemo(() => getDeviceCapabilities(), []);
  const preset = useMemo(() => getScenePreset(capabilities.tier), [capabilities.tier]);

  // tier === 'off' → pure CSS fallback, zero 3D overhead
  if (capabilities.tier === 'off' || !scrollProgress) {
    return <CSSFallback reducedMotion={capabilities.prefersReducedMotion} />;
  }

  // tier === 'full' | 'lite' → lazy-load 3D with CSS as Suspense fallback
  return (
    <Suspense fallback={<CSSFallback reducedMotion={false} />}>
      <HeroScene3D scrollProgress={scrollProgress} preset={preset} />
    </Suspense>
  );
}
