import { useRef, useMemo, useEffect, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  sphereVertexShader,
  sphereFragmentShader,
  innerGlowVertexShader,
  innerGlowFragmentShader,
} from './shaders';

// ── Procedural environment cubemap ───────────────────────────────────
// Generates a small (64×64 per face) gradient cubemap at init.
// Warm coral/purple/gold tones that match the brand palette.

function createProceduralEnvMap(renderer: THREE.WebGLRenderer): THREE.CubeTexture {
  const size = 64;
  const cubeRT = new THREE.WebGLCubeRenderTarget(size);
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);

  // Build a tiny scene with gradient spheres for the env
  const envScene = new THREE.Scene();

  // Large gradient sphere (sky dome)
  const skyGeo = new THREE.SphereGeometry(50, 16, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vWorldPos;
      void main() {
        vec3 dir = normalize(vWorldPos);
        // Vertical gradient: deep purple at bottom, warm dark at top
        float y = dir.y * 0.5 + 0.5;
        vec3 bottom = vec3(0.08, 0.01, 0.12);
        vec3 mid = vec3(0.15, 0.04, 0.08);
        vec3 top = vec3(0.06, 0.02, 0.04);
        vec3 color = mix(bottom, mid, smoothstep(0.0, 0.5, y));
        color = mix(color, top, smoothstep(0.5, 1.0, y));
        // Warm accent on the right side (key light direction)
        float rightAccent = pow(max(dot(dir, normalize(vec3(1.0, 0.3, 0.5))), 0.0), 4.0);
        color += vec3(0.35, 0.12, 0.06) * rightAccent;
        // Cool accent on the left
        float leftAccent = pow(max(dot(dir, normalize(vec3(-0.7, -0.2, 0.3))), 0.0), 3.0);
        color += vec3(0.06, 0.04, 0.18) * leftAccent;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  envScene.add(new THREE.Mesh(skyGeo, skyMat));

  cubeCamera.update(renderer, envScene);

  // Clean up
  skyGeo.dispose();
  skyMat.dispose();

  return cubeRT.texture;
}

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
  const { pointer, gl } = useThree();

  // Generate env cubemap once
  const envMap = useMemo(() => createProceduralEnvMap(gl), [gl]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistortion: { value: 1.0 },
      uScrollProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uEnvMap: { value: envMap },
      uEnvIntensity: { value: 0.65 },
    }),
    [envMap],
  );

  // Clean up cubemap on unmount
  useEffect(() => {
    return () => {
      envMap.dispose();
    };
  }, [envMap]);

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
