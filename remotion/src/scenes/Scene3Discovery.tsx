import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Scene 3: Discovery — radar-like view showing nearby people
export const Scene3Discovery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Radar sweep rotation
  const sweepAngle = interpolate(frame, [0, 110], [0, 360], {
    extrapolateRight: "clamp",
  });

  // Title entrance
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 25, stiffness: 100 },
  });

  // Users appearing on radar
  const users = [
    { angle: 45, dist: 0.55, emoji: "👩‍🎓", name: "Léa", delay: 25, color: "#FF6B5A" },
    { angle: 160, dist: 0.7, emoji: "👨‍💻", name: "Hugo", delay: 35, color: "#9f7aea" },
    { angle: 250, dist: 0.4, emoji: "👩‍🔬", name: "Aïsha", delay: 45, color: "#22c55e" },
    { angle: 320, dist: 0.65, emoji: "🧑‍🎨", name: "Tom", delay: 55, color: "#f59e0b" },
  ];

  const radarSize = 500;

  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 100,
        padding: "0 100px",
      }}
    >
      {/* Radar visualization */}
      <div
        style={{
          position: "relative",
          width: radarSize,
          height: radarSize,
        }}
      >
        {/* Concentric rings */}
        {[0.33, 0.66, 1].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: radarSize * r,
              height: radarSize * r,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.04)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Center dot (you) */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#FF6B5A",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 20px rgba(255,107,90,0.5)",
          }}
        />

        {/* Sweep line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: radarSize / 2,
            height: 2,
            background: "linear-gradient(90deg, rgba(255,107,90,0.6), transparent)",
            transformOrigin: "0% 50%",
            transform: `rotate(${sweepAngle}deg)`,
          }}
        />

        {/* Sweep trail */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: radarSize,
            height: radarSize,
            transform: "translate(-50%, -50%)",
            background: `conic-gradient(from ${sweepAngle - 40}deg at 50% 50%, transparent 0deg, rgba(255,107,90,0.06) 30deg, transparent 40deg)`,
            borderRadius: "50%",
          }}
        />

        {/* User dots */}
        {users.map((user, i) => {
          const userSpring = spring({
            frame: frame - user.delay,
            fps,
            config: { damping: 12, stiffness: 200 },
          });
          const rad = (user.angle * Math.PI) / 180;
          const x = Math.cos(rad) * (radarSize / 2) * user.dist;
          const y = Math.sin(rad) * (radarSize / 2) * user.dist;
          const scale = interpolate(userSpring, [0, 1], [0, 1]);
          const opacity = interpolate(userSpring, [0, 1], [0, 1]);

          // Breathing glow
          const glow = Math.sin((frame - user.delay) * 0.08) * 0.3 + 0.7;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
                opacity,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${user.color}22`,
                  border: `2px solid ${user.color}66`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  boxShadow: `0 0 ${20 * glow}px ${user.color}33`,
                }}
              >
                {user.emoji}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(240,240,245,0.7)",
                }}
              >
                {user.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right text */}
      <div
        style={{
          flex: 1,
          maxWidth: 500,
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateX(${interpolate(titleSpring, [0, 1], [60, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 14,
            fontWeight: 700,
            color: "#9f7aea",
            textTransform: "uppercase",
            letterSpacing: 5,
            marginBottom: 20,
            padding: "6px 16px",
            borderRadius: 6,
            background: "rgba(159,122,234,0.08)",
            border: "1px solid rgba(159,122,234,0.15)",
          }}
        >
          Étape 02
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: "#f0f0f5",
            lineHeight: 1.15,
            marginBottom: 24,
          }}
        >
          Vois qui est{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #9f7aea, #b794f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            dispo
          </span>
          <br />
          autour de toi
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: "rgba(240,240,245,0.45)",
            lineHeight: 1.6,
          }}
        >
          En temps réel. Anonyme.
          <br />
          Tu choisis qui tu contactes.
        </div>
      </div>
    </AbsoluteFill>
  );
};
