/**
 * GLSL shaders for the HeroScene3D premium scene.
 *
 * Shader systems:
 *   1. Simplex noise + FBM (3 octaves) — shared utility
 *   2. Organic sphere — vertex displacement + thin-film iridescence
 *   3. Inner glow — backside fresnel shell
 *   4. Particles — point sprites with soft glow
 *   5. Orbital rings — animated torus with pulse
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

  // Fresnel — computed in vertex for efficiency
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 worldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
  vFresnel = pow(1.0 - max(dot(viewDir, worldNormal), 0.0), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const sphereFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying float vFresnel;

// Thin-film interference approximation
// Models the spectral reflectance of a thin dielectric film
vec3 thinFilmIridescence(float cosTheta, float filmThickness) {
  // Optical path difference -> phase shifts per RGB channel
  float delta = filmThickness * cosTheta;
  // Wavelength-dependent phase (R ~650nm, G ~510nm, B ~475nm)
  float phaseR = delta / 0.650;
  float phaseG = delta / 0.510;
  float phaseB = delta / 0.475;
  // Interference — cos^2 gives the intensity pattern
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
  // Warm-tint the iridescence to stay on-brand
  iriColor *= vec3(1.0, 0.65, 0.55);
  baseColor = mix(baseColor, iriColor, 0.35);

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

  // Environment reflection fake
  vec3 reflectDir = reflect(-viewDir, vNormal);
  float envMix = reflectDir.y * 0.5 + 0.5;
  vec3 envColor = mix(vec3(0.06, 0.0, 0.12), vec3(0.3, 0.15, 0.45), envMix);
  finalColor += envColor * fresnel * 0.3;

  // Specular highlight — single key light
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.8));
  vec3 halfVec = normalize(viewDir + lightDir);
  float spec = pow(max(dot(vNormal, halfVec), 0.0), 80.0);
  finalColor += vec3(1.0, 0.92, 0.85) * spec * 0.45;

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

  // Warm coral core glow with subtle pulse
  vec3 warmGlow = vec3(1.0, 0.45, 0.28) * (0.55 + 0.12 * sin(uTime * 0.5));
  warmGlow += vec3(0.35, 0.08, 0.55) * fresnel * 0.35;

  float alpha = fresnel * 0.45;
  gl_FragColor = vec4(warmGlow, alpha);
}
`;

// ── Particles ─────────────────────────────────────────────────────────

export const particleVertexShader = /* glsl */ `
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

  // Gentle mouse repulsion
  vec3 mousePos = vec3(uMouse.x * 4.0, uMouse.y * 4.0, 0.0);
  vec3 diff = pos - mousePos;
  float mouseDist = length(diff);
  if (mouseDist < 2.8) {
    pos += normalize(diff) * (2.8 - mouseDist) * 0.1;
  }

  pos.y -= uScrollProgress * 1.5;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  float pulse = 0.75 + 0.35 * sin(uTime * aSpeed + aPhase);
  float size = aSize * pulse * (1.0 - uScrollProgress * 0.25);
  gl_PointSize = size * (280.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  float dist = length(pos);
  vAlpha = smoothstep(9.0, 2.0, dist) * 0.85;
  vGlow = pulse;
}
`;

export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  float softEdge = 1.0 - smoothstep(0.12, 0.5, d);
  float glow = exp(-d * 3.5) * vGlow;

  vec3 coreColor = vec3(1.0, 0.94, 0.88);
  vec3 midColor = mix(vec3(1.0, 0.45, 0.35), vec3(1.0, 0.72, 0.42), vGlow * 0.5);
  vec3 color = mix(midColor, coreColor, smoothstep(0.15, 0.0, d));

  float alpha = (softEdge * 0.65 + glow * 0.45) * vAlpha;
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
varying float vAngle;
varying vec3 vPosition;
void main() {
  // Travelling pulse along the ring
  float pulse = 0.5 + 0.5 * sin(vAngle * 2.0 + uTime * 1.2);
  // Secondary high-frequency shimmer
  float shimmer = 0.85 + 0.15 * sin(vAngle * 8.0 - uTime * 3.0);

  float alpha = (0.18 + pulse * 0.25) * shimmer;
  vec3 color = uColor * (1.0 + pulse * 0.4);

  gl_FragColor = vec4(color, alpha);
}
`;
