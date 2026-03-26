import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 1: The Hook — "Tu manges seul ce midi ?"
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big question text — word by word reveal
  const words = ["Tu", "manges", "seul", "ce", "midi", "?"];

  // Background pulse
  const pulseOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.03, 0.08]
  );

  // After text reveals, the "seul" word gets highlighted
  const highlightProgress = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 200px",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,90,0.15) 0%, transparent 70%)",
          opacity: pulseOpacity * 3,
        }}
      />

      {/* Main text */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px 24px",
        }}
      >
        {words.map((word, i) => {
          const wordSpring = spring({
            frame: frame - i * 6,
            fps,
            config: { damping: 15, stiffness: 180 },
          });
          const y = interpolate(wordSpring, [0, 1], [60, 0]);
          const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

          const isSeul = word === "seul";
          const highlightColor = isSeul
            ? `rgba(255,107,90,${highlightProgress})`
            : "transparent";

          return (
            <span
              key={i}
              style={{
                fontSize: 110,
                fontWeight: 800,
                color: isSeul
                  ? interpolate(highlightProgress, [0, 1], [0.96, 1])
                      .toString()
                      .startsWith("1")
                    ? "#FF6B5A"
                    : "#f0f0f5"
                  : "#f0f0f5",
                transform: `translateY(${y}px)`,
                opacity,
                textShadow: isSeul
                  ? `0 0 40px rgba(255,107,90,${highlightProgress * 0.6})`
                  : "none",
                padding: isSeul ? "0 12px" : "0",
                borderRadius: 12,
                backgroundColor: highlightColor,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Subtle line underneath */}
      <Sequence from={60}>
        <div
          style={{
            position: "absolute",
            bottom: 320,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {(() => {
            const lineProgress = spring({
              frame: frame - 60,
              fps,
              config: { damping: 30, stiffness: 100 },
            });
            return (
              <div
                style={{
                  width: interpolate(lineProgress, [0, 1], [0, 200]),
                  height: 3,
                  background: "linear-gradient(90deg, transparent, #FF6B5A, transparent)",
                  borderRadius: 2,
                }}
              />
            );
          })()}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
