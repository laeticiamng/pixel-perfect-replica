import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { getDeviceCapabilities, getScenePreset } from './hero3d/deviceCapabilities';

// ── Lazy-load 3D chunk — three/r3f/postprocessing stay off critical path ──
const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D })),
);

// ── Premium CSS fallback ──────────────────────────────────────────────
// Shown when tier === 'off', during Suspense, or prefers-reduced-motion.
// Deliberately JS-free animation: CSS blur orbs + subtle grid.

function CSSFallback({ reducedMotion }: { reducedMotion: boolean }) {
  const animProps = reducedMotion
    ? {}
    : {
        animate: { x: [0, 30, -20, 0], y: [0, -20, 10, 0] },
        transition: { duration: 22, repeat: Infinity, ease: 'linear' as const },
      };

  const animProps2 = reducedMotion
    ? {}
    : {
        animate: { x: [0, -40, 20, 0], y: [0, 30, -10, 0] },
        transition: { duration: 28, repeat: Infinity, ease: 'linear' as const },
      };

  const animProps3 = reducedMotion
    ? {}
    : {
        animate: { x: [0, 20, -30, 0], y: [0, -30, 20, 0] },
        transition: { duration: 34, repeat: Infinity, ease: 'linear' as const },
      };

  const animPropsGlow = reducedMotion
    ? {}
    : {
        animate: { opacity: [0.4, 0.7, 0.4] },
        transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
      };

  return (
    <div
      className="fixed inset-0 overflow-hidden z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
      role="presentation"
    >
      {/* Primary coral orb — large, upper left */}
      <motion.div
        {...animProps}
        className="absolute -top-1/4 left-1/4 w-[800px] h-[600px] bg-coral/15 rounded-full blur-[150px]"
      />
      {/* Purple accent — right side */}
      <motion.div
        {...animProps2}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'hsl(var(--purple-accent) / 0.12)' }}
      />
      {/* Subtle green — bottom left */}
      <motion.div
        {...animProps3}
        className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-signal-green/8 rounded-full blur-[120px]"
      />
      {/* Warm glow — bottom center, pulsing */}
      <motion.div
        {...animPropsGlow}
        className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-coral/8 rounded-full blur-[100px]"
      />
      {/* Central orb mimic — simulates the 3D sphere position */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, hsl(var(--coral) / 0.4), hsl(var(--purple-accent) / 0.2), transparent 70%)',
        }}
      />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────

interface FloatingOrbsProps {
  scrollProgress?: MotionValue<number>;
}

export function FloatingOrbs({ scrollProgress }: FloatingOrbsProps) {
  const capabilities = useMemo(() => getDeviceCapabilities(), []);
  const preset = useMemo(() => getScenePreset(capabilities.tier), [capabilities.tier]);

  // tier === 'off' or no scroll signal → pure CSS fallback
  if (capabilities.tier === 'off' || !scrollProgress) {
    return <CSSFallback reducedMotion={capabilities.prefersReducedMotion} />;
  }

  return (
    <Suspense fallback={<CSSFallback reducedMotion={false} />}>
      <HeroScene3D scrollProgress={scrollProgress} preset={preset} />
    </Suspense>
  );
}
