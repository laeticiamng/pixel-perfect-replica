import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

// Initialize analytics session ID early so all tracking (including SocialProofBar) has it
if (!sessionStorage.getItem('analytics_session_id')) {
  sessionStorage.setItem('analytics_session_id', `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
}

const root = createRoot(document.getElementById("root")!);

/**
 * Sans configuration du backend (VITE_SUPABASE_*), le client Supabase lève une
 * erreur à l'import et toute l'app restait sur un écran vide. On affiche à la
 * place une page de maintenance lisible ; l'app n'est chargée que si le
 * backend est configuré.
 */
const backendConfigure = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

function Maintenance() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#0f0f1a",
        color: "#f5f5f7",
        fontFamily: "system-ui, -apple-system, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>NEARVITY</h1>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.6, opacity: 0.9 }}>
          Le service est momentanément indisponible, le temps d'une maintenance.
          Réessaie dans quelques instants.
        </p>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", opacity: 0.6 }}>
          Service temporarily unavailable. Please try again shortly.
        </p>
      </div>
    </main>
  );
}

if (!backendConfigure) {
  root.render(<Maintenance />);
} else {
  // Surveillance d'erreurs (production) : dépend du client Supabase, donc chargée ici
  import("./lib/errorReporter").then(({ installGlobalErrorHandlers }) => installGlobalErrorHandlers());
  import("./App.tsx").then(({ default: App }) => {
    root.render(
      <HelmetProvider>
        <App />
      </HelmetProvider>,
    );
  });
}
