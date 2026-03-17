/**
 * Organic sphere vertex shader — premium FBM displacement.
 * Multi-octave noise with mouse attractor and scroll-driven fragmentation.
 */

import { simplexNoise } from './noise.glsl';

export const orbVertexShader = /* glsl */ `
${simplexNoise}
uniform float uTime;
uniform float uDistortion;
uniform float uScrollProgress;
uniform vec2 uMouse;
uniform int uQuality; // 0 = lite, 1 = full

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vDisplacement;
varying float vFresnel;
varying vec3 vViewDir;

void main() {
  vec3 pos = position;

  // FBM displacement — 4 octaves on full, 3 on lite
  float noiseFreq = 0.9 + uScrollProgress * 0.3;
  float noiseAmp = 0.35 * uDistortion;
  float noise;
  if (uQuality == 1) {
    noise = fbm4(pos * noiseFreq, uTime) * noiseAmp;
  } else {
    noise = fbm3(pos * noiseFreq, uTime) * noiseAmp;
  }

  // Secondary detail layer — adds micro-relief on full quality
  if (uQuality == 1) {
    float detail = snoise(pos * 3.5 + uTime * 0.4) * 0.06 * uDistortion;
    noise += detail;
  }

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

  // View direction — for iridescence in fragment
  vViewDir = normalize(cameraPosition - vWorldPosition);

  // Fresnel — computed in vertex for efficiency
  vFresnel = pow(1.0 - max(dot(vViewDir, vWorldNormal), 0.0), 3.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;
