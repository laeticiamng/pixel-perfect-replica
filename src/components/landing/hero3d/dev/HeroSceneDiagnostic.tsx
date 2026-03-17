/**
 * Dev-only diagnostic overlay for the HeroScene3D.
 * Shows active preset, WebGL status, reduced-motion, and postFX flags.
 * Never rendered in production builds.
 */

import { useMemo } from 'react';
import { getDeviceCapabilities, getScenePreset } from '../deviceCapabilities';
import type { DeviceCapabilities, ScenePreset } from '../types';

interface DiagnosticRowProps {
  label: string;
  value: string | number | boolean;
}

function DiagnosticRow({ label, value }: DiagnosticRowProps) {
  const display = typeof value === 'boolean' ? (value ? 'YES' : 'NO') : String(value);
  const color = typeof value === 'boolean' ? (value ? '#4ade80' : '#f87171') : '#e2e8f0';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{display}</span>
    </div>
  );
}

export function HeroSceneDiagnostic() {
  // Only render in development
  if (import.meta.env.PROD) return null;

  const caps: DeviceCapabilities = useMemo(() => getDeviceCapabilities(), []);
  const preset: ScenePreset = useMemo(() => getScenePreset(caps.tier), [caps.tier]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.85)',
        color: '#e2e8f0',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 11,
        fontFamily: 'monospace',
        lineHeight: 1.6,
        minWidth: 220,
        pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#818cf8' }}>
        HeroScene3D Diagnostic
      </div>
      <DiagnosticRow label="Tier" value={caps.tier.toUpperCase()} />
      <DiagnosticRow label="WebGL" value={caps.hasWebGL} />
      <DiagnosticRow label="GPU" value={caps.gpuTier} />
      <DiagnosticRow label="Reduced Motion" value={caps.prefersReducedMotion} />
      <DiagnosticRow label="Data Saver" value={caps.isDataSaver} />
      <DiagnosticRow label="Mobile" value={caps.isMobile} />
      <DiagnosticRow label="Cores" value={caps.coreCount} />
      <DiagnosticRow label="Memory" value={`${caps.deviceMemory}GB`} />
      <DiagnosticRow label="DPR" value={caps.dpr.toFixed(1)} />
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '6px 0' }} />
      <DiagnosticRow label="Particles" value={preset.particleCount} />
      <DiagnosticRow label="Rings" value={preset.ringCount} />
      <DiagnosticRow label="Bloom" value={preset.enableBloom} />
      <DiagnosticRow label="CA" value={preset.enableChromaticAberration} />
      <DiagnosticRow label="DOF" value={preset.enableDepthOfField} />
      <DiagnosticRow label="Vignette" value={preset.enableVignette} />
      <DiagnosticRow label="Atmosphere" value={preset.enableAtmosphere} />
      <DiagnosticRow label="Inner Glow" value={preset.enableInnerGlow} />
      <DiagnosticRow label="Max DPR" value={preset.maxDpr} />
    </div>
  );
}
