// Components barrel export - Clean imports
// Usage: import { BottomNav, PageLayout } from '@/components';

// Shared components
export * from './shared';

// Map components
export * from './map';

// Profile components
export * from './profile';

// Admin components
export * from './admin';

// Binome components
export * from './binome';

// Navigation components
export * from './navigation';

// Radar components (Activity, Signal, Timer)
export * from './radar';

// Safety components (Emergency)
export * from './safety';

// Social components (Chat, Badges)
export * from './social';

// Radar components (Activity, Signal, Timer)
export * from './radar';

// Safety components (Emergency)
export * from './safety';

// Social components (Chat, Badges)
export * from './social';

// Re-export individual components for backward compatibility
export { BottomNav } from './BottomNav';
export { Breadcrumbs } from './Breadcrumbs';
export { ConfirmDialog } from './ConfirmDialog';
export { CookieConsent } from './CookieConsent';
export { DeleteAccountDialog } from './DeleteAccountDialog';
export { NavLink } from './NavLink';
export { OfflineBanner } from './OfflineBanner';
export { PageLayout, AnimatedSection } from './PageLayout';
export { PageTransition } from './PageTransition';
export { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
export { ProtectedRoute } from './ProtectedRoute';
export { SwipeIndicator } from './SwipeIndicator';
export { ThemeToggle } from './ThemeToggle';

// Backward compatibility aliases (deprecated - use from subfolders)
export { ActivityFilter } from './radar';
export { ActivitySelector } from './radar';
export { ExpirationTimer } from './radar';
export { SearchingIndicator } from './radar';
export { SignalMarker } from './radar';
export { LocationDescriptionInput } from './radar';
export { EmergencyButton } from './safety';
export { EmergencyContactsManager } from './safety';
export { IcebreakerCard } from './social';
export { MiniChat } from './social';
export { VerificationBadges } from './social';
export { FavoriteActivitiesSelector } from './social';
