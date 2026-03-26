import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 4: The Meet — joyful real-life connection
export const Scene4Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Warm glow background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(255,107,90,0.1) 0%, transparent 60%)",
        }}
      />

      {/* Step label */}
      {(() => {
        const labelSpring = spring({
          frame,
          fps,
          config: { damping: 20, stiffness: 150 },
        });
        return (
          <div
            style={{
              position: "absolute",
              top: 140,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: interpolate(labelSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(labelSpring, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#22c55e",
                textTransform: "uppercase",
                letterSpacing: 4,
              }}
            >
              Étape 3
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: "#f0f0f5",
                textAlign: "center",
              }}
            >
              Retrouve-toi{" "}
              <span style={{ color: "#22c55e" }}>en vrai</span>
            </div>
          </div>
        );
      })()}

      {/* Big emoji moment — two hands meeting */}
      <Sequence from={20}>
        {(() => {
          const handSpring = spring({
            frame: frame - 20,
            fps,
            config: { damping: 12, stiffness: 100 },
          });

          const leftX = interpolate(handSpring, [0, 1], [-200, -10]);
          const rightX = interpolate(handSpring, [0, 1], [200, 10]);

          // Celebration particles after meet
          const celebrateFrame = frame - 55;
          const showCelebration = celebrateFrame > 0;

          return (
            <div style={{ position: "relative", marginTop: 60 }}>
              {/* Left hand */}
              <span
                style={{
                  fontSize: 120,
                  display: "inline-block",
                  transform: `translateX(${leftX}px) rotate(-15deg)`,
                  opacity: interpolate(handSpring, [0, 1], [0, 1]),
                }}
              >
                🤝
              </span>

              {/* Celebration emojis */}
              {showCelebration &&
                ["🎉", "⭐", "💛", "✨", "🔥"].map((emoji, i) => {
                  const celebSpring = spring({
                    frame: celebrateFrame - i * 4,
                    fps,
                    config: { damping: 8, stiffness: 150 },
                  });
                  const angle = (i * 72 - 90) * (Math.PI / 180);
                  const radius = interpolate(celebSpring, [0, 1], [0, 140]);
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <span
                      key={i}
                      style={{
                        position: "absolute",
                        fontSize: 36,
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${interpolate(celebSpring, [0, 1], [0, 1])})`,
                        opacity: interpolate(celebSpring, [0, 1], [0, 1]),
                      }}
                    >
                      {emoji}
                    </span>
                  );
                })}
            </div>
          );
        })()}
      </Sequence>

      {/* Testimonial quote */}
      <Sequence from={50}>
        {(() => {
          const quoteSpring = spring({
            frame: frame - 50,
            fps,
            config: { damping: 20, stiffness: 120 },
          });
          return (
            <div
              style={{
                position: "absolute",
                bottom: 160,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: interpolate(quoteSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(quoteSpring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  color: "rgba(240,240,245,0.7)",
                  fontStyle: "italic",
                  textAlign: "center",
                  maxWidth: 600,
                }}
              >
                "J'ai rencontré 3 personnes incroyables
                <br />
                en une semaine grâce à Nearvity"
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(240,240,245,0.4)",
                }}
              >
                — Marie, L3 Sciences Po
              </div>
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};
