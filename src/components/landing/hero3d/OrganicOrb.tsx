import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  sphereVertexShader,
  sphereFragmentShader,
  innerGlowVertexShader,
  innerGlowFragmentShader,
} from './shaders';

// ── Organic Sphere mesh ───────────────────────────────────────────────

interface OrganicSphereProps {
  scrollProgress: number;
  detail: number;
  orbOffset: [number, number];
}

function OrganicSphere({ scrollProgress, detail, orbOffset }: OrganicSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const { pointer } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistortion: { value: 1.0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    uniforms.uTime.value += delta;
    uniforms.uDistortion.value = THREE.MathUtils.lerp(
      uniforms.uDistortion.value,
      1.0 + scrollProgress * 0.6,
      0.05,
    );
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
      uniforms.uScrollProgress.value,
      scrollProgress,
      0.05,
    );

    // Smooth mouse tracking — reuse Vector2 to avoid allocations
    mouseTarget.current.set(pointer.x, pointer.y);
    mouseCurrent.current.lerp(mouseTarget.current, 0.03);
    uniforms.uMouse.value.copy(mouseCurrent.current);

    // Slow organic rotation
    meshRef.current.rotation.y += delta * 0.035;
    meshRef.current.rotation.x = mouseCurrent.current.y * 0.25;

    // Position: slightly off-center right to serve hero text composition
    meshRef.current.position.x = orbOffset[0] + mouseCurrent.current.x * 0.25;
    meshRef.current.position.y = orbOffset[1] + mouseCurrent.current.y * 0.15 - scrollProgress * 2;

    const s = THREE.MathUtils.lerp(1, 0.5, scrollProgress);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.8, detail]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={sphereVertexShader}
        fragmentShader={sphereFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Inner Glow shell ──────────────────────────────────────────────────

interface InnerGlowProps {
  scrollProgress: number;
  detail: number;
  orbOffset: [number, number];
}

function InnerGlow({ scrollProgress, detail, orbOffset }: InnerGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;
    uniforms.uTime.value += delta;

    const s = THREE.MathUtils.lerp(1, 0.45, scrollProgress) * 1.5;
    meshRef.current.scale.setScalar(s);
    meshRef.current.position.x = orbOffset[0];
    meshRef.current.position.y = orbOffset[1] - scrollProgress * 2;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.0, detail]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={innerGlowVertexShader}
        fragmentShader={innerGlowFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ── Combined Orb ──────────────────────────────────────────────────────

interface OrganicOrbProps {
  scrollProgress: number;
  icosahedronDetail: number;
  innerGlowDetail: number;
  enableInnerGlow: boolean;
  orbOffset?: [number, number];
}

export function OrganicOrb({
  scrollProgress,
  icosahedronDetail,
  innerGlowDetail,
  enableInnerGlow,
  orbOffset = [0.6, 0.2],
}: OrganicOrbProps) {
  return (
    <>
      {enableInnerGlow && (
        <InnerGlow
          scrollProgress={scrollProgress}
          detail={innerGlowDetail}
          orbOffset={orbOffset}
        />
      )}
      <OrganicSphere
        scrollProgress={scrollProgress}
        detail={icosahedronDetail}
        orbOffset={orbOffset}
      />
    </>
  );
}
