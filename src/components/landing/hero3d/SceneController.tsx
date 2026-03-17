/**
 * SceneController — orchestrates the 3D scene content.
 *
 * Renders all visual subsystems (orb, particles, rings, atmosphere,
 * camera breathing) based on the current ScenePreset. Also houses
 * the PerfMonitor that feeds the PerformanceRegressor.
 */

import { useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerformanceRegressor } from './deviceCapabilities';
import { OrganicOrb } from './OrganicOrb';
import { ParticleField } from './ParticleField';
import { OrbitalRings } from './OrbitalRings';
import { HeroPostFX } from './HeroPostFX';
import { AtmosphereFog } from './AtmosphereFog';
import { CameraBreathing } from './CameraBreathing';
import { ORB_OFFSET } from './types';
import type { ScenePreset } from './types';

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

// ── Scene content ─────────────────────────────────────────────────────

interface SceneControllerProps {
  scrollRef: RefObject<number>;
  preset: ScenePreset;
  paused: boolean;
  onRegress: () => void;
}

export function SceneController({ scrollRef, preset, paused, onRegress }: SceneControllerProps) {
  return (
    <>
      {/* Performance monitoring */}
      <PerfMonitor paused={paused} onRegress={onRegress} />

      {/* Minimal lighting — shaders handle their own illumination */}
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 4, 5]} intensity={1.2} color="#ff6b5a" />
      <pointLight position={[-5, -2, 3]} intensity={0.5} color="#9933dd" />

      {/* Atmospheric fog layer */}
      {preset.enableAtmosphere && <AtmosphereFog scrollRef={scrollRef} />}

      {/* Camera breathing */}
      {preset.enableCameraBreathing && <CameraBreathing />}

      {/* Hero orb — central visual element */}
      <OrganicOrb
        scrollRef={scrollRef}
        icosahedronDetail={preset.icosahedronDetail}
        innerGlowDetail={preset.innerGlowDetail}
        enableInnerGlow={preset.enableInnerGlow}
        orbOffset={ORB_OFFSET}
        quality={preset.icosahedronDetail >= 64 ? 'full' : 'lite'}
      />

      {/* Particle field */}
      {preset.particleCount > 0 && (
        <ParticleField scrollRef={scrollRef} count={preset.particleCount} />
      )}

      {/* Orbital rings */}
      {preset.ringCount > 0 && (
        <OrbitalRings
          scrollRef={scrollRef}
          segments={preset.ringSegments}
          ringCount={preset.ringCount}
          orbOffset={ORB_OFFSET}
        />
      )}

      {/* Post-processing */}
      <HeroPostFX preset={preset} />
    </>
  );
}
