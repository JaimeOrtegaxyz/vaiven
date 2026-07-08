import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Figure } from "../Figure.jsx";
import { Stamp } from "../kit.jsx";
import { PRESETS } from "../vaiven/presets.js";
import { FAINT, INK, MONO, PAPER } from "../theme.js";

const FEATURES = [
  "pauses when offscreen",
  "static under reduced-motion",
  "hold to accelerate ×10",
  "pointer reshapes the spread",
  "custom SVG shapes ride in the JSON",
  "the whole config fits in a URL",
];

const Row = ({ at, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 13, stiffness: 240, mass: 0.7 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: s,
        transform: `translateX(${(1 - s) * -90}px)`,
        marginBottom: 34,
      }}
    >
      <div
        style={{
          width: 13,
          height: 13,
          background: INK,
          transform: "rotate(45deg)",
          flexShrink: 0,
        }}
      />
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34, color: INK, whiteSpace: "pre" }}>
        {children}
      </div>
    </div>
  );
};

export const Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const figIn = spring({ frame: frame - 8, fps, config: { damping: 15, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: "absolute", left: 92, top: 92 }}>
        <Stamp at={2} size={22} color={FAINT}>
          built-in behavior
        </Stamp>
      </div>

      <div style={{ position: "absolute", left: 92, top: 210 }}>
        {FEATURES.map((t, i) => (
          <Row key={t} at={8 + i * 13}>
            {t}
          </Row>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 30,
          opacity: figIn,
          transform: `scale(${0.7 + figIn * 0.3})`,
        }}
      >
        <Figure
          config={{ ...PRESETS["dial-hairs"], zoom: 1.9 }}
          width={430}
          height={430}
          ef={frame + 20}
        />
      </div>
    </AbsoluteFill>
  );
};
