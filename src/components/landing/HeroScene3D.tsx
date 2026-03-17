import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import type { ScenePreset } from '@/utils/deviceCapabilities';

// ── Lazy-import postprocessing only when needed ─────────────────────
// These are imported at module level but tree-shaken per-preset in the component.
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// ── Simplex 3D noise (GLSL) ──────────────────────────────────────────
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p, float time) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency + time * (0.3 + float(i) * 0.15));
    frequency *= 2.1;
    amplitude *= 0.45;
  }
  return value;
}
`;

// ── Organic Sphere — vertex shader ────────────────────────────────────
const sphereVertexShader = /* glsl */ `
${simplexNoise}
uniform float uTime;
uniform float uDistortion;
uniform float uScrollProgress;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying float vFresnel;

void main() {
  float noiseFreq = 1.0 + uScrollProgress * 0.4;
  float noiseAmp = 0.4 * uDistortion;
  vec3 pos = position;

  float noise = fbm(pos * noiseFreq, uTime) * noiseAmp;

  vec3 mouseDir = vec3(uMouse.x * 2.0, uMouse.y * 2.0, 0.5);
  float mouseDist = length(pos - normalize(mouseDir) * 1.8);
  float mouseInfluence = smoothstep(1.5, 0.0, mouseDist) * 0.15;
  noise += mouseInfluence;

  float fragmentation = uScrollProgress * uScrollProgress * 0.4;
  vec3 fragmentDir = normalize(pos) * fragmentation * snoise(pos * 3.0 + uTime);

  vec3 displaced = pos + normal * noise + fragmentDir;
  vDisplacement = noise;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
  vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;

  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vFresnel = pow(1.0 - max(dot(viewDir, normalize((modelMatrix * vec4(normal, 0.0)).xyz)), 0.0), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ── Organic Sphere — fragment shader ──────────────────────────────────
const sphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying float vFresnel;

vec3 iridescence(float angle, float thickness) {
  float phase = angle * thickness * 6.2831853;
  return vec3(
    0.5 + 0.5 * cos(phase),
    0.5 + 0.5 * cos(phase - 2.094),
    0.5 + 0.5 * cos(phase - 4.188)
  );
}

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = vFresnel;

  vec3 coralColor = vec3(1.0, 0.42, 0.32);
  vec3 purpleColor = vec3(0.6, 0.15, 0.85);
  vec3 goldColor = vec3(1.0, 0.75, 0.3);
  vec3 blueAccent = vec3(0.25, 0.55, 1.0);
  vec3 pinkHighlight = vec3(1.0, 0.35, 0.6);

  float mixFactor = vDisplacement * 3.0 + 0.5;
  mixFactor += sin(uTime * 0.35 + vNormal.y * 4.0) * 0.25;
  mixFactor = clamp(mixFactor, 0.0, 1.0);

  vec3 baseColor = mix(coralColor, purpleColor, mixFactor);

  float iriAngle = dot(viewDir, vNormal);
  float thickness = 2.2 + sin(uTime * 0.25 + vWorldPosition.y * 2.5) * 0.4;
  vec3 iriColor = iridescence(iriAngle, thickness);
  baseColor = mix(baseColor, iriColor * vec3(1.0, 0.55, 0.5), 0.4);

  float rimPulse = 0.85 + 0.15 * sin(uTime * 1.2);
  vec3 fresnelColor = mix(coralColor * 1.8, goldColor * 1.3, fresnel * 0.5);
  fresnelColor += pinkHighlight * pow(fresnel, 3.0) * 0.3;
  vec3 finalColor = mix(baseColor * 0.7, fresnelColor * rimPulse, fresnel);

  finalColor += coralColor * fresnel * 0.7;
  finalColor += blueAccent * pow(fresnel, 4.0) * 0.25;
  finalColor += pinkHighlight * pow(fresnel, 6.0) * 0.15;

  float sss = pow(max(dot(viewDir, vNormal), 0.0), 1.5) * 0.15;
  finalColor += coralColor * sss;

  vec3 reflectDir = reflect(-viewDir, vNormal);
  float envMix = reflectDir.y * 0.5 + 0.5;
  vec3 envColor = mix(vec3(0.08, 0.0, 0.15), vec3(0.35, 0.18, 0.5), envMix);
  finalColor += envColor * fresnel * 0.35;

  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.8));
  vec3 halfVec = normalize(viewDir + lightDir);
  float spec = pow(max(dot(vNormal, halfVec), 0.0), 64.0);
  finalColor += vec3(1.0, 0.9, 0.8) * spec * 0.5;

  float alpha = 0.92 + fresnel * 0.08;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Inner glow sphere shaders ─────────────────────────────────────────
const innerGlowVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const innerGlowFragment = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 1.8);
  vec3 warmGlow = vec3(1.0, 0.45, 0.28) * (0.6 + 0.15 * sin(uTime * 0.6));
  warmGlow += vec3(0.4, 0.1, 0.6) * fresnel * 0.3;
  float alpha = fresnel * 0.5;
  gl_FragColor = vec4(warmGlow, alpha);
}
`;

// ── Particle shaders ──────────────────────────────────────────────────
const particleVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
uniform float uTime;
uniform float uScrollProgress;
uniform vec2 uMouse;
varying float vAlpha;
varying float vGlow;

void main() {
  vec3 pos = position;

  vec3 mousePos = vec3(uMouse.x * 4.0, uMouse.y * 4.0, 0.0);
  vec3 diff = pos - mousePos;
  float mouseDist = length(diff);
  if (mouseDist < 2.5) {
    pos += normalize(diff) * (2.5 - mouseDist) * 0.15;
  }

  pos.y -= uScrollProgress * 1.8;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float pulse = 0.8 + 0.4 * sin(uTime * aSpeed + aPhase);
  float size = aSize * pulse * (1.0 - uScrollProgress * 0.3);
  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  float dist = length(pos);
  vAlpha = smoothstep(8.0, 2.5, dist) * 0.9;
  vGlow = pulse;
}
`;

