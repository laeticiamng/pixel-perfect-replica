import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

const ACTIVITIES = [
  { icon: "C", label: "Café", color: "#ff6b6b" },
  { icon: "E", label: "Étudier", color: "#7c3aed" },
  { icon: "S", label: "Sport", color: "#34d399" },
  { icon: "M", label: "Manger", color: "#f59e0b" },
];

export const Scene2Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const phoneY = interpolate(phoneScale, [0, 1], [100, 0]);

  const buttonPressed = frame >= 40 && frame <= 45;
  const buttonScale = buttonPressed ? 0.92 : 1;

  const ringStart = 45;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Sequence from={0} durationInFrames={120}>
        <div
          style={{
            position: "absolute",
            top: 80,
            width: "100%",
            textAlign: "center",
            fontSize: 48,
            fontWeight: 700,
            color: "#f0f0ff",
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Active ton signal
        </div>
      </Sequence>

      <div
        style={{
          width: 280,
          height: 500,
          borderRadius: 40,
          background: "linear-gradient(180deg, #1a1a3e 0%, #0f0f2a 100%)",
          border: "2px solid rgba(124, 58, 237, 0.3)",
          transform: `translateY(${phoneY}px) scale(${phoneScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 20px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(124, 58, 237, 0.3)",
        }}
      >
        <div style={{ width: 100, height: 24, borderRadius: 12, background: "#0a0a1e", position: "absolute", top: 10 }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 40 }}>
          {ACTIVITIES.map((act, i) => {
            const chipSpring = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  background: `${act.color}22`,
                  border: `1px solid ${act.color}44`,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 15,
                  color: act.color,
                  transform: `scale(${chipSpring})`,
                  opacity: chipSpring,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: act.color, display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                  {act.icon}
                </span>
                {act.label}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${buttonScale})`,
            boxShadow: frame > ringStart ? "0 0 40px rgba(124, 58, 237, 0.6)" : "0 0 20px rgba(124, 58, 237, 0.3)",
          }}
        >
          <div style={{ fontSize: 28, color: "#fff", fontWeight: 700 }}>GO</div>
        </div>

        {frame > ringStart &&
          [0, 1, 2].map((i) => {
            const ringFrame = frame - ringStart - i * 12;
            if (ringFrame < 0) return null;
            const ringScale = interpolate(ringFrame, [0, 40], [1, 3], { extrapolateRight: "clamp" });
            const ringOpacity = interpolate(ringFrame, [0, 40], [0.6, 0], { extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "55%",
                  left: "50%",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  border: "2px solid #7c3aed",
                  transform: `translate(-50%, -50%) scale(${ringScale})`,
                  opacity: ringOpacity,
                }}
              />
            );
          })}

        {frame > 50 && (
          <div
            style={{
              marginTop: 30,
              fontSize: 14,
              color: "#a78bfa",
              opacity: interpolate(frame, [50, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              textAlign: "center",
            }}
          >
            Signal actif - 3 personnes proches
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
