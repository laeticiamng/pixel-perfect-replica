import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";

// Per-character animated text
function CharReveal({
  text,
  startFrame,
  style,
  charDelay = 2,
  springConfig = { damping: 18, stiffness: 180 },
}: {
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
  charDelay?: number;
  springConfig?: { damping: number; stiffness: number };
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", ...style }}>
      {text.split("").map((char, i) => {
        const s = spring({
          frame: frame - startFrame - i * charDelay,
          fps,
          config: springConfig,
        });
        const y = interpolate(s, [0, 1], [50, 0]);
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const blur = interpolate(s, [0, 1], [8, 0]);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity,
              filter: `blur(${blur}px)`,
              whiteSpace: char === " " ? "pre" : undefined,
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

// Scene 1: Emotional hook — loneliness → hope
export const Scene1Loneliness: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow zoom in
  const zoom = interpolate(frame, [0, 120], [1, 1.06], {
    extrapolateRight: "clamp",
  });

  // Lonely emoji floating
  const emojiY = Math.sin(frame * 0.04) * 8;
  const emojiOpacity = spring({
    frame: frame - 5,
    fps,
    config: { damping: 30, stiffness: 80 },
  });

  // Line reveal
  const lineWidth = spring({
    frame: frame - 65,
    fps,
    config: { damping: 30, stiffness: 60 },
  });

  // "Et si..." text
  const hopeSpring = spring({
    frame: frame - 75,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${zoom})`,
      }}
    >
      {/* Subtle radial warmth */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,90,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Lonely person emoji — large, centered */}
      <div
        style={{
          fontSize: 100,
          opacity: interpolate(emojiOpacity, [0, 1], [0, 1]),
          transform: `translateY(${emojiY - 60}px)`,
          marginBottom: 20,
        }}
      >
        😔
      </div>

      {/* Main question — per-character reveal */}
      <div style={{ textAlign: "center", position: "relative" }}>
        <CharReveal
          text="Encore seul"
          startFrame={10}
          charDelay={2}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#e8e8f0",
            letterSpacing: -2,
          }}
        />
        <br />
        <CharReveal
          text="ce midi ?"
          startFrame={22}
          charDelay={2}
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#FF6B5A",
            letterSpacing: -2,
          }}
        />
      </div>

      {/* Thin horizontal divider */}
      <div
        style={{
          width: interpolate(lineWidth, [0, 1], [0, 240]),
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255,107,90,0.5), transparent)",
          marginTop: 40,
          borderRadius: 1,
        }}
      />

      {/* "Et si ça changeait ?" */}
      <Sequence from={75}>
        <div
          style={{
            position: "absolute",
            bottom: 200,
            opacity: interpolate(hopeSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(hopeSpring, [0, 1], [30, 0])}px)`,
            fontSize: 32,
            fontWeight: 300,
            color: "rgba(240,240,245,0.6)",
            letterSpacing: 2,
          }}
        >
          Et si ça changeait ?
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
