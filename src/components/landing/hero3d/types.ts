/**
 * Shared types for the HeroScene3D modular architecture.
 */

import type { RefObject } from 'react';

// ── Device tier ──────────────────────────────────────────────────────

export type DeviceTier = 'full' | 'lite' | 'off';

// ── Device capabilities ──────────────────────────────────────────────

export interface DeviceCapabilities {
  tier: DeviceTier;
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  coreCount: number;
  deviceMemory: number;
  dpr: number;
  isMobile: boolean;
  isDataSaver: boolean;
  gpuTier: 'high' | 'mid' | 'low' | 'unknown';
}

// ── Scene preset ─────────────────────────────────────────────────────

export interface ScenePreset {
  particleCount: number;
  icosahedronDetail: number;
  innerGlowDetail: number;
  ringSegments: number;
  ringCount: number;
  enableBloom: boolean;
  enableChromaticAberration: boolean;
  enableVignette: boolean;
  enableDepthOfField: boolean;
  enableAtmosphere: boolean;
  enableCameraBreathing: boolean;
  enableHaze: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  maxDpr: number;
  orbScale: number;
  enableInnerGlow: boolean;
}

// ── Shared props ─────────────────────────────────────────────────────

export interface ScrollRefProp {
  scrollRef: RefObject<number>;
}

export interface OrbOffsetProp {
  orbOffset: [number, number];
}

// ── Orb offset constant ──────────────────────────────────────────────

export const ORB_OFFSET: [number, number] = [0.6, 0.2];
