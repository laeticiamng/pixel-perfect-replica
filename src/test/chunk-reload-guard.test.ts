import { describe, it, expect } from 'vitest';
import { isChunkLoadError, shouldReload } from '@/lib/chunkReloadGuard';

describe('chunk reload guard', () => {
  it('detects the dynamic import failure message', () => {
    expect(isChunkLoadError('Failed to fetch dynamically imported module: /src/App.tsx')).toBe(true);
    expect(isChunkLoadError('Network request failed')).toBe(false);
  });
  it('reloads at most once every 10 seconds', () => {
    expect(shouldReload(100_000, null)).toBe(true);
    expect(shouldReload(105_000, 100_000)).toBe(false);
    expect(shouldReload(111_000, 100_000)).toBe(true);
  });
});
