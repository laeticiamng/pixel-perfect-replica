/**
 * GLSL shaders for the HeroScene3D premium scene.
 *
 * Shader systems:
 *   1. Simplex noise + FBM (3 octaves) — shared utility
 *   2. Organic sphere — vertex displacement + thin-film iridescence + env reflections
 *   3. Inner glow — backside fresnel shell with chromatic breathing
 *   4. Particles — point sprites with depth fade, orbital drift, layered glow
 *   5. Orbital rings — animated torus with dash/gap travelling pattern
 *   6. Atmosphere — fullscreen depth fog quad
 */

// ── Simplex 3D noise (Ashima) ─────────────────────────────────────────

export const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// FBM — 3 octaves, time-animated
float fbm3(vec3 p, float time) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 3; i++) {
    value += amplitude * snoise(p * frequency + time * (0.25 + float(i) * 0.12));
    frequency *= 2.0;
    amplitude *= 0.48;
  }
  return value;
}
`;

// ── Organic Sphere ────────────────────────────────────────────────────

export const sphereVertexShader = /* glsl */ `
${simplexNoise}
uniform float uTime;
uniform float uDistortion;
uniform float uScrollProgress;
uniform vec2 uMouse;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vDisplacement;
varying float vFresnel;

void main() {
  vec3 pos = position;

  // FBM displacement — 3 octaves, organic breathing
  float noiseFreq = 0.9 + uScrollProgress * 0.3;
  float noiseAmp = 0.35 * uDistortion;
  float noise = fbm3(pos * noiseFreq, uTime) * noiseAmp;

  // Mouse attractor — subtle, directional
  vec3 mouseDir = normalize(vec3(uMouse.x * 2.0, uMouse.y * 2.0, 0.6));
  float mouseDist = length(pos - mouseDir * 1.6);
  float mouseInfluence = smoothstep(1.8, 0.0, mouseDist) * 0.12;
  noise += mouseInfluence;

  // Scroll-driven subtle fragmentation
  float fragmentation = uScrollProgress * uScrollProgress * 0.3;
  vec3 fragmentDir = normalize(pos) * fragmentation * snoise(pos * 2.5 + uTime * 0.5);

  vec3 displaced = pos + normal * noise + fragmentDir;

  vDisplacement = noise;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(displaced, 1.0)).xyz;
  vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

  // Fresnel — computed in vertex for efficiency
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vFresnel = pow(1.0 - max(dot(viewDir, vWorldNormal), 0.0), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const sphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
uniform samplerCube uEnvMap;
uniform float uEnvIntensity;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vDisplacement;
varying float vFresnel;

// Thin-film interference — physically-based spectral model
vec3 thinFilmIridescence(float cosTheta, float filmThickness) {
  float delta = filmThickness * cosTheta;
  // Per-channel wavelength phase (R ~650nm, G ~510nm, B ~475nm)
  float phaseR = delta / 0.650;
  float phaseG = delta / 0.510;
  float phaseB = delta / 0.475;
  return vec3(
    0.5 + 0.5 * cos(phaseR * 6.2831853),
    0.5 + 0.5 * cos(phaseG * 6.2831853),
    0.5 + 0.5 * cos(phaseB * 6.2831853)
  );
}

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = vFresnel;

  // Brand palette
  vec3 coralColor = vec3(1.0, 0.42, 0.32);
  vec3 purpleColor = vec3(0.58, 0.12, 0.82);
  vec3 warmGold = vec3(1.0, 0.78, 0.35);
  vec3 electricBlue = vec3(0.22, 0.52, 1.0);
  vec3 pinkHighlight = vec3(1.0, 0.38, 0.62);

  // Base color — animated blend between coral and purple
  float mixFactor = vDisplacement * 2.8 + 0.5;
  mixFactor += sin(uTime * 0.3 + vNormal.y * 3.5) * 0.2;
  mixFactor = clamp(mixFactor, 0.0, 1.0);
  vec3 baseColor = mix(coralColor, purpleColor, mixFactor);

  // Thin-film iridescence — view-dependent spectral shift
  float cosTheta = max(dot(viewDir, vNormal), 0.0);
  float thickness = 1.8 + sin(uTime * 0.2 + vWorldPosition.y * 2.0) * 0.3
                        + vDisplacement * 0.5;
  vec3 iriColor = thinFilmIridescence(cosTheta, thickness);
  iriColor *= vec3(1.0, 0.65, 0.55);
  baseColor = mix(baseColor, iriColor, 0.35);

  // ── Environment reflections ──
  vec3 worldViewDir = normalize(cameraPosition - vWorldPosition);
  vec3 reflectDir = reflect(-worldViewDir, vWorldNormal);
  // Rotate reflection slowly for living feel
  float ct = cos(uTime * 0.05);
  float st = sin(uTime * 0.05);
  reflectDir = vec3(
    reflectDir.x * ct - reflectDir.z * st,
    reflectDir.y,
    reflectDir.x * st + reflectDir.z * ct
  );
  vec3 envSample = textureCube(uEnvMap, reflectDir).rgb;
  // Blend env into base weighted by fresnel — stronger at edges
  float envWeight = fresnel * uEnvIntensity;
  baseColor = mix(baseColor, baseColor + envSample * 0.6, envWeight);

  // Rim / fresnel lighting — warm glow at silhouette
  float rimPulse = 0.88 + 0.12 * sin(uTime * 1.0);
  vec3 rimColor = mix(coralColor * 1.6, warmGold * 1.2, fresnel * 0.4);
  rimColor += pinkHighlight * pow(fresnel, 3.5) * 0.25;
  vec3 finalColor = mix(baseColor * 0.75, rimColor * rimPulse, fresnel);

  // Additive rim accents
  finalColor += coralColor * fresnel * 0.6;
  finalColor += electricBlue * pow(fresnel, 4.5) * 0.2;
  finalColor += pinkHighlight * pow(fresnel, 7.0) * 0.12;

  // Subsurface scattering approximation
  float sss = pow(cosTheta, 1.5) * 0.12;
  finalColor += coralColor * sss;

  // Specular highlights — dual key lights for cinematic feel
  vec3 lightDir1 = normalize(vec3(1.0, 1.0, 0.8));
  vec3 halfVec1 = normalize(viewDir + lightDir1);
  float spec1 = pow(max(dot(vNormal, halfVec1), 0.0), 80.0);
  finalColor += vec3(1.0, 0.92, 0.85) * spec1 * 0.45;

  vec3 lightDir2 = normalize(vec3(-0.6, 0.3, 0.7));
  vec3 halfVec2 = normalize(viewDir + lightDir2);
  float spec2 = pow(max(dot(vNormal, halfVec2), 0.0), 120.0);
  finalColor += purpleColor * 0.8 * spec2 * 0.25;

  float alpha = 0.94 + fresnel * 0.06;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Inner Glow ────────────────────────────────────────────────────────

export const innerGlowVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const innerGlowFragmentShader = /* glsl */ `
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.0);

  // Chromatic breathing — RGB channels pulse at slightly different rates
  float rPulse = 0.55 + 0.12 * sin(uTime * 0.5);
  float gPulse = 0.55 + 0.08 * sin(uTime * 0.5 + 1.0);
  float bPulse = 0.55 + 0.10 * sin(uTime * 0.5 + 2.2);

  vec3 warmGlow = vec3(1.0 * rPulse, 0.45 * gPulse, 0.28 * bPulse);
  warmGlow += vec3(0.35, 0.08, 0.55) * fresnel * 0.4;
  // Subtle purple corona at the rim
  warmGlow += vec3(0.5, 0.15, 0.75) * pow(fresnel, 3.0) * 0.2;

  float alpha = fresnel * 0.5;
  gl_FragColor = vec4(warmGlow, alpha);
}
`;

// ── Particles ─────────────────────────────────────────────────────────

export const particleVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
attribute float aOrbitRadius;
attribute float aOrbitSpeed;
uniform float uTime;
uniform float uScrollProgress;
uniform vec2 uMouse;
varying float vAlpha;
varying float vGlow;
varying float vDepthFade;

void main() {
  vec3 pos = position;

  // Slow orbital movement — particles spiral gently
  float orbitAngle = uTime * aOrbitSpeed + aPhase;
  pos.x += sin(orbitAngle) * aOrbitRadius * 0.1;
  pos.z += cos(orbitAngle) * aOrbitRadius * 0.1;
  pos.y += sin(orbitAngle * 0.7 + aPhase) * aOrbitRadius * 0.05;

  // Gentle mouse repulsion
  vec3 mousePos = vec3(uMouse.x * 4.0, uMouse.y * 4.0, 0.0);
  vec3 diff = pos - mousePos;
  float mouseDist = length(diff);
  if (mouseDist < 2.8) {
    pos += normalize(diff) * (2.8 - mouseDist) * 0.1;
  }

  pos.y -= uScrollProgress * 1.5;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float pulse = 0.7 + 0.4 * sin(uTime * aSpeed + aPhase);
  float size = aSize * pulse * (1.0 - uScrollProgress * 0.25);
  gl_PointSize = size * (280.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  // Depth-based fade — particles far from camera are more transparent
  float viewDist = -mvPosition.z;
  vDepthFade = smoothstep(12.0, 4.0, viewDist);

  float dist = length(pos);
  vAlpha = smoothstep(9.0, 2.0, dist) * 0.85 * vDepthFade;
  vGlow = pulse;
}
`;

export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vGlow;
varying float vDepthFade;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  // Multi-layered glow: tight core + soft halo
  float core = 1.0 - smoothstep(0.0, 0.15, d);
  float midGlow = exp(-d * 4.0) * vGlow;
  float outerHalo = exp(-d * 2.0) * 0.3;

  vec3 coreColor = vec3(1.0, 0.96, 0.92);
  vec3 warmColor = mix(vec3(1.0, 0.45, 0.35), vec3(1.0, 0.72, 0.42), vGlow * 0.5);
  vec3 haloColor = vec3(1.0, 0.55, 0.45);

  vec3 color = warmColor;
  color = mix(color, coreColor, core * 0.8);
  color += haloColor * outerHalo * vDepthFade;

  float alpha = (core * 0.5 + midGlow * 0.5 + outerHalo * 0.25) * vAlpha;
  gl_FragColor = vec4(color, alpha);
}
`;

// ── Orbital Rings ─────────────────────────────────────────────────────

export const ringVertexShader = /* glsl */ `
varying float vAngle;
varying vec3 vPosition;
void main() {
  vAngle = atan(position.y, position.x);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ringFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uDashCount;
uniform float uGapRatio;
varying float vAngle;
varying vec3 vPosition;
void main() {
  // Normalise angle to [0, 1]
  float angle01 = (vAngle + 3.14159265) / 6.28318530;

  // Travelling dash/gap pattern
  float travelOffset = uTime * 0.08;
  float dashPhase = fract(angle01 * uDashCount + travelOffset);
  float dashMask = smoothstep(0.0, 0.06, dashPhase)
                 * (1.0 - smoothstep(1.0 - uGapRatio, 1.0 - uGapRatio + 0.06, dashPhase));

  // Primary pulse — sweeps around the ring
  float sweep = 0.5 + 0.5 * sin(vAngle * 1.5 + uTime * 1.2);
  // Secondary shimmer
  float shimmer = 0.85 + 0.15 * sin(vAngle * 12.0 - uTime * 4.0);
  // Bright hotspot — a single bright point travelling fast
  float hotspot = pow(0.5 + 0.5 * sin(vAngle + uTime * 2.5), 16.0) * 1.5;

  float intensity = (0.18 + sweep * 0.22 + hotspot * 0.3) * shimmer * dashMask;
  vec3 color = uColor * (1.0 + sweep * 0.4 + hotspot);

  gl_FragColor = vec4(color, intensity);
}
`;

// ── Atmosphere fog fullscreen quad ────────────────────────────────────

export const atmosphereVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const atmosphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
varying vec2 vUv;
void main() {
  // Radial fog centered slightly right (matching orb position)
  vec2 center = vec2(0.58, 0.48);
  float dist = length(vUv - center);

  // Warm atmospheric haze
  vec3 fogColor = mix(
    vec3(0.12, 0.03, 0.08),  // deep purple-black
    vec3(0.25, 0.08, 0.05),  // warm dark coral
    smoothstep(0.0, 0.8, dist)
  );

  // Subtle animated wisps
  float wisp = sin(vUv.x * 6.0 + uTime * 0.15) * sin(vUv.y * 4.0 - uTime * 0.1) * 0.02;

  float fogAlpha = (1.0 - smoothstep(0.0, 0.7, dist)) * 0.06 + wisp;
  fogAlpha *= (1.0 - uScrollProgress * 0.5);

  gl_FragColor = vec4(fogColor, max(fogAlpha, 0.0));
}
`;
