import { PropsWithChildren, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyCapabilityToPreset, resolveRouteExperience } from './experience-orchestrator';
import { useCapabilityStore } from './capability-store';
import { useExperienceStore } from './experience-store';
import { useSceneRuntimeStore } from './scene-runtime-store';

function ExperienceRouteSync() {
  const location = useLocation();
  const syncCapabilities = useCapabilityStore((state) => state.syncCapabilities);
  const tier = useCapabilityStore((state) => state.tier);
  const prefersReducedMotion = useCapabilityStore((state) => state.prefersReducedMotion);
  const reducedExperience = useCapabilityStore((state) => state.reducedExperience);
  const audioEnabled = useCapabilityStore((state) => state.audioEnabled);
  const setRouteExperience = useExperienceStore((state) => state.setRouteExperience);
  const setMotionMode = useExperienceStore((state) => state.setMotionMode);
  const setReducedExperience = useExperienceStore((state) => state.setReducedExperience);
  const setAudioEnabled = useExperienceStore((state) => state.setAudioEnabled);
  const setActiveScene = useSceneRuntimeStore((state) => state.setActiveScene);

  useEffect(() => {
    syncCapabilities();
  }, [syncCapabilities]);

  useEffect(() => {
    const preset = applyCapabilityToPreset(resolveRouteExperience(location.pathname), {
      tier,
      prefersReducedMotion,
      reducedExperience,
    });

    setRouteExperience(location.pathname, preset);
    setMotionMode(prefersReducedMotion ? 'reduced' : tier === 'off' ? 'off' : 'full');
    setReducedExperience(reducedExperience);
    setAudioEnabled(audioEnabled);
    setActiveScene(preset.sceneMode);
  }, [
    audioEnabled,
    location.pathname,
    prefersReducedMotion,
    reducedExperience,
    setActiveScene,
    setAudioEnabled,
    setMotionMode,
    setReducedExperience,
    setRouteExperience,
    tier,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncCapabilities();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', syncCapabilities);

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', syncCapabilities);
    };
  }, [syncCapabilities]);

  return null;
}

export function ExperienceProvider({ children }: PropsWithChildren) {
  return (
    <>
      <ExperienceRouteSync />
      {children}
    </>
  );
}
