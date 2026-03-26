import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 3: The Match — two users connect on the map
export const Scene3Match: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Map-like background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Grid lines simulating a map */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Step label */}
      <Sequence from={0}>
        <div
          style={{
            position: "absolute",
            top: 120,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {(() => {
            const labelSpring = spring({
              frame,
              fps,
              config: { damping: 20, stiffness: 150 },
            });
            return (
              <>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#7C3AED",
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    opacity: interpolate(labelSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(labelSpring, [0, 1], [20, 0])}px)`,
                  }}
                >
                  Étape 2
                </div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: "#f0f0f5",
                    textAlign: "center",
                    opacity: interpolate(labelSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(labelSpring, [0, 1], [30, 0])}px)`,
                  }}
                >
                  Quelqu'un est{" "}
                  <span style={{ color: "#7C3AED" }}>dispo</span> près de toi
                </div>
              </>
            );
          })()}
        </div>
      </Sequence>

      {/* Two user dots approaching each other */}
      <Sequence from={20}>
        {(() => {
          const approachProgress = spring({
            frame: frame - 20,
            fps,
            config: { damping: 25, stiffness: 80 },
          });

          const user1X = interpolate(approachProgress, [0, 1], [-250, -60]);
          const user2X = interpolate(approachProgress, [0, 1], [250, 60]);

          // Connection line
          const lineProgress = spring({
            frame: frame - 55,
            fps,
            config: { damping: 20, stiffness: 120 },
          });

          // Match burst
          const burstProgress = spring({
            frame: frame - 65,
            fps,
            config: { damping: 10, stiffness: 200 },
          });

          return (
            <div style={{ position: "relative" }}>
              {/* Connection line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: interpolate(lineProgress, [0, 1], [0, 120]),
                  height: 3,
                  background:
                    "linear-gradient(90deg, #FF6B5A, #7C3AED)",
                  borderRadius: 2,
                  opacity: interpolate(lineProgress, [0, 1], [0, 0.8]),
                }}
              />

              {/* User 1 */}
              <div
                style={{
                  position: "absolute",
                  transform: `translate(${user1X}px, -50%)`,
                  top: "50%",
                }}
              >
                <UserDot
                  emoji="👩"
                  name="Léa"
                  activity="Café"
                  color="#FF6B5A"
                  frame={frame}
                  delay={25}
                  fps={fps}
                />
              </div>

              {/* User 2 */}
              <div
                style={{
                  position: "absolute",
                  transform: `translate(${user2X}px, -50%)`,
                  top: "50%",
                }}
              >
                <UserDot
                  emoji="👨"
                  name="Hugo"
                  activity="Café"
                  color="#7C3AED"
                  frame={frame}
                  delay={30}
                  fps={fps}
                />
              </div>

              {/* Match burst */}
              {frame > 65 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: interpolate(burstProgress, [0, 1], [0, 160]),
                    height: interpolate(burstProgress, [0, 1], [0, 160]),
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,107,90,0.3) 0%, transparent 70%)",
                    opacity: interpolate(burstProgress, [0, 1], [1, 0]),
                  }}
                />
              )}

              {/* "Match!" text */}
              <Sequence from={70}>
                {(() => {
                  const matchSpring = spring({
                    frame: frame - 70,
                    fps,
                    config: { damping: 12, stiffness: 200 },
                  });
                  return (
                    <div
                      style={{
                        position: "absolute",
                        top: 80,
                        left: "50%",
                        transform: `translateX(-50%) scale(${interpolate(matchSpring, [0, 1], [0.5, 1])})`,
                        opacity: interpolate(matchSpring, [0, 1], [0, 1]),
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#FF6B5A",
                        background: "rgba(255,107,90,0.1)",
                        padding: "8px 24px",
                        borderRadius: 20,
                        border: "1px solid rgba(255,107,90,0.3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✨ Match !
                    </div>
                  );
                })()}
              </Sequence>
            </div>
          );
        })()}
      </Sequence>
    </AbsoluteFill>
  );
};

// User dot component
const UserDot: React.FC<{
  emoji: string;
  name: string;
  activity: string;
  color: string;
  frame: number;
  delay: number;
  fps: number;
}> = ({ emoji, name, activity, color, frame, delay, fps }) => {
  const dotSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        transform: `scale(${interpolate(dotSpring, [0, 1], [0, 1])})`,
        opacity: interpolate(dotSpring, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${color}, ${color}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          boxShadow: `0 0 30px ${color}44`,
          border: `3px solid ${color}66`,
        }}
      >
        {emoji}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#f0f0f5" }}>
          {name}
        </div>
        <div style={{ fontSize: 14, color: `${color}cc` }}>☕ {activity}</div>
      </div>
    </div>
  );
};
