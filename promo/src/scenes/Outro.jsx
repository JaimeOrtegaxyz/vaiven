import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Figure } from "../Figure.jsx";
import { Stamp } from "../kit.jsx";
import { FAINT, INK, LINE, MONO, PANEL, PAPER } from "../theme.js";

const calm = {
  layout: "wave-x",
  count: 70,
  size: 2.09,
  floor: 0.05,
  aspect: 1.15,
  freq: 1.2,
  twist: 3.4,
  twirl: 0.08,
  velocity: 0.7,
  ampX: 0.8,
  ampY: 1,
  offsetY: -0.16,
  lineWidth: 0.5,
  fillAlpha: 0.07,
  strokeAlpha: 0,
  blend: "multiply",
  colors: { bg: "transparent", fill: "#6E6A8F", stroke: "#1D1D1D" },
  seed: 42,
};

export const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordIn = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const chipIn = spring({
    frame: frame - 78,
    fps,
    config: { damping: 14, stiffness: 220 },
  });
  const figOp = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: PAPER, alignItems: "center" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: figOp }}>
        <Figure config={calm} width={860} height={860} ef={frame} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 360,
          height: 480,
          background:
            "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(246,245,241,0.92) 0%, rgba(246,245,241,0.55) 55%, rgba(246,245,241,0) 78%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 400,
          textAlign: "center",
          opacity: wordIn,
          transform: `scale(${0.94 + wordIn * 0.06})`,
        }}
      >
        <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 128, color: INK }}>
          vaiven
        </div>
      </div>

      <div style={{ position: "absolute", top: 580, display: "flex", justifyContent: "center" }}>
        <Stamp at={42} size={24} color={INK} dir="down">
          the swing of things
        </Stamp>
      </div>
      <div style={{ position: "absolute", top: 636, display: "flex", justifyContent: "center" }}>
        <Stamp at={58} size={17} color={FAINT} dir="down" weight={500}>
          calm · looping · generative figures for the web
        </Stamp>
      </div>

      {frame >= 78 ? (
        <div
          style={{
            position: "absolute",
            top: 730,
            opacity: chipIn,
            transform: `scale(${0.8 + chipIn * 0.2})`,
            background: PANEL,
            border: `1.5px solid ${LINE}`,
            borderRadius: 8,
            padding: "18px 34px",
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: 32,
            color: INK,
            boxShadow: "0 1px 2px rgba(30,30,30,0.05), 0 10px 30px rgba(30,30,30,0.08)",
          }}
        >
          <span style={{ color: FAINT }}>$ </span>npm i vaiven
        </div>
      ) : null}

      <div style={{ position: "absolute", bottom: 64 }}>
        <Stamp at={100} size={16} color={FAINT} dir="down" weight={500}>
          github.com/JaimeOrtegaxyz/vaiven
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};
