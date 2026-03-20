import type { ExperienceEvent } from '@/experience/core/experience-types';
import { useExperienceStore } from '@/experience/core/experience-store';
import { useSceneRuntimeStore } from '@/experience/core/scene-runtime-store';

export function useExperienceEvent() {
  const dispatchExperienceEvent = useExperienceStore((state) => state.dispatchExperienceEvent);
  const queueTrigger = useSceneRuntimeStore((state) => state.queueTrigger);

  return (event: ExperienceEvent) => {
    dispatchExperienceEvent(event);
    queueTrigger(event.type);
  };
}
