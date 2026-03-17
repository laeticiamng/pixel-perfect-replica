import { useRef, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ringVertexShader, ringFragmentShader } from './shaders';

// ── Single Ring ───────────────────────────────────────────────────────

interface OrbitalRingProps {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  color: THREE.Color;
  dashCount: number;
  gapRatio: number;
  scrollRef: RefObject<number>;
  segments: number;
  orbOffset: [number, number];
}

function OrbitalRing({
  radius,
  tilt,
  speed,
  color,
  dashCount,
  gapRatio,
  scrollRef,
  segments,
  orbOffset,
}: OrbitalRingProps) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: color },
      uDashCount: { value: dashCount },
      uGapRatio: { value: gapRatio },
    }),
    [color, dashCount, gapRatio],
  );

  useFrame((_, delta) => {
    if (!ref.current || !matRef.current) return;
    const scroll = scrollRef.current ?? 0;
    uniforms.uTime.value += delta;
    ref.current.rotation.z += delta * speed;
    ref.current.position.y = orbOffset[1] - scroll * 2;
    const s = THREE.MathUtils.lerp(1, 0.45, scroll);
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
  scrollRef: RefObject<number>;
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
    dashCount: 12,
    gapRatio: 0.35,
  },
  {
    radius: 4.0,
    tilt: [-0.5, 0.75, 0.25] as [number, number, number],
    speed: -0.07,
    color: new THREE.Color(0.75, 0.35, 0.95),
    dashCount: 8,
    gapRatio: 0.4,
  },
  {
    radius: 4.6,
    tilt: [0.75, -0.25, -0.15] as [number, number, number],
    speed: 0.05,
    color: new THREE.Color(1.0, 0.78, 0.32),
    dashCount: 16,
    gapRatio: 0.3,
  },
];

export function OrbitalRings({
  scrollRef,
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
          scrollRef={scrollRef}
          segments={segments}
          orbOffset={orbOffset}
        />
      ))}
    </>
  );
}
