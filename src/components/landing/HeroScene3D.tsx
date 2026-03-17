import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import type { ScenePreset } from '@/utils/deviceCapabilities';
import { PerformanceRegressor } from '@/utils/deviceCapabilities';
import { OrganicOrb } from './hero3d/OrganicOrb';
import { ParticleField } from './hero3d/ParticleField';
import { OrbitalRings } from './hero3d/OrbitalRings';
import { HeroPostFX } from './hero3d/HeroPostFX';

// ── Orb offset — slightly right to serve hero text composition ────────
const ORB_OFFSET: [number, number] = [0.6, 0.2];

// ── Scene content ─────────────────────────────────────────────────────

interface SceneContentProps {
  scrollProgress: number;
  preset: ScenePreset;
}

function SceneContent({ scrollProgress, preset }: SceneContentProps) {
  return (
    <>
      {/* Minimal lighting — shaders handle their own illumination */}
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 4, 5]} intensity={1.2} color="#ff6b5a" />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color="#9933dd" />

      <OrganicOrb
        scrollProgress={scrollProgress}
        icosahedronDetail={preset.icosahedronDetail}
        innerGlowDetail={preset.innerGlowDetail}
        enableInnerGlow={preset.enableInnerGlow}
        orbOffset={ORB_OFFSET}
      />

      {preset.particleCount > 0 && (
        <ParticleField scrollProgress={scrollProgress} count={preset.particleCount} />
      )}

      {preset.ringCount > 0 && (
        <OrbitalRings
          scrollProgress={scrollProgress}
          segments={preset.ringSegments}
          ringCount={preset.ringCount}
          orbOffset={ORB_OFFSET}
        />
      )}

      <HeroPostFX preset={preset} />
    </>
  );
}

// ── Visibility & tab-pause ────────────────────────────────────────────

function useScenePaused(): boolean {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const handler = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return paused;
}

// ── ScrollBridge — reads MotionValue per frame without React rerenders ─

function ScrollBridge({
  scrollRef,
  preset,
  paused,
  onRegress,
}: {
  scrollRef: React.RefObject<number>;
  preset: ScenePreset;
  paused: boolean;
  onRegress: () => void;
}) {
  const regressor = useMemo(
    () => new PerformanceRegressor(onRegress, { sampleSize: 90, targetFps: 28 }),
    [onRegress],
  );

  useFrame((_, delta) => {
    if (paused) return;
    // Feed delta (in seconds) to regressor as ms
    regressor.sample(delta * 1000);
  });

  return <SceneContent scrollProgress={scrollRef.current ?? 0} preset={preset} />;
}

// ── Exported wrapper ──────────────────────────────────────────────────

interface HeroScene3DProps {
  scrollProgress: MotionValue<number>;
  preset: ScenePreset;
}

export function HeroScene3D({ scrollProgress, preset: initialPreset }: HeroScene3DProps) {
  const scrollRef = useRef(0);
  const paused = useScenePaused();
  const [degraded, setDegraded] = useState(false);

  // Performance regression: downgrade from full -> lite parameters dynamically
  const preset = useMemo<ScenePreset>(() => {
    if (!degraded) return initialPreset;
    return {
      ...initialPreset,
      particleCount: Math.min(initialPreset.particleCount, 400),
      enableChromaticAberration: false,
      bloomIntensity: Math.min(initialPreset.bloomIntensity, 0.8),
      maxDpr: Math.min(initialPreset.maxDpr, 1.5),
      ringCount: Math.min(initialPreset.ringCount, 2),
    };
  }, [initialPreset, degraded]);

  const onRegress = useCallback(() => {
    setDegraded(true);
  }, []);

  // Read MotionValue outside R3F to avoid React re-renders
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (v: number) => {
      scrollRef.current = v;
    });
    return unsubscribe;
  }, [scrollProgress]);

  return (
    <div
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
      role="presentation"
    >
      <Canvas
        dpr={[1, preset.maxDpr]}
        camera={{ position: [0, 0, 7], fov: 48 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        frameloop={paused ? 'never' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ScrollBridge
          scrollRef={scrollRef}
          preset={preset}
          paused={paused}
          onRegress={onRegress}
        />
      </Canvas>
    </div>
  );
}
