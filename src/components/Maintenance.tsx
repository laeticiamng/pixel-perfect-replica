/** Page affichée quand le backend n'est pas joignable/configuré. */
export function Maintenance() {
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
