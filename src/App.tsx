import { lazy, Suspense } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary, CookieConsent, OfflineBanner, ProtectedRoute, CommandPalette } from "@/components";
import { useKeyboardShortcuts } from "@/hooks";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks";
import { AnalyticsProvider } from "@/hooks/useAnalytics";
import { FullPageLoader } from "@/components/shared/FullPageLoader";

// Lazy-loaded pages — each page is code-split into its own chunk
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const ProximityRevealPage = lazy(() => import('./pages/ProximityRevealPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const PremiumPage = lazy(() => import('./pages/PremiumPage'));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage'));
const PresidentCockpitPage = lazy(() => import('./pages/PresidentCockpitPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PostSignupOnboardingPage = lazy(() => import('./pages/PostSignupOnboardingPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const PeopleMetPage = lazy(() => import('./pages/PeopleMetPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationsSettingsPage = lazy(() => import('./pages/NotificationsSettingsPage'));
const PrivacySettingsPage = lazy(() => import('./pages/PrivacySettingsPage'));
const DiagnosticsPage = lazy(() => import('./pages/DiagnosticsPage'));
const InstallPage = lazy(() => import('./pages/InstallPage'));
const BlockedUsersPage = lazy(() => import('./pages/BlockedUsersPage'));
const DataExportPage = lazy(() => import('./pages/DataExportPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const FavoriteEventsPage = lazy(() => import('./pages/FavoriteEventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventCheckinPage = lazy(() => import('./pages/EventCheckinPage'));
const BinomePage = lazy(() => import('./pages/BinomePage'));
const SessionDetailPage = lazy(() => import('./pages/SessionDetailPage'));
const SessionHistoryPage = lazy(() => import('./pages/SessionHistoryPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min — avoid refetching on every mount
      retry: 1,                         // retry once on failure
      refetchOnWindowFocus: false,      // don't spam Supabase on tab switch
    },
  },
});

// Page transition variants - smoother with easing
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut' as const,
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    }
  },
};

// Animated Routes wrapper with keyboard shortcuts
function AnimatedRoutes() {
  const location = useLocation();
  useKeyboardShortcuts(); // Enable global keyboard shortcuts

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="will-change-transform"
      >
        <ErrorBoundary>
        <Suspense fallback={<FullPageLoader message="Chargement..." />}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/welcome" element={<PostSignupOnboardingPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />

            {/* Auth redirect routes */}
            <Route path="/signup" element={<Navigate to="/onboarding" state={{ isLogin: false }} replace />} />
            <Route path="/login" element={<Navigate to="/onboarding" state={{ isLogin: true }} replace />} />

            {/* App radar redirect */}
            <Route path="/app/radar" element={<Navigate to="/map" replace />} />

            {/* Protected Routes */}
            <Route path="/map" element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } />
            <Route path="/reveal/:userId" element={
              <ProtectedRoute>
                <ProximityRevealPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            } />
            <Route path="/people-met" element={
              <ProtectedRoute>
                <PeopleMetPage />
              </ProtectedRoute>
            } />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/feedback" element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } />
            <Route path="/diagnostics" element={
              <ProtectedRoute>
                <DiagnosticsPage />
              </ProtectedRoute>
            } />
            <Route path="/notifications-settings" element={
              <ProtectedRoute>
                <NotificationsSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/privacy-settings" element={
              <ProtectedRoute>
                <PrivacySettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/president-cockpit" element={
              <ProtectedRoute>
                <PresidentCockpitPage />
              </ProtectedRoute>
            } />
            <Route path="/blocked-users" element={
              <ProtectedRoute>
                <BlockedUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/data-export" element={
              <ProtectedRoute>
                <DataExportPage />
              </ProtectedRoute>
            } />
            <Route path="/premium" element={
              <ProtectedRoute>
                <PremiumPage />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            <Route path="/events/favorites" element={
              <ProtectedRoute>
                <FavoriteEventsPage />
              </ProtectedRoute>
            } />
            <Route path="/events/:eventId" element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/events/:eventId/checkin" element={
              <ProtectedRoute>
                <EventCheckinPage />
              </ProtectedRoute>
            } />
            <Route path="/binome" element={
              <ProtectedRoute>
                <BinomePage />
              </ProtectedRoute>
            } />
            <Route path="/binome/:sessionId" element={
              <ProtectedRoute>
                <SessionDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/binome/history" element={
              <ProtectedRoute>
                <SessionHistoryPage />
              </ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

// Theme initializer component
function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useTheme(); // Initialize theme on mount
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeInitializer>
          <TooltipProvider>
            <HotToaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                },
              }}
            />
            <BrowserRouter>
              <AnalyticsProvider>
                <CommandPalette />
                <AnimatedRoutes />
                <CookieConsent />
                <OfflineBanner />
              </AnalyticsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeInitializer>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
