import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Chip, Panel, TypeLine } from "../kit.jsx";
import { FAINT, INK, MONO, PAPER } from "../theme.js";

const OutRow = ({ at, children, color = INK }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 240 } });
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 28,
        lineHeight: 1.6,
        color,
        opacity: s,
        transform: `translateX(${(1 - s) * -18}px)`,
        whiteSpace: "pre",
      }}
    >
      {children}
    </div>
  );
};

export const Install = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const termIn = spring({ frame, fps, config: { damping: 15, stiffness: 160 } });
  const edIn = spring({
    frame: frame - 76,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

  // stepped punch-zoom toward the empty tag before the cut
  const steps = frame >= 140 ? Math.min(3, Math.floor((frame - 140) / 9) + 1) : 0;
  const zoom = 1 + steps * 0.085;

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <AbsoluteFill
        style={{ transform: `scale(${zoom})`, transformOrigin: "62% 60%" }}
      >
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 150,
            transform: `translateY(${(1 - termIn) * 900}px)`,
          }}
        >
          <Panel width={860} title="terminal">
            <div style={{ fontFamily: MONO, fontSize: 30 }}>
              <span style={{ color: FAINT, fontWeight: 500 }}>$ </span>
              <TypeLine at={8} text="npm i vaiven" cps={0.85} size={30} weight={600} />
            </div>
            <div style={{ height: 14 }} />
            <OutRow at={30}>+ vaiven@0.1.0</OutRow>
            <OutRow at={38} color={FAINT}>
              2 files · zero dependencies · ~15 KB
            </OutRow>
          </Panel>
        </div>

        <div style={{ position: "absolute", right: 96, top: 96 }}>
          <Chip at={58} size={27} rotate={-2.5}>
            THAT'S THE WHOLE INSTALL.
          </Chip>
        </div>

        {frame >= 76 ? (
          <div
            style={{
              position: "absolute",
              left: 160,
              top: 560,
              transform: `translateX(${(1 - edIn) * 1100}px)`,
            }}
          >
            <Panel width={860} title="index.html">
              <div style={{ fontFamily: MONO, fontSize: 29 }}>
                <TypeLine
                  at={86}
                  text="<vaiven-figure></vaiven-figure>"
                  cps={1.6}
                  size={29}
                  weight={500}
                />
              </div>
            </Panel>
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 830,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Chip at={118} size={34} rotate={1.5}>
            wait — no config?
          </Chip>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
