import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useTheme } from "@/hooks/useTheme";

import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import MapPage from "./pages/MapPage";
import ProximityRevealPage from "./pages/ProximityRevealPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import SettingsPage from "./pages/SettingsPage";
import StatisticsPage from "./pages/StatisticsPage";
import PeopleMetPage from "./pages/PeopleMetPage";
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import ReportPage from "./pages/ReportPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotificationsSettingsPage from "./pages/NotificationsSettingsPage";
import PrivacySettingsPage from "./pages/PrivacySettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import InstallPage from "./pages/InstallPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BlockedUsersPage from "./pages/BlockedUsersPage";
import DataExportPage from "./pages/DataExportPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AnalyticsProvider } from "./hooks/useAnalytics";

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

// Animated Routes wrapper
function AnimatedRoutes() {
  const location = useLocation();
  
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/install" element={<InstallPage />} />
          
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
            <Toaster />
            <Sonner />
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
