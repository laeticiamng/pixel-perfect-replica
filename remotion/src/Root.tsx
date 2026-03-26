import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 5 scenes: 150+120+150+120+120 = 660 frames
// 4 transitions × 20 frames = 80 frames overlap
// Total: 660 - 80 = 580 frames ≈ 19.3s at 30fps
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={580}
    fps={30}
    width={1920}
    height={1080}
  />
);
