import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 2: Signal activation — phone UI with pulsing signal
export const Scene2Signal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides up from bottom
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [300, 0]);

  // Left text
  const textSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 25, stiffness: 100 },
  });

  // Button press animation at frame 40
  const btnPressScale = frame >= 40 && frame < 46
    ? interpolate(frame, [40, 43, 46], [1, 0.9, 1], { extrapolateRight: "clamp" })
    : 1;

  // Signal pulse after press
  const signalActive = frame >= 46;
  const pulseFrame = frame - 46;

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 100,
        padding: "0 140px",
      }}
    >
      {/* Left: Copy */}
      <div
        style={{
          flex: 1,
          opacity: interpolate(textSpring, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(textSpring, [0, 1], [-60, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 14,
            fontWeight: 700,
            color: "#FF6B5A",
            textTransform: "uppercase",
            letterSpacing: 5,
            marginBottom: 20,
            padding: "6px 16px",
            borderRadius: 6,
            background: "rgba(255,107,90,0.08)",
            border: "1px solid rgba(255,107,90,0.15)",
          }}
        >
          Étape 01
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 800,
            color: "#f0f0f5",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Active ton
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #FF6B5A, #ff8a6a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            signal
          </span>
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: "rgba(240,240,245,0.5)",
            lineHeight: 1.6,
            maxWidth: 380,
          }}
        >
          Choisis ton activité.
          <br />
          On fait le reste.
        </div>
      </div>

      {/* Right: Phone mockup */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${phoneY}px)`,
          opacity: interpolate(phoneSpring, [0, 1], [0, 1]),
        }}
      >
        {/* Phone glow */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: 60,
            background: signalActive
              ? "radial-gradient(circle, rgba(255,107,90,0.15) 0%, transparent 70%)"
              : "none",
            transition: "background 0.5s",
          }}
        />

        {/* Phone body */}
        <div
          style={{
            width: 300,
            height: 600,
            borderRadius: 44,
            background: "linear-gradient(170deg, #151530 0%, #0c0c22 100%)",
            border: "2px solid rgba(255,255,255,0.06)",
            boxShadow: "0 50px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              position: "absolute",
              top: 16,
              width: 100,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
            }}
          />

          {/* Signal button */}
          <div style={{ position: "relative" }}>
            {/* Pulse rings */}
            {signalActive &&
              [0, 1, 2].map((i) => {
                const ringPhase = ((pulseFrame - i * 15) % 60) / 60;
                const ringOk = pulseFrame - i * 15 > 0;
                return ringOk ? (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: 120 + ringPhase * 140,
                      height: 120 + ringPhase * 140,
                      borderRadius: "50%",
                      border: `2px solid rgba(255,107,90,${0.4 * (1 - ringPhase)})`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ) : null;
              })}

            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: signalActive
                  ? "linear-gradient(135deg, #FF6B5A, #ff4a35)"
                  : "linear-gradient(135deg, #2a2a50, #1e1e3e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${btnPressScale})`,
                boxShadow: signalActive
                  ? "0 0 40px rgba(255,107,90,0.4), 0 10px 30px rgba(255,107,90,0.2)"
                  : "0 10px 30px rgba(0,0,0,0.3)",
                border: signalActive
                  ? "2px solid rgba(255,107,90,0.3)"
                  : "2px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontSize: 44 }}>⚡</span>
            </div>
          </div>

          {/* Activity chips — appear after signal */}
          <Sequence from={55}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
                marginTop: 28,
                padding: "0 16px",
              }}
            >
              {[
                { emoji: "🍕", label: "Lunch", active: true },
                { emoji: "📚", label: "Révisions", active: false },
                { emoji: "☕", label: "Café", active: false },
                { emoji: "🏃", label: "Sport", active: false },
              ].map((chip, i) => {
                const chipS = spring({
                  frame: frame - 55 - i * 4,
                  fps,
                  config: { damping: 15, stiffness: 200 },
                });
                return (
                  <div
                    key={i}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      background: chip.active
                        ? "rgba(255,107,90,0.2)"
                        : "rgba(255,255,255,0.04)",
                      border: chip.active
                        ? "1px solid rgba(255,107,90,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                      color: chip.active ? "#FF6B5A" : "rgba(240,240,245,0.5)",
                      transform: `translateY(${interpolate(chipS, [0, 1], [20, 0])}px)`,
                      opacity: interpolate(chipS, [0, 1], [0, 1]),
                    }}
                  >
                    {chip.emoji} {chip.label}
                  </div>
                );
              })}
            </div>
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
};
