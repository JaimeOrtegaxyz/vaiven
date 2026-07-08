import React from "react";
import { Composition } from "remotion";
import { TOTAL_DURATION, Video } from "./Video.jsx";

export const RemotionRoot = () => (
  <Composition
    id="vaiven-promo"
    component={Video}
    durationInFrames={TOTAL_DURATION}
    fps={60}
    width={1080}
    height={1080}
  />
);
