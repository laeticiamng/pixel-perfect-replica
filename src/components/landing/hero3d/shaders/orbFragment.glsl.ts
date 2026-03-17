/**
 * Organic sphere fragment shader — premium iridescence + dual specular + inner glow.
 * View-dependent thin-film interference, environment reflections, rim lighting,
 * subsurface scattering, and double specular highlights for cinematic quality.
 */

export const orbFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScrollProgress;
uniform samplerCube uEnvMap;
uniform float uEnvIntensity;
uniform int uQuality; // 0 = lite, 1 = full
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying float vDisplacement;
varying float vFresnel;
varying vec3 vViewDir;

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
  vec3 deepViolet = vec3(0.35, 0.08, 0.55);

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

  // Enhanced iridescence modulation based on camera angle (full only)
  if (uQuality == 1) {
    float angleShift = dot(vViewDir, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
    iriColor *= mix(vec3(1.0, 0.55, 0.45), vec3(0.45, 0.55, 1.0), angleShift);
  } else {
    iriColor *= vec3(1.0, 0.65, 0.55);
  }
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

  // ── Rim / fresnel lighting — warm glow at silhouette with breathing ──
  float rimPulse = 0.85 + 0.15 * sin(uTime * 0.8);
  vec3 rimColor = mix(coralColor * 1.6, warmGold * 1.2, fresnel * 0.4);
  rimColor += pinkHighlight * pow(fresnel, 3.5) * 0.25;
  // Breathing rim — gently oscillates intensity
  float rimBreath = 0.9 + 0.1 * sin(uTime * 0.6 + 1.5);
  vec3 finalColor = mix(baseColor * 0.75, rimColor * rimPulse * rimBreath, fresnel);

  // Additive rim accents
  finalColor += coralColor * fresnel * 0.6;
  finalColor += electricBlue * pow(fresnel, 4.5) * 0.2;
  finalColor += pinkHighlight * pow(fresnel, 7.0) * 0.12;

  // ── Inner glow contribution — deep violet core glow ──
  float innerGlow = pow(cosTheta, 2.5) * 0.15;
  finalColor += deepViolet * innerGlow;
  // Warm core radiance
  finalColor += coralColor * pow(cosTheta, 4.0) * 0.08;

  // ── Subsurface scattering approximation ──
  float sss = pow(cosTheta, 1.5) * 0.12;
  finalColor += coralColor * sss;

  // ── Specular highlights — dual key lights for cinematic feel ──
  vec3 lightDir1 = normalize(vec3(1.0, 1.0, 0.8));
  vec3 halfVec1 = normalize(viewDir + lightDir1);
  float spec1 = pow(max(dot(vNormal, halfVec1), 0.0), 80.0);
  finalColor += vec3(1.0, 0.92, 0.85) * spec1 * 0.45;

  vec3 lightDir2 = normalize(vec3(-0.6, 0.3, 0.7));
  vec3 halfVec2 = normalize(viewDir + lightDir2);
  float spec2 = pow(max(dot(vNormal, halfVec2), 0.0), 120.0);
  finalColor += purpleColor * 0.8 * spec2 * 0.25;

  // ── Third specular (fill light) — full quality only ──
  if (uQuality == 1) {
    vec3 lightDir3 = normalize(vec3(0.0, -0.8, 0.6));
    vec3 halfVec3 = normalize(viewDir + lightDir3);
    float spec3 = pow(max(dot(vNormal, halfVec3), 0.0), 60.0);
    finalColor += warmGold * 0.3 * spec3 * 0.2;
  }

  float alpha = 0.94 + fresnel * 0.06;
  gl_FragColor = vec4(finalColor, alpha);
}
`;
