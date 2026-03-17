/**
 * Inner glow fragment shader — backside fresnel shell with chromatic breathing.
 * Adds depth perception and warm radiance to the orb interior.
 */

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
