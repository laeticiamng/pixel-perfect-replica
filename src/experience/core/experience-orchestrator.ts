import type { CapabilityState, ExperienceEvent, ExperiencePreset } from './experience-types';

const DEFAULT_PRESET: ExperiencePreset = {
  immersionLevel: 1,
  emotionalTone: 'warm',
  sceneMode: 'ambient',
  ambientDensity: 0.35,
};

const ROUTE_PRESETS: Array<{ match: RegExp; preset: ExperiencePreset }> = [
  { match: /^\/$/, preset: { immersionLevel: 3, emotionalTone: 'anticipation', sceneMode: 'ambient', ambientDensity: 0.9, focusTarget: 'landing' } },
  { match: /^\/(onboarding|welcome)$/, preset: { immersionLevel: 3, emotionalTone: 'trust', sceneMode: 'onboarding', ambientDensity: 0.85, focusTarget: 'onboarding' } },
  { match: /^\/newcomer$/, preset: { immersionLevel: 2, emotionalTone: 'trust', sceneMode: 'onboarding', ambientDensity: 0.65, focusTarget: 'newcomer' } },
  { match: /^\/map$/, preset: { immersionLevel: 3, emotionalTone: 'anticipation', sceneMode: 'signal', ambientDensity: 0.88, focusTarget: 'radar' } },
  { match: /^\/discover$/, preset: { immersionLevel: 2, emotionalTone: 'warm', sceneMode: 'discovery', ambientDensity: 0.7, focusTarget: 'discover' } },
  { match: /^\/conversations/, preset: { immersionLevel: 1, emotionalTone: 'warm', sceneMode: 'ambient', ambientDensity: 0.4, focusTarget: 'conversations' } },
  { match: /^\/(binome|session)/, preset: { immersionLevel: 2, emotionalTone: 'focus', sceneMode: 'match', ambientDensity: 0.72, focusTarget: 'session' } },
  { match: /^\/premium$/, preset: { immersionLevel: 2, emotionalTone: 'celebration', sceneMode: 'premium', ambientDensity: 0.76, focusTarget: 'premium' } },
  { match: /^\/events(?:\/[^/]+)?$/, preset: { immersionLevel: 1, emotionalTone: 'warm', sceneMode: 'ambient', ambientDensity: 0.48, focusTarget: 'events' } },
  { match: /^\/events\/[^/]+\/checkin$/, preset: { immersionLevel: 3, emotionalTone: 'celebration', sceneMode: 'checkin', ambientDensity: 0.82, focusTarget: 'checkin' } },
  { match: /^\/(settings|privacy-settings|change-password|diagnostics|admin|president-cockpit|institutional-dashboard|data-export|blocked-users|notifications-settings)$/, preset: { immersionLevel: 0, emotionalTone: 'calm', sceneMode: 'none', ambientDensity: 0.08, focusTarget: 'utility' } },
  { match: /^\/(profile|statistics|gamification)$/, preset: { immersionLevel: 1, emotionalTone: 'focus', sceneMode: 'ambient', ambientDensity: 0.32 } },
];

export function resolveRouteExperience(pathname: string): ExperiencePreset {
  return ROUTE_PRESETS.find(({ match }) => match.test(pathname))?.preset ?? DEFAULT_PRESET;
}

export function applyCapabilityToPreset(
  preset: ExperiencePreset,
  capability: Pick<CapabilityState, 'tier' | 'prefersReducedMotion' | 'reducedExperience'>,
): ExperiencePreset {
  if (capability.reducedExperience || capability.prefersReducedMotion || capability.tier === 'off') {
    return {
      ...preset,
      immersionLevel: Math.min(preset.immersionLevel, 1) as ExperiencePreset['immersionLevel'],
      ambientDensity: Math.min(preset.ambientDensity, 0.22),
      sceneMode: preset.immersionLevel === 0 ? 'none' : 'ambient',
      emotionalTone: preset.immersionLevel === 0 ? 'calm' : preset.emotionalTone,
    };
  }

  if (capability.tier === 'lite') {
    return {
      ...preset,
      immersionLevel: Math.min(preset.immersionLevel, 2) as ExperiencePreset['immersionLevel'],
      ambientDensity: Math.min(preset.ambientDensity, 0.55),
    };
  }

  return preset;
}

export function reduceExperienceEvent(event: ExperienceEvent, current: ExperiencePreset): Partial<ExperiencePreset> {
  switch (event.type) {
    case 'signal.activated':
      return {
        immersionLevel: Math.min(3, current.immersionLevel + 1) as ExperiencePreset['immersionLevel'],
        emotionalTone: 'anticipation',
        sceneMode: 'signal',
        ambientDensity: Math.min(1, current.ambientDensity + 0.15),
      };
    case 'match.revealed':
      return {
        emotionalTone: 'celebration',
        sceneMode: 'match',
        ambientDensity: Math.min(1, current.ambientDensity + (event.intensity ?? 0.12)),
      };
    case 'session.joined':
      return {
        immersionLevel: Math.max(current.immersionLevel, 2) as ExperiencePreset['immersionLevel'],
        emotionalTone: 'focus',
        sceneMode: 'match',
      };
    case 'achievement.unlocked':
    case 'payment.success':
      return {
        emotionalTone: 'celebration',
        ambientDensity: Math.min(1, current.ambientDensity + 0.1),
      };
    case 'premium.viewed':
      return {
        immersionLevel: Math.max(current.immersionLevel, 2) as ExperiencePreset['immersionLevel'],
        emotionalTone: 'trust',
        sceneMode: 'premium',
      };
    case 'signal.expiring':
      return {
        emotionalTone: 'focus',
        ambientDensity: Math.max(0.18, current.ambientDensity - 0.12),
      };
    case 'route.enter':
      return resolveRouteExperience(event.route);
    default:
      return current;
  }
}
