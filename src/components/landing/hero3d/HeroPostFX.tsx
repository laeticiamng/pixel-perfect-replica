import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import type { ScenePreset } from '@/utils/deviceCapabilities';

interface HeroPostFXProps {
  preset: ScenePreset;
}

/**
 * Adaptive postprocessing stack.
 * Effects are conditionally mounted based on the device tier preset.
 * Keeps the text overlay readable — bloom is cinematic, not blown out.
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
