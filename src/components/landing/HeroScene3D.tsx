import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

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

// FBM - Fractal Brownian Motion (3 octaves)
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

// ── Organic Sphere — vertex shader with FBM + mouse attractor ────────
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
  float noiseFreq = 1.2 + uScrollProgress * 0.5;
  float noiseAmp = 0.35 * uDistortion;

  vec3 pos = position;

  // FBM displacement (3 octaves for richer detail)
  float noise = fbm(pos * noiseFreq, uTime) * noiseAmp;

  // Mouse attractor — local deformation toward cursor
  vec3 mouseDir = vec3(uMouse.x * 2.0, uMouse.y * 2.0, 0.5);
  float mouseDist = length(pos - normalize(mouseDir) * 1.8);
  float mouseInfluence = smoothstep(1.5, 0.0, mouseDist) * 0.15;
  noise += mouseInfluence;

  // Scroll fragmentation — vertices spread outward
  float fragmentation = uScrollProgress * uScrollProgress * 0.4;
  vec3 fragmentDir = normalize(pos) * fragmentation * snoise(pos * 3.0 + uTime);

  vec3 displaced = pos + normal * noise + fragmentDir;
  vDisplacement = noise;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
  vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;

  // Pre-compute fresnel for fragment
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vFresnel = pow(1.0 - max(dot(viewDir, normalize((modelMatrix * vec4(normal, 0.0)).xyz)), 0.0), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

// ── Organic Sphere — fragment with iridescence + rim pulsing ─────────
const sphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying float vFresnel;

// Thin-film iridescence simulation
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

  // Base colors
  vec3 coralColor = vec3(1.0, 0.45, 0.35);
  vec3 purpleColor = vec3(0.55, 0.2, 0.8);
  vec3 goldColor = vec3(1.0, 0.78, 0.35);
  vec3 blueAccent = vec3(0.2, 0.5, 1.0);

  // Mix based on displacement + animated normal
  float mixFactor = vDisplacement * 2.5 + 0.5;
  mixFactor += sin(uTime * 0.4 + vNormal.y * 3.0) * 0.2;
  mixFactor = clamp(mixFactor, 0.0, 1.0);

  vec3 baseColor = mix(coralColor, purpleColor, mixFactor);

  // Iridescence — thin film interference based on view angle
  float iriAngle = dot(viewDir, vNormal);
  float thickness = 1.8 + sin(uTime * 0.3 + vWorldPosition.y * 2.0) * 0.3;
  vec3 iriColor = iridescence(iriAngle, thickness);
  baseColor = mix(baseColor, iriColor * vec3(1.0, 0.6, 0.5), 0.25);

  // Fresnel glow with pulsing rim light
  float rimPulse = 0.8 + 0.2 * sin(uTime * 1.5);
  vec3 fresnelColor = mix(coralColor * 1.6, goldColor, fresnel * 0.6);
  vec3 finalColor = mix(baseColor * 0.55, fresnelColor * rimPulse, fresnel);

  // Emissive bloom contribution
  finalColor += coralColor * fresnel * 0.5;
  finalColor += blueAccent * pow(fresnel, 5.0) * 0.15;

  // Environment reflection fake — cubemap-like gradient
  vec3 reflectDir = reflect(-viewDir, vNormal);
  float envMix = reflectDir.y * 0.5 + 0.5;
  vec3 envColor = mix(vec3(0.05, 0.0, 0.1), vec3(0.3, 0.15, 0.4), envMix);
  finalColor += envColor * fresnel * 0.3;

  float alpha = 0.88 + fresnel * 0.12;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Inner glow sphere shaders ────────────────────────────────────────
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
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);
  vec3 warmGlow = vec3(1.0, 0.5, 0.3) * (0.4 + 0.1 * sin(uTime * 0.8));
  float alpha = fresnel * 0.35;
  gl_FragColor = vec4(warmGlow, alpha);
}
`;

// ── Points particle shaders ─────────────────────────────────────────
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

  // Mouse repulsion
  vec3 mousePos = vec3(uMouse.x * 4.0, uMouse.y * 4.0, 0.0);
  vec3 diff = pos - mousePos;
  float mouseDist = length(diff);
  if (mouseDist < 2.5) {
    pos += normalize(diff) * (2.5 - mouseDist) * 0.15;
  }

  pos.y -= uScrollProgress * 1.8;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // Animated size with individual pulse
  float pulse = 0.8 + 0.4 * sin(uTime * aSpeed + aPhase);
  float size = aSize * pulse * (1.0 - uScrollProgress * 0.3);

  gl_PointSize = size * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  // Distance-based alpha
  float dist = length(pos);
  vAlpha = smoothstep(8.0, 2.0, dist) * 0.7;
  vGlow = pulse;
}
`;

const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vGlow;

void main() {
  // Soft circle with glow
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float softEdge = 1.0 - smoothstep(0.2, 0.5, d);
  float glow = exp(-d * 4.0) * vGlow;

  vec3 color = mix(vec3(1.0, 0.45, 0.35), vec3(1.0, 0.75, 0.4), glow * 0.5);
  float alpha = (softEdge * 0.6 + glow * 0.4) * vAlpha;

  gl_FragColor = vec4(color, alpha);
}
`;

// ── Orbital ring shader ─────────────────────────────────────────────
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
  float pulse = 0.5 + 0.5 * sin(vAngle * 3.0 + uTime * 2.0);
  float alpha = 0.15 + pulse * 0.2;
  vec3 color = uColor * (0.8 + pulse * 0.4);
  gl_FragColor = vec4(color, alpha);
}
`;

