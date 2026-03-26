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
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
      <Sequence from={0} durationInFrames={120}>
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            width: "100%",
            textAlign: "center",
            fontSize: 52,
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
          width: 320,
          height: 560,
          borderRadius: 44,
          background: "linear-gradient(180deg, #1a1a3e 0%, #0f0f2a 100%)",
          border: "2px solid rgba(124, 58, 237, 0.3)",
          transform: `translateY(${phoneY}px) scale(${phoneScale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "44px 24px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(124, 58, 237, 0.3)",
          margin: "0 auto",
        }}
      >
        <div style={{ width: 100, height: 24, borderRadius: 12, background: "#0a0a1e", position: "absolute", top: 10 }} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 44 }}>
          {ACTIVITIES.map((act, i) => {
            const chipSpring = spring({ frame: frame - 15 - i * 6, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  background: `${act.color}22`,
                  border: `1px solid ${act.color}44`,
                  borderRadius: 20,
                  padding: "8px 16px",
                  fontSize: 16,
                  color: act.color,
                  transform: `scale(${chipSpring})`,
                  opacity: chipSpring,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: act.color, display: "inline-flex", justifyContent: "center", alignItems: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>
                  {act.icon}
                </span>
                {act.label}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 44,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${buttonScale})`,
            boxShadow: frame > ringStart ? "0 0 40px rgba(124, 58, 237, 0.6)" : "0 0 20px rgba(124, 58, 237, 0.3)",
          }}
        >
          <div style={{ fontSize: 30, color: "#fff", fontWeight: 700 }}>GO</div>
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
                  width: 130,
                  height: 130,
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
              marginTop: 34,
              fontSize: 15,
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
