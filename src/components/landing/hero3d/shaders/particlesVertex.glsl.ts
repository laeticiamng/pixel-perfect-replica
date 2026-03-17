/**
 * Particle field vertex shader — orbital drift, mouse repulsion, depth fade.
 * Point sprites with variable size and life-cycle pulsing.
 */

export const particleVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
attribute float aOrbitRadius;
attribute float aOrbitSpeed;
attribute float aLayer; // 0.0 = near, 1.0 = far — controls glow intensity
uniform float uTime;
uniform float uScrollProgress;
uniform vec2 uMouse;
varying float vAlpha;
varying float vGlow;
varying float vDepthFade;
varying float vLayer;

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
  vLayer = aLayer;
}
`;
