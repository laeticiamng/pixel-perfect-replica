import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { ScenePreset } from './types';

interface HeroPostFXProps {
  preset: ScenePreset;
}

/**
 * Adaptive postprocessing stack — cinematic but controlled.
 *
 * Guard rails:
 * - Bloom threshold prevents glow from burning text
 * - Vignette darkness capped to avoid dark edges
 * - DOF only on full preset with confirmed perf
 * - CA uses radial modulation (subtle, not full-screen)
 * - Haze controlled by enableHaze flag
 *
 * Effects are conditionally mounted based on the device tier preset.
 */
export function HeroPostFX({ preset }: HeroPostFXProps) {
  const hasAnyEffect =
    preset.enableBloom || preset.enableChromaticAberration || preset.enableVignette || preset.enableDepthOfField;

  if (!hasAnyEffect) return null;

  return (
    <EffectComposer multisampling={0}>
      {preset.enableBloom && (
        <Bloom
          intensity={preset.bloomIntensity}
          luminanceThreshold={preset.bloomThreshold}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
      )}
      {preset.enableDepthOfField && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.06}
          bokehScale={2.5}
          height={480}
        />
      )}
      {preset.enableChromaticAberration && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
          radialModulation
          modulationOffset={0.3}
        />
      )}
      {preset.enableVignette && (
        <Vignette
          offset={0.3}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
    </EffectComposer>
  );
}
