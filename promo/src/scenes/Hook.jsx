import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Figure } from "../Figure.jsx";
import { Slam } from "../kit.jsx";
import { INK, LOUD_PINK, MONO, PAPER } from "../theme.js";

const bgFigure = {
  layout: "wave-x",
  count: 70,
  size: 2.09,
  floor: 0.05,
  aspect: 1.15,
  freq: 1.2,
  twist: 3.4,
  twirl: 0.1,
  velocity: 1.1,
  ampX: 0.8,
  ampY: 1,
  lineWidth: 0.5,
  fillAlpha: 0.07,
  strokeAlpha: 0,
  blend: "multiply",
  colors: { bg: "transparent", fill: "#6E6A8F", stroke: "#1D1D1D" },
  seed: 11,
};

const INK_AT = 44;

export const Hook = () => {
  const frame = useCurrentFrame();

  const braceScale = interpolate(frame, [76, 100], [1, 22], {
    extrapolateLeft: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const inkZoom = interpolate(frame, [84, 100], [1, 1.55], {
    extrapolateLeft: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill>
        <Figure config={bgFigure} width={1080} height={1080} />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 92, top: 200 }}>
        <Slam at={2} size={58} rotate={-3}>
          WHAT IF
        </Slam>
      </div>
      <div style={{ position: "absolute", left: 92, top: 320 }}>
        <Slam at={13} size={100} rotate={2}>
          EVERY{"\n"}ANIMATION
        </Slam>
      </div>
      <div style={{ position: "absolute", right: 92, top: 600 }}>
        <Slam at={27} size={58} rotate={-2} style={{ textAlign: "right" }}>
          ON YOUR SITE
        </Slam>
      </div>

      {frame >= INK_AT ? (
        <AbsoluteFill
          style={{
            background: INK,
            transform: `scale(${inkZoom})`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              fontFamily: MONO,
              fontWeight: 600,
              fontSize: 430,
              color: "#2E2E2E",
              transform: `scale(${braceScale})`,
              whiteSpace: "pre",
            }}
          >
            {"{ }"}
          </div>
          <Slam at={INK_AT + 3} size={66} color={PAPER}>
            WAS JUST
          </Slam>
          <div style={{ height: 34 }} />
          <Slam at={INK_AT + 12} size={224} color={PAPER} from={2.6}>
            JSON<span style={{ color: LOUD_PINK }}>?</span>
          </Slam>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
