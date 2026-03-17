/**
 * Particle field fragment shader — multi-layered glow with depth perception.
 * Soft halo + tight core for premium point sprite rendering.
 */

export const particleFragmentShader = /* glsl */ `
varying float vAlpha;
varying float vGlow;
varying float vDepthFade;
varying float vLayer;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;

  // Multi-layered glow: tight core + soft mid + outer halo
  float core = 1.0 - smoothstep(0.0, 0.12, d);
  float midGlow = exp(-d * 4.5) * vGlow;
  float outerHalo = exp(-d * 1.8) * 0.35;

  vec3 coreColor = vec3(1.0, 0.96, 0.92);
  vec3 warmColor = mix(vec3(1.0, 0.45, 0.35), vec3(1.0, 0.72, 0.42), vGlow * 0.5);
  vec3 haloColor = mix(vec3(1.0, 0.55, 0.45), vec3(0.7, 0.4, 0.9), vLayer);

  vec3 color = warmColor;
  color = mix(color, coreColor, core * 0.8);
  color += haloColor * outerHalo * vDepthFade;

  float alpha = (core * 0.5 + midGlow * 0.5 + outerHalo * 0.25) * vAlpha;
  gl_FragColor = vec4(color, alpha);
}
`;
