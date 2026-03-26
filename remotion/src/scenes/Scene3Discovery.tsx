import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const USERS = [
  { name: "Léa", initial: "L", angle: 45, dist: 180, activity: "Café", color: "#ff6b6b" },
  { name: "Marco", initial: "M", angle: 160, dist: 220, activity: "Étudier", color: "#7c3aed" },
  { name: "Aisha", initial: "A", angle: 280, dist: 160, activity: "Sport", color: "#34d399" },
];

export const Scene3Discovery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sweepAngle = interpolate(frame, [0, 90], [0, 360], { extrapolateRight: "clamp" });
  const pulseScale = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.95, 1.05]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 60,
          fontSize: 48,
          fontWeight: 700,
          color: "#f0f0ff",
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Découvre qui est autour de toi
      </div>

      <div style={{ width: 500, height: 500, borderRadius: "50%", position: "relative", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: i * 160,
              height: i * 160,
              borderRadius: "50%",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 250,
            height: 2,
            background: "linear-gradient(90deg, #7c3aed, transparent)",
            transformOrigin: "0 50%",
            transform: `rotate(${sweepAngle}deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 250,
            height: 60,
            background: "linear-gradient(90deg, rgba(124,58,237,0.15), transparent)",
            transformOrigin: "0 50%",
            transform: `rotate(${sweepAngle - 15}deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#7c3aed",
            transform: `translate(-50%, -50%) scale(${pulseScale})`,
            boxShadow: "0 0 20px rgba(124, 58, 237, 0.5)",
          }}
        />

        {USERS.map((user, i) => {
          const angleRad = (user.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * user.dist;
          const y = Math.sin(angleRad) * user.dist;
          const appearFrame = (user.angle / 360) * 90;
          const dotSpring = spring({ frame: frame - appearFrame, fps, config: { damping: 10, stiffness: 100 } });
          const glow = interpolate(Math.sin(frame * 0.08 + i * 2), [-1, 1], [0.4, 0.8]);

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${dotSpring})`,
                opacity: dotSpring,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: `${user.color}33`,
                  border: `2px solid ${user.color}88`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: user.color,
                  boxShadow: `0 0 ${20 * glow}px ${user.color}44`,
                }}
              >
                {user.initial}
              </div>
              <div style={{ fontSize: 13, color: "#a78bfa", marginTop: 4, fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "rgba(167, 139, 250, 0.6)" }}>{user.activity}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          fontSize: 24,
          color: "#a78bfa",
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        3 étudiants à moins de 200m
      </div>
    </AbsoluteFill>
  );
};
