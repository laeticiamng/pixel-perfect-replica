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

// Pages - organized by category
import {
  // Main
  LandingPage,
  MapPage,
  ProximityRevealPage,
  AdminDashboardPage,
  PremiumPage,
  ChangelogPage,
  PresidentCockpitPage,
  NotFound,
  // Auth
  OnboardingPage,
  PostSignupOnboardingPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ChangePasswordPage,
  // Profile
  ProfilePage,
  EditProfilePage,
  StatisticsPage,
  PeopleMetPage,
  // Settings
  SettingsPage,
  NotificationsSettingsPage,
  PrivacySettingsPage,
  DiagnosticsPage,
  InstallPage,
  BlockedUsersPage,
  DataExportPage,
  // Events
  EventsPage,
  FavoriteEventsPage,
  EventDetailPage,
  EventCheckinPage,
  // Binome
  BinomePage,
  SessionDetailPage,
  SessionHistoryPage,
  // Legal
  TermsPage,
  PrivacyPage,
  AboutPage,
  // Support
  HelpPage,
  FeedbackPage,
  ReportPage,
} from "@/pages";

const queryClient = new QueryClient();

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
