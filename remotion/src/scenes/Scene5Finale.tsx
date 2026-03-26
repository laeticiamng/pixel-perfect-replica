import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene5Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 100 } });
  const beamX = interpolate(frame, [0, 60], [-200, 2200], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [40, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeSpring = spring({ frame: frame - 65, fps, config: { damping: 10 } });
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.6]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          opacity: glowPulse,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: beamX,
          width: 150,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.08), transparent)",
          transform: "skewX(-15deg)",
        }}
      />

      <div style={{ transform: `scale(${logoSpring})`, opacity: logoSpring, textAlign: "center" }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-3px",
            background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 40%, #ff6b6b 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          NEARVITY
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "58%",
          fontSize: 28,
          color: "#a78bfa",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          fontWeight: 400,
          letterSpacing: "2px",
        }}
      >
        La proximité crée le lien
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 120,
          transform: `scale(${badgeSpring})`,
          opacity: badgeSpring,
          background: "rgba(124, 58, 237, 0.15)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          borderRadius: 30,
          padding: "12px 30px",
          fontSize: 18,
          color: "#f0f0ff",
          fontWeight: 700,
        }}
      >
        Disponible maintenant
      </div>
    </AbsoluteFill>
  );
};