// ── Organic Sphere mesh ──────────────────────────────────────────────
function OrganicSphere({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
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

    // Smooth mouse
    mouseCurrent.current.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.03);
    uniforms.uMouse.value.copy(mouseCurrent.current);

    meshRef.current.rotation.y += delta * 0.06;
    meshRef.current.rotation.x = mouseCurrent.current.y * 0.4;
    meshRef.current.position.x = mouseCurrent.current.x * 0.4;
    meshRef.current.position.y = mouseCurrent.current.y * 0.25 - scrollProgress * 2;

    const s = THREE.MathUtils.lerp(1, 0.55, scrollProgress);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.8, 80]} />
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

// ── Inner Glow Sphere ────────────────────────────────────────────────
function InnerGlow({ scrollProgress }: { scrollProgress: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    uniforms.uTime.value += delta;
    if (meshRef.current) {
      const s = THREE.MathUtils.lerp(1, 0.5, scrollProgress) * 1.4;
      meshRef.current.scale.setScalar(s);
      meshRef.current.position.y = -scrollProgress * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 32]} />
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

// ── Points Particle Field ────────────────────────────────────────────
const PARTICLE_COUNT = 1200;

function ParticleField({ scrollProgress }: { scrollProgress: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const { geometry } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + Math.random() * 5.5;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 2.0 + Math.random() * 6.0;
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 2.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    return { geometry: geo };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScrollProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    uniforms.uTime.value += delta;
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(uniforms.uScrollProgress.value, scrollProgress, 0.05);
    uniforms.uMouse.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.03);

    // Slow drift
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      posArr[ix] += (Math.random() - 0.5) * 0.002;
      posArr[ix + 1] += (Math.random() - 0.5) * 0.002;
      posArr[ix + 2] += (Math.random() - 0.5) * 0.002;
      // Attraction toward origin
      posArr[ix] *= 0.9998;
      posArr[ix + 1] *= 0.9998;
      posArr[ix + 2] *= 0.9998;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
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

// ── Connection Lines with glow shader ────────────────────────────────
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

function ConnectionLines({ scrollProgress }: { scrollProgress: number }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const NODE_COUNT = 50;

  const { nodes, velocities } = useMemo(() => {
    const n = new Float32Array(NODE_COUNT * 3);
    const v = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
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
  }, []);

  const maxEdges = NODE_COUNT * NODE_COUNT;
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

    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = i * 3;
      nodes[ix] += velocities[ix];
      nodes[ix + 1] += velocities[ix + 1];
      nodes[ix + 2] += velocities[ix + 2];
      nodes[ix] *= 0.9997;
      nodes[ix + 1] *= 0.9997;
      nodes[ix + 2] *= 0.9997;
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
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

// ── Orbital Rings ────────────────────────────────────────────────────
function OrbitalRing({ radius, tilt, speed, color, scrollProgress }: {
  radius: number; tilt: [number, number, number]; speed: number; color: THREE.Color; scrollProgress: number;
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
    ref.current.position.y = -scrollProgress * 2;
    const s = THREE.MathUtils.lerp(1, 0.5, scrollProgress);
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.008, 8, 128]} />
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

function OrbitalRings({ scrollProgress }: { scrollProgress: number }) {
  const rings = useMemo(() => [
    { radius: 2.6, tilt: [0.3, 0.2, 0] as [number, number, number], speed: 0.15, color: new THREE.Color(1.0, 0.5, 0.35) },
    { radius: 3.0, tilt: [-0.5, 0.8, 0.3] as [number, number, number], speed: -0.1, color: new THREE.Color(0.8, 0.4, 1.0) },
    { radius: 3.5, tilt: [0.8, -0.3, -0.2] as [number, number, number], speed: 0.08, color: new THREE.Color(1.0, 0.75, 0.3) },
  ], []);

  return (
    <>
      {rings.map((r, i) => (
        <OrbitalRing key={i} {...r} scrollProgress={scrollProgress} />
      ))}
    </>
  );
}

// ── Scene content ────────────────────────────────────────────────────
function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 5]} intensity={0.9} color="#ff7363" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#8833cc" />
      <pointLight position={[0, -4, 2]} intensity={0.3} color="#ffbb55" />

      <InnerGlow scrollProgress={scrollProgress} />
      <OrganicSphere scrollProgress={scrollProgress} />
      <ParticleField scrollProgress={scrollProgress} />
      <ConnectionLines scrollProgress={scrollProgress} />
      <OrbitalRings scrollProgress={scrollProgress} />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation
          modulationOffset={0.3}
        />
        <Vignette
          offset={0.3}
          darkness={0.6}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise
          premultiply
          blendFunction={BlendFunction.SOFT_LIGHT}
          opacity={0.25}
        />
      </EffectComposer>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}

// ── Exported wrapper ─────────────────────────────────────────────────
interface HeroScene3DProps {
  scrollProgress: MotionValue<number>;
}

export function HeroScene3D({ scrollProgress }: HeroScene3DProps) {
  const scrollRef = useRef(0);

  const onFrame = useCallback(() => {
    scrollRef.current = scrollProgress.get();
  }, [scrollProgress]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[0.75, 1.5]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ScrollBridge onFrame={onFrame} scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}

// Bridge: reads scroll value each frame and passes to scene
function ScrollBridge({ onFrame, scrollRef }: { onFrame: () => void; scrollRef: React.MutableRefObject<number> }) {
  useFrame(() => {
    onFrame();
  });

  return <SceneContent scrollProgress={scrollRef.current} />;
}