const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float softEdge = 1.0 - smoothstep(0.15, 0.5, d);
  float glow = exp(-d * 3.0) * vGlow;
  vec3 coreColor = vec3(1.0, 0.92, 0.85);
  vec3 midColor = mix(vec3(1.0, 0.45, 0.35), vec3(1.0, 0.7, 0.4), vGlow * 0.5);
  vec3 color = mix(midColor, coreColor, smoothstep(0.15, 0.0, d));
  float alpha = (softEdge * 0.7 + glow * 0.5) * vAlpha;
  gl_FragColor = vec4(color, alpha);
}
`;

// ── Ring shaders ──────────────────────────────────────────────────────
const ringVertexShader = /* glsl */ `
varying float vAngle;
void main() {
  vAngle = atan(position.y, position.x);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ringFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
varying float vAngle;
void main() {
  float pulse = 0.5 + 0.5 * sin(vAngle * 3.0 + uTime * 1.5);
  float alpha = 0.25 + pulse * 0.3;
  vec3 color = uColor * (1.0 + pulse * 0.5);
  gl_FragColor = vec4(color, alpha);
}
`;

// ── Connection line shaders ───────────────────────────────────────────
const lineVertexShader = /* glsl */ `
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const lineFragmentShader = /* glsl */ `
uniform float uTime;
varying float vAlpha;
void main() {
  float pulse = 0.6 + 0.4 * sin(uTime * 3.0 + vAlpha * 10.0);
  vec3 color = vec3(1.0, 0.5, 0.4);
  gl_FragColor = vec4(color, vAlpha * pulse * 0.18);
}
`;

// =====================================================================
// COMPONENTS
// =====================================================================

// ── Organic Sphere mesh ───────────────────────────────────────────────
function OrganicSphere({ scrollProgress, detail }: { scrollProgress: number; detail: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistortion: { value: 1.0 },
    uScrollProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    uniforms.uTime.value += delta;
    uniforms.uDistortion.value = THREE.MathUtils.lerp(uniforms.uDistortion.value, 1.0 + scrollProgress * 0.8, 0.05);
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(uniforms.uScrollProgress.value, scrollProgress, 0.05);

    // Smooth mouse – reuse Vector2 instead of allocating each frame
    mouseTarget.current.set(pointer.x, pointer.y);
    mouseCurrent.current.lerp(mouseTarget.current, 0.03);
    uniforms.uMouse.value.copy(mouseCurrent.current);

    meshRef.current.rotation.y += delta * 0.04;
    meshRef.current.rotation.x = mouseCurrent.current.y * 0.3;
    meshRef.current.position.x = 0.6 + mouseCurrent.current.x * 0.3;
    meshRef.current.position.y = 0.2 + mouseCurrent.current.y * 0.2 - scrollProgress * 2;

    const s = THREE.MathUtils.lerp(1, 0.55, scrollProgress);
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

// ── Inner Glow Sphere ─────────────────────────────────────────────────
function InnerGlow({ scrollProgress, detail }: { scrollProgress: number; detail: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    uniforms.uTime.value += delta;
    if (meshRef.current) {
      const s = THREE.MathUtils.lerp(1, 0.5, scrollProgress) * 1.6;
      meshRef.current.scale.setScalar(s);
      meshRef.current.position.x = 0.6;
      meshRef.current.position.y = 0.2 - scrollProgress * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2.0, detail]} />
      <shaderMaterial
        ref={ref}
        vertexShader={innerGlowVertex}
        fragmentShader={innerGlowFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ── Points Particle Field ─────────────────────────────────────────────
function ParticleField({ scrollProgress, count }: { scrollProgress: number; count: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.2 + Math.random() * 4.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 4.0 + Math.random() * 10.0;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 1.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    return geo;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  // Reusable vector for mouse lerp
  const mouseTarget = useRef(new THREE.Vector2(0, 0));

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    uniforms.uTime.value += delta;
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(uniforms.uScrollProgress.value, scrollProgress, 0.05);
    mouseTarget.current.set(pointer.x, pointer.y);
    uniforms.uMouse.value.lerp(mouseTarget.current, 0.03);

    // Slow drift – only update every 3 frames to save CPU
    if (Math.floor(uniforms.uTime.value * 60) % 3 === 0) {
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        posArr[ix] += (Math.random() - 0.5) * 0.002;
        posArr[ix + 1] += (Math.random() - 0.5) * 0.002;
        posArr[ix + 2] += (Math.random() - 0.5) * 0.002;
        posArr[ix] *= 0.9998;
        posArr[ix + 1] *= 0.9998;
        posArr[ix + 2] *= 0.9998;
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

// ── Connection Lines ──────────────────────────────────────────────────
function ConnectionLines({ scrollProgress, nodeCount }: { scrollProgress: number; nodeCount: number }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { nodes, velocities } = useMemo(() => {
    const n = new Float32Array(nodeCount * 3);
    const v = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 3;
      n[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      n[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      n[i * 3 + 2] = r * Math.cos(phi);
      v[i * 3] = (Math.random() - 0.5) * 0.004;
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }
    return { nodes: n, velocities: v };
  }, [nodeCount]);

  const maxEdges = nodeCount * nodeCount;
  const positions = useMemo(() => new Float32Array(maxEdges * 6), [maxEdges]);
  const alphas = useMemo(() => new Float32Array(maxEdges * 2), [maxEdges]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    return g;
  }, [positions, alphas]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!lineRef.current || !matRef.current) return;
    uniforms.uTime.value += delta;
    const threshold = 3.2;
    let idx = 0;
    let alphaIdx = 0;

    for (let i = 0; i < nodeCount; i++) {
      const ix = i * 3;
      nodes[ix] += velocities[ix];
      nodes[ix + 1] += velocities[ix + 1];
      nodes[ix + 2] += velocities[ix + 2];
      nodes[ix] *= 0.9997;
      nodes[ix + 1] *= 0.9997;
      nodes[ix + 2] *= 0.9997;
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i * 3] - nodes[j * 3];
        const dy = nodes[i * 3 + 1] - nodes[j * 3 + 1];
        const dz = nodes[i * 3 + 2] - nodes[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          const a = 1.0 - dist / threshold;
          positions[idx++] = nodes[i * 3];
          positions[idx++] = nodes[i * 3 + 1] - scrollProgress * 1.5;
          positions[idx++] = nodes[i * 3 + 2];
          positions[idx++] = nodes[j * 3];
          positions[idx++] = nodes[j * 3 + 1] - scrollProgress * 1.5;
          positions[idx++] = nodes[j * 3 + 2];
          alphas[alphaIdx++] = a;
          alphas[alphaIdx++] = a;
        }
      }
    }

    for (let k = idx; k < positions.length; k++) positions[k] = 0;
    for (let k = alphaIdx; k < alphas.length; k++) alphas[k] = 0;

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
    geometry.setDrawRange(0, idx / 3);
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={lineVertexShader}
        fragmentShader={lineFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// ── Orbital Ring ──────────────────────────────────────────────────────
function OrbitalRing({ radius, tilt, speed, color, scrollProgress, segments }: {
  radius: number; tilt: [number, number, number]; speed: number;
  color: THREE.Color; scrollProgress: number; segments: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: color },
  }), [color]);

  useFrame((_, delta) => {
    if (!ref.current || !matRef.current) return;
    uniforms.uTime.value += delta;
    ref.current.rotation.z += delta * speed;
    ref.current.position.y = 0.2 - scrollProgress * 2;
    const s = THREE.MathUtils.lerp(1, 0.5, scrollProgress);
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} rotation={tilt} position={[0.6, 0.2, 0]}>
      <torusGeometry args={[radius, 0.018, 12, segments]} />
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

function OrbitalRings({ scrollProgress, segments }: { scrollProgress: number; segments: number }) {
  const rings = useMemo(() => [
    { radius: 3.4, tilt: [0.3, 0.2, 0] as [number, number, number], speed: 0.12, color: new THREE.Color(1.0, 0.5, 0.35) },
    { radius: 3.9, tilt: [-0.5, 0.8, 0.3] as [number, number, number], speed: -0.08, color: new THREE.Color(0.8, 0.4, 1.0) },
    { radius: 4.5, tilt: [0.8, -0.3, -0.2] as [number, number, number], speed: 0.06, color: new THREE.Color(1.0, 0.75, 0.3) },
  ], []);

  return (
    <>
      {rings.map((r, i) => (
        <OrbitalRing key={i} {...r} scrollProgress={scrollProgress} segments={segments} />
      ))}
    </>
  );
}

// ── Adaptive postprocessing ───────────────────────────────────────────
function AdaptivePostProcessing({ preset }: { preset: ScenePreset }) {
  // Only mount effects that the preset allows
  const hasAnyEffect = preset.enableBloom || preset.enableChromaticAberration || preset.enableVignette;
  if (!hasAnyEffect) return null;

  return (
    <EffectComposer multisampling={0}>
      {preset.enableBloom && (
        <Bloom
          intensity={preset.bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      )}
      {preset.enableChromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation
          modulationOffset={0.25}
        />
      )}
      {preset.enableVignette && (
        <Vignette
          offset={0.25}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
}

// ── Scene content ─────────────────────────────────────────────────────
function SceneContent({ scrollProgress, preset }: { scrollProgress: number; preset: ScenePreset }) {
  return (
    <>
      {/* Reduced from 4 point lights to 2 + ambient. The shader already
          computes its own specular & fresnel, so 4 lights were redundant. */}
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 5]} intensity={1.4} color="#ff6b5a" />
      <pointLight position={[-5, -2, 3]} intensity={0.6} color="#9933dd" />

      <InnerGlow scrollProgress={scrollProgress} detail={preset.innerGlowDetail} />
      <OrganicSphere scrollProgress={scrollProgress} detail={preset.icosahedronDetail} />
      {preset.particleCount > 0 && (
        <ParticleField scrollProgress={scrollProgress} count={preset.particleCount} />
      )}
      <OrbitalRings scrollProgress={scrollProgress} segments={preset.ringSegments} />
      {preset.enableConnectionLines && preset.connectionNodeCount > 0 && (
        <ConnectionLines scrollProgress={scrollProgress} nodeCount={preset.connectionNodeCount} />
      )}

      <AdaptivePostProcessing preset={preset} />
    </>
  );
}

// ── Visibility & tab-pause hook ───────────────────────────────────────
function useScenePaused() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return paused;
}

// ── ScrollBridge — reads MotionValue per frame ────────────────────────
function ScrollBridge({
  onFrame,
  scrollRef,
  preset,
  paused,
}: {
  onFrame: () => void;
  scrollRef: React.MutableRefObject<number>;
  preset: ScenePreset;
  paused: boolean;
}) {
  useFrame(() => {
    if (paused) return;
    onFrame();
  });

  return <SceneContent scrollProgress={scrollRef.current} preset={preset} />;
}

// ── Exported wrapper ──────────────────────────────────────────────────
interface HeroScene3DProps {
  scrollProgress: MotionValue<number>;
  preset: ScenePreset;
}

export function HeroScene3D({ scrollProgress, preset }: HeroScene3DProps) {
  const scrollRef = useRef(0);
  const paused = useScenePaused();

  const onFrame = useCallback(() => {
    scrollRef.current = scrollProgress.get();
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
          antialias: false, // Saves ~20% fill rate; bloom masks aliasing
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        frameloop={paused ? 'never' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ScrollBridge
          onFrame={onFrame}
          scrollRef={scrollRef}
          preset={preset}
          paused={paused}
        />
      </Canvas>
    </div>
  );
}
