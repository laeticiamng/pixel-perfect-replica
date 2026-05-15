import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

/**
 * Site-wide smooth scrolling via Lenis.
 *
 * Disabled on routes that need native scroll behavior:
 *  - /map           (Mapbox GL needs native wheel/touch)
 *  - /binome*       (uses fixed panels with internal scroll)
 *  - prefers-reduced-motion = reduce
 */
const DISABLED_PREFIXES = ['/map', '/binome', '/proximity'];

export function SmoothScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const disabled = reduced || DISABLED_PREFIXES.some((p) => pathname.startsWith(p));
    if (disabled) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
