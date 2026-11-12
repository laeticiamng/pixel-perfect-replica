import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { Maintenance } from "./components/Maintenance";
import { supabaseConfigured } from "./integrations/supabase/client";
import "./index.css";
import { installGlobalErrorHandlers } from "./lib/errorReporter";
import { installChunkReloadGuard } from "./lib/chunkReloadGuard";

// Initialize analytics session ID early so all tracking (including SocialProofBar) has it
if (!sessionStorage.getItem('analytics_session_id')) {
  sessionStorage.setItem('analytics_session_id', `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
}

// Install global error monitoring (production only)
installGlobalErrorHandlers();

// Reload once instead of a blank screen when a code chunk fails to load
installChunkReloadGuard();

// Sans backend configuré, page de maintenance lisible plutôt qu'un écran vide
createRoot(document.getElementById("root")!).render(
  supabaseConfigured ? (
    <HelmetProvider>
      <App />
    </HelmetProvider>
  ) : (
    <Maintenance />
  )
);
