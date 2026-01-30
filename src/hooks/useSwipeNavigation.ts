import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger swipe
  allowedRoutes?: string[]; // Routes where swipe is enabled
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

// Main navigation routes in order
const MAIN_ROUTES = ['/map', '/profile', '/settings'];

export function useSwipeNavigation(config: SwipeConfig = {}) {
  const {
    threshold = 80,
    allowedRoutes = MAIN_ROUTES,
    onSwipeLeft,
    onSwipeRight,
  } = config;

  const navigate = useNavigate();
  const location = useLocation();
  const touchState = useRef<TouchState | null>(null);
  const isEnabled = useRef(true);

  const getCurrentRouteIndex = useCallback(() => {
    return MAIN_ROUTES.indexOf(location.pathname);
  }, [location.pathname]);

  const handleSwipeLeft = useCallback(() => {
    if (onSwipeLeft) {
      onSwipeLeft();
      return;
    }

    const currentIndex = getCurrentRouteIndex();
    if (currentIndex >= 0 && currentIndex < MAIN_ROUTES.length - 1) {
      navigate(MAIN_ROUTES[currentIndex + 1]);
    }
  }, [getCurrentRouteIndex, navigate, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (onSwipeRight) {
      onSwipeRight();
      return;
    }

    const currentIndex = getCurrentRouteIndex();
    if (currentIndex > 0) {
      navigate(MAIN_ROUTES[currentIndex - 1]);
    }
  }, [getCurrentRouteIndex, navigate, onSwipeRight]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!allowedRoutes.includes(location.pathname)) return;
    
    // Don't intercept touches on interactive map elements
    const target = e.target as HTMLElement;
    if (target.closest('.mapboxgl-map') || target.closest('[data-map-container]')) {
      return;
    }
    
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };
  }, [allowedRoutes, location.pathname]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchState.current || !isEnabled.current) return;
    if (!allowedRoutes.includes(location.pathname)) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    // Only horizontal swipes, not vertical scrolling
    if (Math.abs(deltaY) > Math.abs(deltaX) * 0.5) {
      touchState.current = null;
      return;
    }

    // Must be fast enough (less than 300ms) or long enough distance
    const isValidSwipe = Math.abs(deltaX) > threshold && (deltaTime < 300 || Math.abs(deltaX) > 150);

    if (isValidSwipe) {
      if (deltaX > 0) {
        // Swipe right -> go to previous page
        handleSwipeRight();
      } else {
        // Swipe left -> go to next page
        handleSwipeLeft();
      }
    }

    touchState.current = null;
  }, [allowedRoutes, location.pathname, threshold, handleSwipeLeft, handleSwipeRight]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  const disable = useCallback(() => {
    isEnabled.current = false;
  }, []);

  const enable = useCallback(() => {
    isEnabled.current = true;
  }, []);

  return {
    disable,
    enable,
    currentRouteIndex: getCurrentRouteIndex(),
    totalRoutes: MAIN_ROUTES.length,
  };
}
