import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 5: Finale — brand reveal with dramatic entrance
export const Scene5Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo icon entrance — scale + rotate
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Brand text — delayed
  const textSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 22, stiffness: 120 },
  });

  // Tagline — further delayed
  const tagSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 25, stiffness: 100 },
  });

  // Badge
  const badgeSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

  // Breathing scale
  const breathe = 1 + Math.sin(frame * 0.05) * 0.015;

  // Glow pulse
  const glowIntensity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.15, 0.4]
  );

  // Light beam sweep
  const beamX = interpolate(frame, [0, 140], [-200, 2100], {
    extrapolateRight: "clamp",
  });

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
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, 
            rgba(255,107,90,${glowIntensity}) 0%, 
            rgba(159,122,234,0.06) 35%, 
            transparent 65%)`,
        }}
      />

      {/* Light beam sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: beamX,
          width: 120,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)",
          transform: "skewX(-15deg)",
        }}
      />

      {/* Logo + Brand group */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          transform: `scale(${breathe})`,
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 36,
            background: "linear-gradient(135deg, #FF6B5A 0%, #e04a3a 50%, #cc3d2e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `
              0 20px 60px rgba(255,107,90,0.35),
              0 0 0 1px rgba(255,255,255,0.08),
              inset 0 1px 0 rgba(255,255,255,0.15)
            `,
            transform: `scale(${interpolate(logoSpring, [0, 1], [0.2, 1])}) rotate(${interpolate(logoSpring, [0, 1], [-15, 0])}deg)`,
            opacity: interpolate(logoSpring, [0, 1], [0, 1]),
          }}
        >
          <span
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: "white",
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            N
          </span>
        </div>

        {/* NEARVITY text */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            letterSpacing: 8,
            opacity: interpolate(textSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #FF6B5A 0%, #FF8A7A 50%, #FF6B5A 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NEARVITY
          </span>
        </div>
      </div>

      {/* Tagline */}
      <Sequence from={40}>
        <div
          style={{
            position: "absolute",
            bottom: 280,
            textAlign: "center",
            opacity: interpolate(tagSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(tagSpring, [0, 1], [25, 0])}px)`,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              color: "rgba(240,240,245,0.7)",
              lineHeight: 1.5,
            }}
          >
            Ne mange, révise ou fais du sport
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              marginTop: 8,
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B5A, #ff8a6a)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              plus jamais seul.
            </span>
          </div>
        </div>
      </Sequence>

      {/* Available badge */}
      <Sequence from={60}>
        <div
          style={{
            position: "absolute",
            bottom: 180,
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.6, 1])})`,
            opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              fontWeight: 600,
              color: "#22c55e",
              background: "rgba(34,197,94,0.06)",
              padding: "10px 28px",
              borderRadius: 24,
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 10px rgba(34,197,94,0.5)",
              }}
            />
            Disponible maintenant · 100% gratuit
          </div>
        </div>
      </Sequence>

      {/* URL */}
      <Sequence from={75}>
        {(() => {
          const urlSpring = spring({
            frame: frame - 75,
            fps,
            config: { damping: 30, stiffness: 100 },
          });
          return (
            <div
              style={{
                position: "absolute",
                bottom: 120,
                fontSize: 18,
                fontWeight: 300,
                color: "rgba(240,240,245,0.3)",
                letterSpacing: 3,
                opacity: interpolate(urlSpring, [0, 1], [0, 1]),
              }}
            >
              nearvity.lovable.app
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
