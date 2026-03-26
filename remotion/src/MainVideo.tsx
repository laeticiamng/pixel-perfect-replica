import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Loneliness } from "./scenes/Scene1Loneliness";
import { Scene2Signal } from "./scenes/Scene2Signal";
import { Scene3Discovery } from "./scenes/Scene3Discovery";
import { Scene4Connection } from "./scenes/Scene4Connection";
import { Scene5Finale } from "./scenes/Scene5Finale";
import { loadFont } from "@remotion/google-fonts/Outfit";

const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
});

// Persistent cinematic background with moving gradient + noise texture
const CinematicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hue1 = interpolate(frame, [0, durationInFrames], [240, 260]);
  const hue2 = interpolate(frame, [0, durationInFrames], [250, 280]);
  const gradientY = interpolate(frame, [0, durationInFrames], [0, -15]);

  return (
    <AbsoluteFill>
      {/* Deep gradient base */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 120% 80% at 30% ${50 + gradientY}%, hsl(${hue1}, 60%, 8%) 0%, transparent 70%),
            radial-gradient(ellipse 100% 60% at 80% ${60 + gradientY}%, hsl(${hue2}, 50%, 6%) 0%, transparent 60%),
            linear-gradient(180deg, #060612 0%, #0a0a1f 30%, #0d0820 60%, #080614 100%)
          `,
        }}
      />
      {/* Film grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          transform: `translate(${(frame * 7) % 128}px, ${(frame * 3) % 128}px)`,
          mixBlendMode: "overlay",
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 70% at center, transparent 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// Floating light particles — depth layers
const AmbientParticles: React.FC = () => {
  const frame = useCurrentFrame();

  const layers = [
    { count: 8, speed: 0.008, size: [1.5, 3], opacity: [0.04, 0.12], color: "#FF6B5A" },
    { count: 6, speed: 0.012, size: [2, 4], opacity: [0.03, 0.1], color: "#9f7aea" },
    { count: 10, speed: 0.005, size: [1, 2], opacity: [0.06, 0.15], color: "#ffffff" },
  ];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {layers.map((layer, li) =>
        Array.from({ length: layer.count }, (_, i) => {
          const seed = li * 100 + i;
          const x = ((seed * 137.508) % 100);
          const baseY = ((seed * 73.137) % 100);
          const y = baseY + Math.sin((frame + seed * 40) * layer.speed) * 4;
          const o = interpolate(
            Math.sin((frame + seed * 25) * 0.015),
            [-1, 1],
            layer.opacity
          );
          const s = layer.size[0] + (seed % 3) * ((layer.size[1] - layer.size[0]) / 2);
          return (
            <div
              key={`${li}-${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: s,
                height: s,
                borderRadius: "50%",
                backgroundColor: layer.color,
                opacity: o,
                filter: `blur(${s > 2.5 ? 1 : 0}px)`,
              }}
            />
          );
        })
      )}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, overflow: "hidden" }}>
      <CinematicBackground />
      <AmbientParticles />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene1Loneliness />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene2Signal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene3Discovery />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene4Connection />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 30 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5Finale />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
