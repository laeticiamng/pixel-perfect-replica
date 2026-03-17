import { useRef, useMemo, type RefObject } from 'react';
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
  scrollRef: RefObject<number>;
  detail: number;
  orbOffset: [number, number];
}

function OrganicSphere({ scrollRef, detail, orbOffset }: OrganicSphereProps) {
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
    const scroll = scrollRef.current ?? 0;

    uniforms.uTime.value += delta;
    uniforms.uDistortion.value = THREE.MathUtils.lerp(
      uniforms.uDistortion.value,
      1.0 + scroll * 0.6,
      0.05,
    );
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
      uniforms.uScrollProgress.value,
      scroll,
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
    meshRef.current.position.y = orbOffset[1] + mouseCurrent.current.y * 0.15 - scroll * 2;

    const s = THREE.MathUtils.lerp(1, 0.5, scroll);
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
  scrollRef: RefObject<number>;
  detail: number;
  orbOffset: [number, number];
}

function InnerGlow({ scrollRef, detail, orbOffset }: InnerGlowProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;
    const scroll = scrollRef.current ?? 0;
    uniforms.uTime.value += delta;

    const s = THREE.MathUtils.lerp(1, 0.45, scroll) * 1.5;
    meshRef.current.scale.setScalar(s);
    meshRef.current.position.x = orbOffset[0];
    meshRef.current.position.y = orbOffset[1] - scroll * 2;
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
  scrollRef: RefObject<number>;
  icosahedronDetail: number;
  innerGlowDetail: number;
  enableInnerGlow: boolean;
  orbOffset?: [number, number];
}

export function OrganicOrb({
  scrollRef,
  icosahedronDetail,
  innerGlowDetail,
  enableInnerGlow,
  orbOffset = [0.6, 0.2],
}: OrganicOrbProps) {
  return (
    <>
      {enableInnerGlow && (
        <InnerGlow scrollRef={scrollRef} detail={innerGlowDetail} orbOffset={orbOffset} />
      )}
      <OrganicSphere scrollRef={scrollRef} detail={icosahedronDetail} orbOffset={orbOffset} />
    </>
  );
}
