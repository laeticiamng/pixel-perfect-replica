import { useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
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
`;

// ── Organic Sphere shaders ───────────────────────────────────────────
const sphereVertexShader = /* glsl */ `
${simplexNoise}
uniform float uTime;
uniform float uDistortion;
uniform float uScrollProgress;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  float noiseFreq = 1.2 + uScrollProgress * 0.5;
  float noiseAmp = 0.35 * uDistortion;
  
  vec3 pos = position;
  float noise = snoise(pos * noiseFreq + uTime * 0.3) * noiseAmp;
  noise += snoise(pos * noiseFreq * 2.0 + uTime * 0.5) * noiseAmp * 0.4;
  
  vec3 displaced = pos + normal * noise;
  vDisplacement = noise;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const sphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  // View direction for fresnel
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
  
  // Coral base: hsl(8, 100%, 65%) → rgb(1.0, 0.45, 0.35)
  vec3 coralColor = vec3(1.0, 0.45, 0.35);
  // Purple accent: hsl(270, 60%, 50%) → rgb(0.55, 0.2, 0.8)
  vec3 purpleColor = vec3(0.55, 0.2, 0.8);
  // Gold highlight
  vec3 goldColor = vec3(1.0, 0.75, 0.3);
  
  // Mix based on displacement + normal direction
  float mixFactor = vDisplacement * 2.0 + 0.5;
  mixFactor += sin(uTime * 0.5 + vNormal.y * 3.0) * 0.15;
  mixFactor = clamp(mixFactor, 0.0, 1.0);
  
  vec3 baseColor = mix(coralColor, purpleColor, mixFactor);
  
  // Fresnel glow - bright coral edge
  vec3 fresnelColor = mix(coralColor * 1.5, goldColor, fresnel * 0.5);
  vec3 finalColor = mix(baseColor * 0.6, fresnelColor, fresnel);
  
  // Emissive boost for bloom
  finalColor += coralColor * fresnel * 0.4;
  
  // Subtle alpha for ethereal feel
  float alpha = 0.85 + fresnel * 0.15;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Organic Sphere mesh ──────────────────────────────────────────────
function OrganicSphere({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const mouseCurrent = useRef(new THREE.Vector2(0, 0));
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistortion: { value: 1.0 },
    uScrollProgress: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    if (!materialRef.current || !meshRef.current) return;

    uniforms.uTime.value += delta;
    uniforms.uDistortion.value = THREE.MathUtils.lerp(uniforms.uDistortion.value, 1.0 + scrollProgress * 0.8, 0.05);
    uniforms.uScrollProgress.value = THREE.MathUtils.lerp(uniforms.uScrollProgress.value, scrollProgress, 0.05);

    // Mouse parallax
    mouseTarget.current.set(pointer.x * 0.3, pointer.y * 0.3);
    mouseCurrent.current.lerp(mouseTarget.current, 0.03);
    meshRef.current.rotation.y += delta * 0.08;
    meshRef.current.rotation.x = mouseCurrent.current.y * 0.5;
    meshRef.current.position.x = mouseCurrent.current.x * 0.5;
    meshRef.current.position.y = mouseCurrent.current.y * 0.3 - scrollProgress * 2;
    
    // Scale down on scroll
    const s = THREE.MathUtils.lerp(1, 0.6, scrollProgress);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.8, 64]} />
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

// ── Instanced Particles ──────────────────────────────────────────────
const PARTICLE_COUNT = 600;

function ParticleField({ scrollProgress }: { scrollProgress: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const { positions, velocities, sizes } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    const sz = new Float32Array(PARTICLE_COUNT);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute in a spherical shell around the centre
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 5;
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      vel[i * 3] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
      
      sz[i] = 0.01 + Math.random() * 0.035;
    }
    return { positions: pos, velocities: vel, sizes: sz };
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      // Brownian drift
      positions[ix] += velocities[ix];
      positions[ix + 1] += velocities[ix + 1];
      positions[ix + 2] += velocities[ix + 2];
      
      // Slight attraction toward centre
      positions[ix] += -positions[ix] * 0.0002;
      positions[ix + 1] += -positions[ix + 1] * 0.0002;
      positions[ix + 2] += -positions[ix + 2] * 0.0002;
      
      dummy.position.set(positions[ix], positions[ix + 1] - scrollProgress * 1.5, positions[ix + 2]);
      const s = sizes[i] * (1 - scrollProgress * 0.4);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#ff7363" transparent opacity={0.6} />
    </instancedMesh>
  );
}

// ── Connection Lines ─────────────────────────────────────────────────
function ConnectionLines({ scrollProgress }: { scrollProgress: number }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const { nodes, velocities } = useMemo(() => {
    const count = 40;
    const n = new Float32Array(count * 3);
    const v = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 3;
      n[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      n[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      n[i * 3 + 2] = r * Math.cos(phi);
      v[i * 3] = (Math.random() - 0.5) * 0.005;
      v[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      v[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return { nodes: n, velocities: v };
  }, []);

  const positions = useMemo(() => new Float32Array(40 * 40 * 6), []);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame(() => {
    if (!lineRef.current) return;
    const count = 40;
    const threshold = 3.0;
    let idx = 0;

    // Drift nodes
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      nodes[ix] += velocities[ix];
      nodes[ix + 1] += velocities[ix + 1];
      nodes[ix + 2] += velocities[ix + 2];
      nodes[ix] += -nodes[ix] * 0.0003;
      nodes[ix + 1] += -nodes[ix + 1] * 0.0003;
      nodes[ix + 2] += -nodes[ix + 2] * 0.0003;
    }

    // Build edges
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = nodes[i * 3] - nodes[j * 3];
        const dy = nodes[i * 3 + 1] - nodes[j * 3 + 1];
        const dz = nodes[i * 3 + 2] - nodes[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          positions[idx++] = nodes[i * 3];
          positions[idx++] = nodes[i * 3 + 1] - scrollProgress * 1.5;
          positions[idx++] = nodes[i * 3 + 2];
          positions[idx++] = nodes[j * 3];
          positions[idx++] = nodes[j * 3 + 1] - scrollProgress * 1.5;
          positions[idx++] = nodes[j * 3 + 2];
        }
      }
    }

    // Zero out rest
    for (let k = idx; k < positions.length; k++) positions[k] = 0;

    geometry.attributes.position.needsUpdate = true;
    geometry.setDrawRange(0, idx / 3);
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#ff7363" transparent opacity={0.12} />
    </lineSegments>
  );
}

// ── Scene content ────────────────────────────────────────────────────
function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ff7363" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#8833cc" />
      
      <OrganicSphere scrollProgress={scrollProgress} />
      <ParticleField scrollProgress={scrollProgress} />
      <ConnectionLines scrollProgress={scrollProgress} />
      
      <EffectComposer>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
          radialModulation={false}
          modulationOffset={0.0}
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

  // Subscribe to framer-motion value
  const onFrame = useCallback(() => {
    scrollRef.current = scrollProgress.get();
  }, [scrollProgress]);

  // We read the motion value each frame inside the canvas via a bridge component
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
