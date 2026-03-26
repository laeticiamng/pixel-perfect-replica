import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

export const Scene1Loneliness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Encore seul ce midi ?" — per-character reveal
  const line1 = "Encore seul ce midi ?";
  const charsVisible = Math.floor(
    interpolate(frame, [15, 15 + line1.length * 2], [0, line1.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Cursor blink
  const cursorOpacity = Math.sin(frame * 0.3) > 0 ? 1 : 0;
  const showCursor = frame > 15 && frame < 80;

  // Line 2 reveal
  const line2Opacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Y = interpolate(frame, [80, 100], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lonely person silhouette (simple circle + body)
  const silhouetteOpacity = interpolate(frame, [0, 30], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  // Subtle breathing scale
  const breathe = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.98, 1.02]);

  // Vignette darkening
  const vignetteOpacity = interpolate(frame, [0, 60], [0, 0.6], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5,5,15,0.8) 100%)",
          opacity: vignetteOpacity,
        }}
      />

      {/* Lonely silhouette in background */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${breathe})`,
          opacity: silhouetteOpacity,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.15)",
            margin: "0 auto 10px",
          }}
        />
        <div
          style={{
            width: 40,
            height: 80,
            borderRadius: "20px 20px 0 0",
            background: "rgba(124, 58, 237, 0.1)",
            margin: "0 auto",
          }}
        />
      </div>

      {/* Main text */}
      <div style={{ textAlign: "center", zIndex: 2 }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#f0f0ff",
            letterSpacing: "-2px",
            lineHeight: 1.1,
          }}
        >
          {line1.slice(0, charsVisible)}
          {showCursor && (
            <span style={{ opacity: cursorOpacity, color: "#7c3aed" }}>|</span>
          )}
        </div>

        <div
          style={{
            fontSize: 36,
            color: "#a78bfa",
            marginTop: 30,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px)`,
            fontWeight: 400,
          }}
        >
          Et si ça changeait ?
        </div>
      </div>
    </AbsoluteFill>
  );
};
