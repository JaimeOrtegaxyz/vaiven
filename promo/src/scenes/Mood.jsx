import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "../Figure.jsx";
import { Logo } from "../Logo.jsx";
import { luminance, pickLogoColor } from "../logo-color.js";

const CREAM = "#F5F4F1";
const INK = "#141414";

/**
 * One mood-world: a full-bleed Vaiven figure with the wordmark locked
 * dead-center, recoloured from this mood's own palette (see pickLogoColor),
 * and its own music — a hard slice from the middle of that genre's track.
 * Everything is present from frame 0: pure hard cut.
 *
 * The engine was tuned at 30 steps/sec, so we advance it by 30/fps per video
 * frame — motion stays identical regardless of the composition fps.
 */
export const MoodSection = ({ mood }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const engineFrames = frame * (30 / fps) + (mood.efOffset || 0);
  const logoColor = pickLogoColor(mood.config.colors);
  // A contrasting keyline behind the fill keeps the mark readable where the
  // tint would otherwise blend into same-coloured artwork. Neutral fills
  // (cream/ink) already have max contrast, so they skip it.
  const isNeutral = logoColor === CREAM || logoColor === INK;
  const outline = isNeutral ? undefined : luminance(logoColor) > 0.5 ? INK : CREAM;

  return (
    <AbsoluteFill style={{ background: mood.config.colors.bg, overflow: "hidden" }}>
      <Figure config={mood.config} width={1080} height={1080} ef={engineFrames} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Logo color={logoColor} outline={outline} outlineWidth={outline ? 4 : 0} width={864} />
      </AbsoluteFill>

      {mood.music ? (
        <Audio src={staticFile(mood.music)} startFrom={mood.musicStartFrame || 0} />
      ) : null}
    </AbsoluteFill>
  );
};
