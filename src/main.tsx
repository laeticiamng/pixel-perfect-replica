import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandlers } from "./lib/errorReporter";

// Initialize analytics session ID early so all tracking (including SocialProofBar) has it
if (!sessionStorage.getItem('analytics_session_id')) {
  sessionStorage.setItem('analytics_session_id', `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
}

// Install global error monitoring (production only)
installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
