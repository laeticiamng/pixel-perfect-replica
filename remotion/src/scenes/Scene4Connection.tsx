import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 4: Real connection — the meet-up moment
export const Scene4Connection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom in feeling
  const zoom = interpolate(frame, [0, 110], [1, 1.04], {
    extrapolateRight: "clamp",
  });

  // Big emoji entrance
  const meetSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Step label
  const labelSpring = spring({
    frame,
    fps,
    config: { damping: 25, stiffness: 120 },
  });

  // Stat counters
  const stats = [
    { value: "12K+", label: "étudiants", delay: 50 },
    { value: "3 min", label: "pour se retrouver", delay: 56 },
    { value: "100%", label: "gratuit", delay: 62 },
  ];

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${zoom})`,
      }}
    >
      {/* Warm glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(255,107,90,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Step label */}
      <div
        style={{
          position: "absolute",
          top: 100,
          display: "inline-block",
          fontSize: 14,
          fontWeight: 700,
          color: "#22c55e",
          textTransform: "uppercase",
          letterSpacing: 5,
          padding: "6px 16px",
          borderRadius: 6,
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.15)",
          opacity: interpolate(labelSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(labelSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        Étape 03
      </div>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 160,
          textAlign: "center",
          opacity: interpolate(labelSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(labelSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 62,
            fontWeight: 800,
            color: "#f0f0f5",
            lineHeight: 1.1,
          }}
        >
          Retrouve-toi{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #22c55e, #4ade80)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            en vrai
          </span>
        </div>
      </div>

      {/* Meet-up emoji moment */}
      <Sequence from={10}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 60,
          }}
        >
          {/* Person 1 slides in from left */}
          <div
            style={{
              fontSize: 90,
              transform: `translateX(${interpolate(meetSpring, [0, 1], [-100, 0])}px)`,
              opacity: interpolate(meetSpring, [0, 1], [0, 1]),
            }}
          >
            👩‍🎓
          </div>

          {/* Handshake with scale bounce */}
          <Sequence from={20}>
            {(() => {
              const shakeSpring = spring({
                frame: frame - 30,
                fps,
                config: { damping: 8, stiffness: 180 },
              });
              return (
                <div
                  style={{
                    fontSize: 80,
                    transform: `scale(${interpolate(shakeSpring, [0, 1], [0, 1.1])})`,
                    opacity: interpolate(shakeSpring, [0, 1], [0, 1]),
                  }}
                >
                  🤝
                </div>
              );
            })()}
          </Sequence>

          {/* Person 2 slides in from right */}
          <div
            style={{
              fontSize: 90,
              transform: `translateX(${interpolate(meetSpring, [0, 1], [100, 0])}px)`,
              opacity: interpolate(meetSpring, [0, 1], [0, 1]),
            }}
          >
            👨‍💻
          </div>
        </div>
      </Sequence>

      {/* Celebration particles */}
      <Sequence from={35}>
        {["✨", "🎉", "⭐", "💛", "🔥", "💫", "🎊", "💜"].map((emoji, i) => {
          const celebSpring = spring({
            frame: frame - 35 - i * 3,
            fps,
            config: { damping: 8, stiffness: 120 },
          });
          const angle = (i * 45 - 90) * (Math.PI / 180);
          const radius = interpolate(celebSpring, [0, 1], [0, 160 + (i % 3) * 40]);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <span
              key={i}
              style={{
                position: "absolute",
                fontSize: 28,
                transform: `translate(${x}px, ${y + 60}px) scale(${interpolate(celebSpring, [0, 1], [0, 1])}) rotate(${i * 25}deg)`,
                opacity: interpolate(celebSpring, [0, 1], [0, 0.9]),
              }}
            >
              {emoji}
            </span>
          );
        })}
      </Sequence>

      {/* Stats row */}
      <Sequence from={48}>
        <div
          style={{
            position: "absolute",
            bottom: 140,
            display: "flex",
            gap: 60,
          }}
        >
          {stats.map((stat, i) => {
            const statSpring = spring({
              frame: frame - stat.delay,
              fps,
              config: { damping: 20, stiffness: 150 },
            });
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  opacity: interpolate(statSpring, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(statSpring, [0, 1], [30, 0])}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#f0f0f5",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 400,
                    color: "rgba(240,240,245,0.4)",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
