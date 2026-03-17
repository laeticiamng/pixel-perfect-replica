/**
 * Atmosphere fog fullscreen quad shaders.
 * Radial depth fog with warm tones and animated wisps.
 */

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
