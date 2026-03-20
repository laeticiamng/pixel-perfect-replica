export type ImmersionLevel = 0 | 1 | 2 | 3;

export type EmotionalTone =
  | 'calm'
  | 'warm'
  | 'anticipation'
  | 'focus'
  | 'celebration'
  | 'trust';

export type SceneMode =
  | 'none'
  | 'ambient'
  | 'discovery'
  | 'signal'
  | 'match'
  | 'checkin'
  | 'premium'
  | 'onboarding';

export type MotionMode = 'full' | 'reduced' | 'off';

export interface ExperiencePreset {
  immersionLevel: ImmersionLevel;
  emotionalTone: EmotionalTone;
  sceneMode: SceneMode;
  ambientDensity: number;
  focusTarget?: string;
}

export interface CapabilityState {
  gpuTier: 'high' | 'mid' | 'low' | 'unknown';
  tier: 'full' | 'lite' | 'off';
  prefersReducedMotion: boolean;
  saveData: boolean;
  hasWebGL: boolean;
  audioEnabled: boolean;
  reducedExperience: boolean;
  dprCap: number;
}

export type ExperienceEvent =
  | { type: 'route.enter'; route: string }
  | { type: 'signal.activated' }
  | { type: 'signal.expiring' }
  | { type: 'match.revealed'; intensity?: number }
  | { type: 'session.joined' }
  | { type: 'achievement.unlocked'; key: string }
  | { type: 'premium.viewed' }
  | { type: 'payment.success' };
