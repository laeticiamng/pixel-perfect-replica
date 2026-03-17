import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import type { ScenePreset } from './hero3d/types';
import { buildDegradedPreset } from './hero3d/deviceCapabilities';
import { SceneController } from './hero3d/SceneController';

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

// ── Exported wrapper ──────────────────────────────────────────────────

interface HeroScene3DProps {
  scrollProgress: MotionValue<number>;
  preset: ScenePreset;
}

export function HeroScene3D({ scrollProgress, preset: initialPreset }: HeroScene3DProps) {
  const scrollRef = useRef(0);
  const paused = useScenePaused();
  const [degraded, setDegraded] = useState(false);

  const preset = useMemo<ScenePreset>(() => {
    if (!degraded) return initialPreset;
    return buildDegradedPreset(initialPreset);
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
        onCreated={({ gl }) => {
          // Ensure WebGL context loss is handled gracefully
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          });
        }}
      >
        <SceneController
          scrollRef={scrollRef}
          preset={preset}
          paused={paused}
          onRegress={onRegress}
        />
      </Canvas>
    </div>
  );
}
