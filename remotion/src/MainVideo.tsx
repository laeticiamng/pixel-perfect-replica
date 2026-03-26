import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Signal } from "./scenes/Scene2Signal";
import { Scene3Match } from "./scenes/Scene3Match";
import { Scene4Meet } from "./scenes/Scene4Meet";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Persistent animated background gradient
  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 180]);
  const bgStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientAngle}deg, #0D0D1F 0%, #111130 40%, #1a0a2e 70%, #0D0D1F 100%)`,
    fontFamily,
  };

  return (
    <AbsoluteFill style={bgStyle}>
      {/* Persistent floating particles */}
      <PersistentParticles />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene1Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene2Signal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene3Match />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={100}>
          <Scene4Meet />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

// Floating subtle dots that persist across the entire video
const PersistentParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = (i * 137.5) % 100;
    const baseY = (i * 73.3) % 100;
    const y = baseY + Math.sin((frame + i * 20) * 0.015) * 3;
    const opacity = interpolate(
      Math.sin((frame + i * 30) * 0.02),
      [-1, 1],
      [0.05, 0.2]
    );
    const size = 2 + (i % 3) * 1.5;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: i % 3 === 0 ? "#FF6B5A" : i % 3 === 1 ? "#7C3AED" : "#ffffff",
          opacity,
        }}
      />
    );
  });
  return <AbsoluteFill>{particles}</AbsoluteFill>;
};
