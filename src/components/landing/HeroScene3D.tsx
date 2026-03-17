import { useRef, useCallback, useEffect, useState, useMemo, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import type { ScenePreset } from '@/utils/deviceCapabilities';
import { PerformanceRegressor } from '@/utils/deviceCapabilities';
import { OrganicOrb } from './hero3d/OrganicOrb';
import { ParticleField } from './hero3d/ParticleField';
import { OrbitalRings } from './hero3d/OrbitalRings';
import { HeroPostFX } from './hero3d/HeroPostFX';
import { AtmosphereFog } from './hero3d/AtmosphereFog';
import { CameraBreathing } from './hero3d/CameraBreathing';

// ── Orb offset — slightly right to serve hero text composition ────────
const ORB_OFFSET: [number, number] = [0.6, 0.2];

// ── Scene content ─────────────────────────────────────────────────────
// All children read scrollRef.current inside their own useFrame —
// no React re-renders needed for scroll-driven animation.

interface SceneContentProps {
  scrollRef: RefObject<number>;
  preset: ScenePreset;
}

function SceneContent({ scrollRef, preset }: SceneContentProps) {
  return (
    <>
      {/* Minimal lighting — shaders handle their own illumination */}
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 4, 5]} intensity={1.2} color="#ff6b5a" />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color="#9933dd" />

      {/* Atmospheric fog layer */}
      {preset.enableAtmosphere && <AtmosphereFog scrollRef={scrollRef} />}

      {/* Camera breathing */}
      {preset.enableCameraBreathing && <CameraBreathing />}

      <OrganicOrb
        scrollRef={scrollRef}
        icosahedronDetail={preset.icosahedronDetail}
        innerGlowDetail={preset.innerGlowDetail}
        enableInnerGlow={preset.enableInnerGlow}
        orbOffset={ORB_OFFSET}
      />

      {preset.particleCount > 0 && (
        <ParticleField scrollRef={scrollRef} count={preset.particleCount} />
      )}

      {preset.ringCount > 0 && (
        <OrbitalRings
          scrollRef={scrollRef}
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

// ── PerfMonitor — samples frame deltas for regression detection ───────

function PerfMonitor({ paused, onRegress }: { paused: boolean; onRegress: () => void }) {
  const regressor = useMemo(
    () => new PerformanceRegressor(onRegress, { sampleSize: 90, targetFps: 28 }),
    [onRegress],
  );

  useFrame((_, delta) => {
    if (paused) return;
    regressor.sample(delta * 1000);
  });

  return null;
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

  // Performance regression: downgrade dynamically when FPS drops
  const preset = useMemo<ScenePreset>(() => {
    if (!degraded) return initialPreset;
    return {
      ...initialPreset,
      particleCount: Math.min(initialPreset.particleCount, 400),
      enableChromaticAberration: false,
      enableDepthOfField: false,
      bloomIntensity: Math.min(initialPreset.bloomIntensity, 0.8),
      maxDpr: Math.min(initialPreset.maxDpr, 1.5),
      ringCount: Math.min(initialPreset.ringCount, 2),
    };
  }, [initialPreset, degraded]);

  const onRegress = useCallback(() => {
    setDegraded(true);
  }, []);

  // Read MotionValue into ref — no React re-renders, fresh every frame
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
        <PerfMonitor paused={paused} onRegress={onRegress} />
        <SceneContent scrollRef={scrollRef} preset={preset} />
      </Canvas>
    </div>
  );
}
