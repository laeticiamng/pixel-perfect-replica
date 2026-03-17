import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ringVertexShader, ringFragmentShader } from './shaders';

// ── Single Ring ───────────────────────────────────────────────────────

interface OrbitalRingProps {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: THREE.Color;
  scrollProgress: number;
  segments: number;
  orbOffset: [number, number];
}

function OrbitalRing({
  radius,
  tilt,
  speed,
  color,
  scrollProgress,
  segments,
  orbOffset,
}: OrbitalRingProps) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: color },
    }),
    [color],
  );

  useFrame((_, delta) => {
    if (!ref.current || !matRef.current) return;
    uniforms.uTime.value += delta;
    ref.current.rotation.z += delta * speed;
    ref.current.position.y = orbOffset[1] - scrollProgress * 2;
    const s = THREE.MathUtils.lerp(1, 0.45, scrollProgress);
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} rotation={tilt} position={[orbOffset[0], orbOffset[1], 0]}>
      <torusGeometry args={[radius, 0.015, 10, segments]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={ringVertexShader}
        fragmentShader={ringFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ── Ring Group ─────────────────────────────────────────────────────────

interface OrbitalRingsProps {
  scrollProgress: number;
  segments: number;
  ringCount: number;
  orbOffset?: [number, number];
}

const RING_CONFIGS = [
  {
    radius: 3.5,
    tilt: [0.3, 0.15, 0] as [number, number, number],
    speed: 0.1,
    color: new THREE.Color(1.0, 0.5, 0.35),
  },
  {
    radius: 4.0,
    tilt: [-0.5, 0.75, 0.25] as [number, number, number],
    speed: -0.07,
    color: new THREE.Color(0.75, 0.35, 0.95),
  },
  {
    radius: 4.6,
    tilt: [0.75, -0.25, -0.15] as [number, number, number],
    speed: 0.05,
    color: new THREE.Color(1.0, 0.78, 0.32),
  },
];

export function OrbitalRings({
  scrollProgress,
  segments,
  ringCount,
  orbOffset = [0.6, 0.2],
}: OrbitalRingsProps) {
  const rings = useMemo(() => RING_CONFIGS.slice(0, ringCount), [ringCount]);

  return (
    <>
      {rings.map((r, i) => (
        <OrbitalRing
          key={i}
          {...r}
          scrollProgress={scrollProgress}
          segments={segments}
          orbOffset={orbOffset}
        />
      ))}
    </>
  );
}
