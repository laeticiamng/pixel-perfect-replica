import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 5: CTA — brand logo + tagline finale
export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Tagline entrance
  const tagSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  // Subtle breathing
  const breathe = Math.sin(frame * 0.06) * 0.02 + 1;

  // Final glow pulse
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.15, 0.35]
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Epic radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,107,90,${glowIntensity}) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)`,
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.3, 1]) * breathe})`,
          opacity: interpolate(logoSpring, [0, 1], [0, 1]),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* N logo box */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            background: "linear-gradient(135deg, #FF6B5A, #e04a3a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(255,107,90,0.4)",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "white",
            }}
          >
            N
          </span>
        </div>

        {/* NEARVITY text */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: 6,
            background: "linear-gradient(90deg, #FF6B5A, #FF8A7A)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          NEARVITY
        </div>
      </div>

      {/* Tagline */}
      <Sequence from={20}>
        <div
          style={{
            position: "absolute",
            bottom: 280,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(tagSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(tagSpring, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "rgba(240,240,245,0.8)",
              textAlign: "center",
            }}
          >
            Ne mange, révise ou fais du sport
            <br />
            <span style={{ color: "#FF6B5A", fontWeight: 800 }}>
              plus jamais seul.
            </span>
          </div>
        </div>
      </Sequence>

      {/* Gratuit badge */}
      <Sequence from={45}>
        {(() => {
          const badgeSpring = spring({
            frame: frame - 45,
            fps,
            config: { damping: 12, stiffness: 200 },
          });
          return (
            <div
              style={{
                position: "absolute",
                bottom: 180,
                transform: `scale(${interpolate(badgeSpring, [0, 1], [0.5, 1])})`,
                opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
                fontSize: 20,
                fontWeight: 700,
                color: "#22c55e",
                background: "rgba(34,197,94,0.1)",
                padding: "10px 28px",
                borderRadius: 24,
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              100% Gratuit · Disponible maintenant
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
