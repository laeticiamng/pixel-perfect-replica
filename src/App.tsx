import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(240 33% 14%)',
              color: 'hsl(0 0% 95%)',
              border: '1px solid hsl(240 20% 20%)',
              borderRadius: '12px',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            
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
            <Route path="/help" element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            } />
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
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
