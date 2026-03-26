import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";

import { Scene1Loneliness } from "./scenes/Scene1Loneliness";
import { Scene2Signal } from "./scenes/Scene2Signal";
import { Scene3Discovery } from "./scenes/Scene3Discovery";
import { Scene4Connection } from "./scenes/Scene4Connection";
import { Scene5Finale } from "./scenes/Scene5Finale";

const { fontFamily: spaceGrotesk } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const COLORS = {
  bg: "#0a0a1e",
  violet: "#7c3aed",
  coral: "#ff6b6b",
  white: "#f0f0ff",
  violetGlow: "#a78bfa",
};

// Persistent animated background gradient
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hueShift = interpolate(frame, [0, durationInFrames], [0, 30]);
  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 180]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, 
          hsl(${240 + hueShift}, 80%, 8%) 0%, 
          hsl(${255 + hueShift}, 60%, 12%) 40%,
          hsl(${270 + hueShift}, 50%, 6%) 100%)`,
      }}
    />
  );
};

// Floating particles layer
const FloatingParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 40 }, (_, i) => {
    const x = ((i * 137.508) % 100);
    const baseY = ((i * 97.3) % 100);
    const y = (baseY + frame * (0.02 + (i % 5) * 0.01)) % 120 - 10;
    const size = 1 + (i % 3);
    const opacity = interpolate(
      Math.sin(frame * 0.02 + i * 0.7),
      [-1, 1],
      [0.05, 0.25]
    );
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 3 === 0 ? COLORS.violet : COLORS.violetGlow,
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: spaceGrotesk }}>
      <Background />
      <FloatingParticles />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1Loneliness />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene2Signal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3Discovery />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene4Connection />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene5Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
