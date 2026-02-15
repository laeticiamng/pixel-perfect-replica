import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import React from 'react';

// Generate a simple session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Event categories
export type EventCategory = 
  | 'navigation'
  | 'engagement'
  | 'signal'
  | 'interaction'
  | 'auth'
  | 'profile'
  | 'settings'
  | 'error';

interface TrackEventParams {
  name: string;
  category: EventCategory;
  data?: Record<string, unknown>;
}

export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();
  const lastPageRef = useRef<string>('');
  const sessionId = useRef(getSessionId());

  // Track an event
  const trackEvent = useCallback(async ({ name, category, data = {} }: TrackEventParams) => {
    try {
      await supabase
        .from('analytics_events' as any)
        .insert({
          user_id: user?.id || null,
          event_name: name,
          event_category: category,
          event_data: data,
          page_path: location.pathname,
          session_id: sessionId.current,
        });
    } catch (error) {
      // Silently fail - analytics should not break the app
      // Silently swallowed — analytics must never break the app
    }
  }, [user, location.pathname]);

  // Track page views automatically
  useEffect(() => {
    if (location.pathname !== lastPageRef.current) {
      lastPageRef.current = location.pathname;
      trackEvent({
        name: 'page_view',
        category: 'navigation',
        data: {
          path: location.pathname,
          referrer: document.referrer,
        },
      });
    }
  }, [location.pathname, trackEvent]);

  // Predefined tracking functions for common events
  const track = {
    // Auth events
    signup: () => trackEvent({ name: 'signup', category: 'auth' }),
    login: () => trackEvent({ name: 'login', category: 'auth' }),
    logout: () => trackEvent({ name: 'logout', category: 'auth' }),
    
    // Signal events
    signalActivated: (activity: string) => trackEvent({
      name: 'signal_activated',
      category: 'signal',
      data: { activity },
    }),
    signalDeactivated: () => trackEvent({
      name: 'signal_deactivated',
      category: 'signal',
    }),
    signalExtended: () => trackEvent({
      name: 'signal_extended',
      category: 'signal',
    }),
    
    // Interaction events
    profileViewed: (targetUserId: string) => trackEvent({
      name: 'profile_viewed',
      category: 'interaction',
      data: { target_user_id: targetUserId },
    }),
    icebreakerSent: (targetUserId: string) => trackEvent({
      name: 'icebreaker_sent',
      category: 'interaction',
      data: { target_user_id: targetUserId },
    }),
    
    // Engagement events
    buttonClick: (buttonName: string) => trackEvent({
      name: 'button_click',
      category: 'engagement',
      data: { button: buttonName },
    }),
    featureUsed: (featureName: string) => trackEvent({
      name: 'feature_used',
      category: 'engagement',
      data: { feature: featureName },
    }),
    
    // Settings events
    settingChanged: (setting: string, value: unknown) => trackEvent({
      name: 'setting_changed',
      category: 'settings',
      data: { setting, value },
    }),
    
    // Profile events
    profileUpdated: () => trackEvent({
      name: 'profile_updated',
      category: 'profile',
    }),
    avatarUploaded: () => trackEvent({
      name: 'avatar_uploaded',
      category: 'profile',
    }),
    
    // Error events
    error: (errorType: string, message: string) => trackEvent({
      name: 'error_occurred',
      category: 'error',
      data: { error_type: errorType, message },
    }),
  };

  return { trackEvent, track };
}

// Provider component to track all page views
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return React.createElement(React.Fragment, null, children);
}
