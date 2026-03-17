import { useRef, useMemo, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from './shaders';

interface ParticleFieldProps {
  scrollRef: RefObject<number>;
  count: number;
}

/**
 * Premium particle field using Points + BufferGeometry.
 * Supports up to 1200 particles on high-end desktop without per-mesh overhead.
 * Drift updates are batched every 3 frames to reduce CPU cost.
 */
export function ParticleField({ scrollRef, count }: ParticleFieldProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const frameCounter = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Layered distribution: some near the orb, some further out
      const r = 3.0 + Math.random() * 5.0;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      // Variable sizes — smaller particles far out, larger near center
      sizes[i] = 3.0 + Math.random() * 9.0;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.25 + Math.random() * 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  const mouseTarget = useRef(new THREE.Vector2(0, 0));

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    const scroll = scrollRef.current ?? 0;

    uniforms.uTime.value += delta;
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
      uniforms.uScrollProgress.value,
      scroll,
      0.05,
    );
    mouseTarget.current.set(pointer.x, pointer.y);
    uniforms.uMouse.value.lerp(mouseTarget.current, 0.03);

    // Slow brownian drift — update every 3 frames to save CPU
    frameCounter.current++;
    if (frameCounter.current % 3 === 0) {
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        posArr[ix] += (Math.random() - 0.5) * 0.0015;
        posArr[ix + 1] += (Math.random() - 0.5) * 0.0015;
        posArr[ix + 2] += (Math.random() - 0.5) * 0.0015;
        // Gentle pull toward origin to prevent drift
        posArr[ix] *= 0.9999;
        posArr[ix + 1] *= 0.9999;
        posArr[ix + 2] *= 0.9999;
      }
      geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
