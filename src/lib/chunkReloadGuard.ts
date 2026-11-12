/**
 * Recovers from "Failed to fetch dynamically imported module" errors
 * (stale chunks after a deploy, or a dev-server hiccup during hot reload)
 * by reloading the page once instead of leaving a blank screen.
 */
const STORAGE_KEY = 'nearvity_chunk_reload_at';
const MIN_INTERVAL_MS = 10_000;

export function isChunkLoadError(message: string): boolean {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  );
}

export function shouldReload(now: number, lastReloadAt: number | null): boolean {
  return lastReloadAt === null || now - lastReloadAt > MIN_INTERVAL_MS;
}

function reloadOnce(): void {
  const last = Number(sessionStorage.getItem(STORAGE_KEY)) || null;
  const now = Date.now();
  if (!shouldReload(now, last)) return;
  sessionStorage.setItem(STORAGE_KEY, String(now));
  window.location.reload();
}

export function installChunkReloadGuard(): void {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    reloadOnce();
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason: unknown = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason ?? '');
    if (isChunkLoadError(message)) reloadOnce();
  });
}
