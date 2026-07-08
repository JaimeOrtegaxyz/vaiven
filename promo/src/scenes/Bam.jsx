import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FALLBACK } from "../../../src/figure.js";
import { Figure } from "../Figure.jsx";
import { Chip, Stamp } from "../kit.jsx";
import { INK, LOUD_GREEN, shake } from "../theme.js";

export const Bam = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, 15, 20);
  const punch = interpolate(frame, [2, 11], [1.16, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const creep = interpolate(frame, [11, 95], [1, 1.05], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: LOUD_GREEN }}>
      {frame >= 2 ? (
        <AbsoluteFill
          style={{
            transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${punch * creep})`,
          }}
        >
          <Figure config={FALLBACK} width={1080} height={1080} />
        </AbsoluteFill>
      ) : null}

      <div style={{ position: "absolute", left: 84, bottom: 200 }}>
        <Chip at={10} size={46} rotate={-1.2}>
          THE FALLBACK.
        </Chip>
      </div>
      <div style={{ position: "absolute", left: 88, bottom: 130 }}>
        <Stamp at={26} size={23} color={INK}>
          broken embeds are impossible to miss
        </Stamp>
      </div>
      <div style={{ position: "absolute", right: 84, top: 84 }}>
        <Stamp at={16} size={20} color={INK} dir="right">
          {"<vaiven-figure>"} · no config
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};
