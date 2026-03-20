import { describe, expect, it } from 'vitest';
import {
  applyCapabilityToPreset,
  reduceExperienceEvent,
  resolveRouteExperience,
} from '@/experience/core/experience-orchestrator';

describe('resolveRouteExperience', () => {
  it('assigns signature immersion to onboarding', () => {
    const preset = resolveRouteExperience('/onboarding');
    expect(preset.immersionLevel).toBe(3);
    expect(preset.sceneMode).toBe('onboarding');
  });

  it('keeps utility routes strict', () => {
    const preset = resolveRouteExperience('/settings');
    expect(preset.immersionLevel).toBe(0);
    expect(preset.sceneMode).toBe('none');
  });

  it('maps premium to aspirational mode', () => {
    const preset = resolveRouteExperience('/premium');
    expect(preset.immersionLevel).toBe(2);
    expect(preset.sceneMode).toBe('premium');
  });
});

describe('applyCapabilityToPreset', () => {
  it('downgrades heavy experiences for reduced mode', () => {
    const preset = applyCapabilityToPreset(resolveRouteExperience('/map'), {
      tier: 'off',
      prefersReducedMotion: true,
      reducedExperience: true,
    });

    expect(preset.immersionLevel).toBe(1);
    expect(preset.ambientDensity).toBeLessThanOrEqual(0.22);
    expect(preset.sceneMode).toBe('ambient');
  });

  it('caps lite tier to moderate immersion', () => {
    const preset = applyCapabilityToPreset(resolveRouteExperience('/map'), {
      tier: 'lite',
      prefersReducedMotion: false,
      reducedExperience: false,
    });

    expect(preset.immersionLevel).toBe(2);
    expect(preset.ambientDensity).toBeLessThanOrEqual(0.55);
  });
});

describe('reduceExperienceEvent', () => {
  it('amplifies signal activation', () => {
    const next = reduceExperienceEvent(
      { type: 'signal.activated' },
      resolveRouteExperience('/discover'),
    );

    expect(next.sceneMode).toBe('signal');
    expect(next.emotionalTone).toBe('anticipation');
  });

  it('turns payment success into celebration', () => {
    const next = reduceExperienceEvent(
      { type: 'payment.success' },
      resolveRouteExperience('/premium'),
    );

    expect(next.emotionalTone).toBe('celebration');
  });
});
