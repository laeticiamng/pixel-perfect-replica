/**
 * Orbital ring shaders — animated torus with dash/gap travelling pattern,
 * sweep pulse, shimmer, and bright hotspot.
 */

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
