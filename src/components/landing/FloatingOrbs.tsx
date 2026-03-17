import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

// Detect WebGL + decent hardware
function canRun3D(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    const cores = navigator.hardwareConcurrency ?? 2;
    return cores >= 4;
  } catch {
    return false;
  }
}

const HeroScene3D = lazy(() =>
  import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D }))
);

// CSS fallback (original orbs)
function CSSOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/4 left-1/4 w-[800px] h-[600px] bg-coral/15 rounded-full blur-[150px]" 
      />
      <motion.div
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[130px]"
        style={{ background: 'hsl(var(--purple-accent) / 0.12)' }}
      />
      <motion.div
        animate={{ x: [0, 20, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] bg-signal-green/8 rounded-full blur-[120px]" 
      />
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-coral/8 rounded-full blur-[100px]" 
      />
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

interface FloatingOrbsProps {
  scrollProgress?: MotionValue<number>;
}

export function FloatingOrbs({ scrollProgress }: FloatingOrbsProps) {
  const use3D = useMemo(() => canRun3D(), []);

  if (use3D && scrollProgress) {
    return (
      <Suspense fallback={<CSSOrbs />}>
        <HeroScene3D scrollProgress={scrollProgress} />
      </Suspense>
    );
  }

  return <CSSOrbs />;
}
