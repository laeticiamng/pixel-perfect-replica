import { PropsWithChildren, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useHighContrast } from '@/hooks/useHighContrast';

/**
 * Wraps the app with framer-motion's MotionConfig so every <motion.*> element
 * automatically respects the user's reduced-motion preference (system MQ or
 * the in-app toggle). Also mirrors the state to a `data-reduce-motion`
 * attribute on <html> so plain CSS animations can opt-in via a selector.
 */
export function MotionAccessibilityProvider({ children }: PropsWithChildren) {
  const { reduceMotion } = useReducedMotion();
  const { highContrast } = useHighContrast();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  }, [reduceMotion]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.highContrast = highContrast ? 'true' : 'false';
  }, [highContrast]);

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  );
}
