// Hooks barrel export - Clean imports
// Usage: import { useAuth, useTheme, useEvents } from '@/hooks';

// Auth hooks
export { useSupabaseAuth } from './useSupabaseAuth';

// Data hooks
export { useActiveSignal } from './useActiveSignal';
export { useEvents } from './useEvents';
export { useInteractions } from './useInteractions';
export { useMessages } from './useMessages';
export { useBinomeSessions } from './useBinomeSessions';
export { useReports } from './useReports';
export { useUserBlocks } from './useUserBlocks';

// Settings hooks
export { useUserSettings } from './useUserSettings';
export { useTheme } from './useTheme';

// Utility hooks
export { useIsMobile } from './use-mobile';
export { useToast } from './use-toast';
export { useAnalytics } from './useAnalytics';
export { useNetworkStatus } from './useNetworkStatus';
export { useSwipeNavigation } from './useSwipeNavigation';
export { useRateLimit } from './useRateLimit';

// Feature hooks
export { useAdminAlerts } from './useAdminAlerts';
export { useAdminCheck } from './useAdminCheck';
export { useAppFeedback } from './useAppFeedback';
export { useGdprExport } from './useGdprExport';
export { useNearbyNotifications } from './useNearbyNotifications';
export { usePushNotifications } from './usePushNotifications';
export { useSystemStats } from './useSystemStats';
export { useVerificationBadges } from './useVerificationBadges';
