import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MONO } from "../theme.js";

const INK = "#1E1E1E";
const FAINT = "#8B887F";

// The trailing space is a real keystroke in the recording, so it's included.
const CMD = "npm i vaiven ";

// Keystroke onsets (seconds) detected in the recording — one per character, so
// each glyph lands exactly on its click.
const ONSETS = [
  0.095, 0.295, 0.413, 0.525, 0.618, 0.772, 0.896, 1.027, 1.136, 1.268, 1.354,
  1.477, 1.644,
];
const AUDIO_DELAY = 0.6; // seconds of white before the first key

/**
 * The payoff: plain white screen, the install command typed out in sync with
 * the real phone recording of the keypresses (cleaned + level-matched). Calm,
 * no motion tricks.
 */
export const InstallCard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioStart = Math.round(AUDIO_DELAY * fps);
  const reveals = ONSETS.map((t) => audioStart + Math.round(t * fps));

  const typed = reveals.filter((f) => frame >= f).length;
  const done = typed >= CMD.length;
  const blink = Math.floor(frame / 30) % 2 === 0;
  const showCursor = !done || blink;

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 60,
          fontWeight: 500,
          color: INK,
          whiteSpace: "pre",
          letterSpacing: "0.01em",
        }}
      >
        <span style={{ color: FAINT }}>$ </span>
        {CMD.slice(0, typed)}
        <span
          style={{
            display: "inline-block",
            width: "0.6em",
            height: "1.05em",
            marginLeft: 2,
            verticalAlign: "-0.16em",
            background: showCursor ? INK : "transparent",
          }}
        />
      </div>

      <Sequence from={audioStart}>
        <Audio src={staticFile("audio/typing.mp3")} />
      </Sequence>
    </AbsoluteFill>
  );
};
