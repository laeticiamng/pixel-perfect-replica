import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 2: The Signal — phone mockup with signal activation
export const Scene2Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone entrance
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 120 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [120, 0]);
  const phoneOpacity = interpolate(phoneSpring, [0, 1], [0, 1]);

  // Signal pulse rings
  const pulseDelay = 30;
  const ringCount = 3;

  // Text entrance
  const textSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 120,
        padding: "0 160px",
      }}
    >
      {/* Left: Text */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: interpolate(textSpring, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(textSpring, [0, 1], [-40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#FF6B5A",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Étape 1
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#f0f0f5",
            lineHeight: 1.1,
          }}
        >
          Active ton
          <br />
          <span style={{ color: "#FF6B5A" }}>signal</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(240,240,245,0.6)",
            lineHeight: 1.5,
            maxWidth: 420,
          }}
        >
          Dis ce que tu veux faire.
          <br />
          Café, sport, révisions, lunch…
        </div>
      </div>

      {/* Right: Phone mockup with signal */}
      <div
        style={{
          position: "relative",
          opacity: phoneOpacity,
          transform: `translateY(${phoneY}px)`,
        }}
      >
        {/* Phone frame */}
        <div
          style={{
            width: 320,
            height: 640,
            borderRadius: 48,
            background: "linear-gradient(180deg, #1a1a3e 0%, #0f0f28 100%)",
            border: "3px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(255,107,90,0.1)",
          }}
        >
          {/* Signal button */}
          <Sequence from={25}>
            {(() => {
              const btnSpring = spring({
                frame: frame - 25,
                fps,
                config: { damping: 12, stiffness: 200 },
              });
              const btnScale = interpolate(btnSpring, [0, 1], [0.5, 1]);
              return (
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF6B5A, #FF8A7A)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${btnScale})`,
                    boxShadow: `0 0 ${30 + Math.sin(frame * 0.1) * 10}px rgba(255,107,90,0.4)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      color: "white",
                    }}
                  >
                    ⚡
                  </div>
                </div>
              );
            })()}
          </Sequence>

          {/* Activity chips */}
          <Sequence from={45}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                marginTop: 32,
                padding: "0 20px",
              }}
            >
              {["🍕 Lunch", "📚 Révisions", "☕ Café", "🏃 Sport"].map(
                (label, i) => {
                  const chipSpring = spring({
                    frame: frame - 45 - i * 5,
                    fps,
                    config: { damping: 15, stiffness: 200 },
                  });
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 20,
                        background:
                          i === 0
                            ? "rgba(255,107,90,0.25)"
                            : "rgba(255,255,255,0.08)",
                        border:
                          i === 0
                            ? "1px solid rgba(255,107,90,0.5)"
                            : "1px solid rgba(255,255,255,0.1)",
                        color: i === 0 ? "#FF6B5A" : "rgba(240,240,245,0.7)",
                        fontSize: 14,
                        fontWeight: 600,
                        transform: `scale(${interpolate(chipSpring, [0, 1], [0.6, 1])})`,
                        opacity: interpolate(chipSpring, [0, 1], [0, 1]),
                      }}
                    >
                      {label}
                    </div>
                  );
                }
              )}
            </div>
          </Sequence>
        </div>

        {/* Pulse rings */}
        <Sequence from={pulseDelay}>
          {Array.from({ length: ringCount }, (_, i) => {
            const ringFrame = frame - pulseDelay - i * 12;
            const ringProgress = interpolate(
              ringFrame % 60,
              [0, 60],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 140 + ringProgress * 200,
                  height: 140 + ringProgress * 200,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,107,90,0.3)",
                  opacity: 1 - ringProgress,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
