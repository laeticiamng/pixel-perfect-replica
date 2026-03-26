import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Scene4Connection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftX = interpolate(spring({ frame, fps, config: { damping: 15, stiffness: 80 } }), [0, 1], [-300, -120]);
  const rightX = interpolate(spring({ frame, fps, config: { damping: 15, stiffness: 80 } }), [0, 1], [300, 120]);

  const lineWidth = interpolate(frame, [30, 55], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const sparkFrame = frame - 55;
  const sparkScale = sparkFrame > 0 ? spring({ frame: sparkFrame, fps, config: { damping: 8 } }) : 0;

  const textSpring = spring({ frame: frame - 65, fps, config: { damping: 12 } });

  const statsOpacity = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const counter = Math.floor(interpolate(frame, [80, 110], [0, 12847], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Left profile */}
        <div style={{ transform: `translateX(${leftX}px)`, textAlign: "center" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 0 30px rgba(124, 58, 237, 0.4)",
            }}
          >
            L
          </div>
          <div style={{ color: "#f0f0ff", fontSize: 18, marginTop: 8, fontWeight: 700 }}>Léa</div>
        </div>

        {/* Connection line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: lineWidth,
            height: 3,
            background: "linear-gradient(90deg, #7c3aed, #ff6b6b, #7c3aed)",
            borderRadius: 2,
          }}
        />

        {/* Spark */}
        {sparkFrame > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${sparkScale})`,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "radial-gradient(circle, #ff6b6b, transparent)",
              opacity: interpolate(sparkFrame, [0, 20], [1, 0], { extrapolateRight: "clamp" }),
            }}
          />
        )}

        {/* Right profile */}
        <div style={{ transform: `translateX(${rightX}px)`, textAlign: "center" }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff6b6b, #fbbf24)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 0 30px rgba(255, 107, 107, 0.4)",
            }}
          >
            M
          </div>
          <div style={{ color: "#f0f0ff", fontSize: 18, marginTop: 8, fontWeight: 700 }}>Marco</div>
        </div>
      </div>

      {/* Text */}
      <div
        style={{
          position: "absolute",
          top: 120,
          fontSize: 56,
          fontWeight: 700,
          color: "#f0f0ff",
          transform: `scale(${textSpring})`,
          opacity: textSpring,
        }}
      >
        Retrouve-toi en vrai
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", bottom: 100, textAlign: "center", opacity: statsOpacity }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#ff6b6b" }}>
          {counter.toLocaleString("fr-FR")}+
        </div>
        <div style={{ fontSize: 20, color: "#a78bfa", marginTop: 4 }}>rencontres déjà créées</div>
      </div>
    </AbsoluteFill>
  );
};
