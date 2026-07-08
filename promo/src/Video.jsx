import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { MOODS } from "./moods.js";
import { MoodSection } from "./scenes/Mood.jsx";
import { InstallCard } from "./scenes/InstallCard.jsx";

for (const w of [400, 500, 600]) {
  loadFont({
    family: "Plex",
    url: staticFile(`fonts/ibm-plex-mono-${w}.woff2`),
    weight: String(w),
  });
}

// 60fps. 1.75s per mood (105 frames) hard-cutting station-to-station, then a
// 5s install card (300 frames). Each mood carries its own mid-song audio slice
// (inside MoodSection), so both picture and sound cut hard on every boundary.
export const SECTION = 105;
export const INSTALL = 300;
export const TOTAL_DURATION = MOODS.length * SECTION + INSTALL;

export const Video = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {MOODS.map((mood, i) => (
      <Sequence key={mood.id} from={i * SECTION} durationInFrames={SECTION}>
        <MoodSection mood={mood} />
      </Sequence>
    ))}

    <Sequence from={MOODS.length * SECTION} durationInFrames={INSTALL}>
      <InstallCard />
    </Sequence>
  </AbsoluteFill>
);
