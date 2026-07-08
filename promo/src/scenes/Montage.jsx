import React from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Figure } from "../Figure.jsx";
import { Chip, Slam, Stamp, TypeLine } from "../kit.jsx";
import { resolveConfig } from "../vaiven/draw.js";
import { PRESETS } from "../vaiven/presets.js";
import { FAINT, INK, LINE, MONO, PAPER } from "../theme.js";

/** slide plan: preset, display name, duration, entrance, dark chrome, hint */
const SLIDES = [
  ["shell", "SHELL", 46, "pan", false, '"layout": "wave-x" · "twist": 4.72'],
  ["phosphor", "PHOSPHOR", 46, "cut", true, '"blend": "screen" · "twirl": 0.3'],
  ["feather", "FEATHER", 44, "zoom", false, '"aspect": 2.3 · "twist": 6.5'],
  ["comet", "COMET", 50, "cut", true, '"trail": 0.86 · "blend": "lighter"'],
  ["ring-bloom", "RING BLOOM", 44, "rotate", false, '"layout": "ring" · "floor": 0.21'],
  ["veil", "VEIL", 52, "pan-left", false, '"fillAlpha": 0.12 · "blend": "multiply"'],
  ["matrix-drift", "MATRIX DRIFT", 40, "zoom", false, '"layout": "matrix" · "count": 64'],
  ["spiral-fan", "SPIRAL FAN", 44, "cut", false, '"layout": "spiral" · "mirror": "x"'],
];

const INTRO = 24;
const MIDCARD = 22;
const MIDCARD_AFTER = 4; // insert after this many slides
const QUAD = 48;

export const MONTAGE_DURATION =
  INTRO + MIDCARD + QUAD + SLIDES.reduce((a, s) => a + s[2], 0);

const Slide = ({ preset, name, entrance, dark, hint, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 170 } });
  const stiff = spring({ frame, fps, config: { damping: 14, stiffness: 320 } });

  const cfg = { ...PRESETS[preset] };
  let wrapScale = 1;
  if (entrance === "pan") cfg.offsetX = 1.5 * (1 - s);
  if (entrance === "pan-left") cfg.offsetX = -1.5 * (1 - s);
  if (entrance === "zoom") cfg.zoom = (cfg.zoom || 1) * (1 + 1.9 * (1 - s));
  if (entrance === "rotate") {
    cfg.rotate = -16 * (1 - s);
    cfg.zoom = (cfg.zoom || 1) * (1 + 0.22 * (1 - s));
  }
  if (entrance === "cut") wrapScale = 1 + 0.07 * (1 - stiff);

  const ink = dark ? PAPER : INK;
  const sub = dark ? "rgba(246,245,241,0.62)" : FAINT;

  return (
    <AbsoluteFill style={{ background: dark ? cfg.colors?.bg : PAPER }}>
      <AbsoluteFill style={{ transform: `scale(${wrapScale})` }}>
        <Figure config={cfg} width={1080} height={1080} ef={frame + 40} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 76, bottom: 148 }}>
        <Slam at={4} size={72} color={ink} from={1.7} rotate={-1.5}>
          {name}
        </Slam>
      </div>
      <div style={{ position: "absolute", left: 80, bottom: 96 }}>
        <TypeLine at={9} text={hint} cps={2.4} size={21} color={sub} cursor={false} />
      </div>
      <div style={{ position: "absolute", right: 80, top: 76 }}>
        <Stamp at={2} size={19} color={sub} dir="right">
          {String(index + 1).padStart(2, "0")} / 08
        </Stamp>
      </div>
    </AbsoluteFill>
  );
};

const Card = ({ children, dark = true }) => (
  <AbsoluteFill
    style={{
      background: dark ? INK : PAPER,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

// four neighbors of ring-bloom, each one knob away
const quadBase = resolveConfig(PRESETS["ring-bloom"]);
const QUAD_CFGS = [
  quadBase,
  { ...quadBase, orbit: 0.5, coil: 16, count: 96, seed: 4 },
  { ...quadBase, shape: "hexagon", roundness: 0.25, twist: 4.2, seed: 9 },
  { ...quadBase, kaleido: 4, count: 30, zoom: 0.85, twist: 5.6, seed: 13 },
];

const QuadGrid = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {QUAD_CFGS.map((cfg, i) => {
        const s = spring({
          frame: frame - (2 + i * 4),
          fps,
          config: { damping: 14, stiffness: 260, mass: 0.7 },
        });
        const x = (i % 2) * 540;
        const y = Math.floor(i / 2) * 540;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 540,
              height: 540,
              transform: `scale(${s})`,
              opacity: s,
            }}
          >
            <Figure config={cfg} width={540} height={540} ef={frame + 30 + i * 17} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 539,
          top: 0,
          bottom: 0,
          width: 1.5,
          background: LINE,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 539,
          left: 0,
          right: 0,
          height: 1.5,
          background: LINE,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 74,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Chip at={20} size={27} rotate={-1}>
          every figure has infinite neighbors
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

export const Montage = () => {
  const seqs = [];
  let cursor = INTRO;
  SLIDES.forEach((slide, i) => {
    const [preset, name, dur, entrance, dark, hint] = slide;
    if (i === MIDCARD_AFTER) {
      seqs.push({ type: "midcard", from: cursor, dur: MIDCARD });
      cursor += MIDCARD;
    }
    seqs.push({ type: "slide", from: cursor, dur, preset, name, entrance, dark, hint, index: i });
    cursor += dur;
  });

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <Sequence durationInFrames={INTRO}>
        <Card>
          <Slam at={2} size={92} color={PAPER} from={2.4}>
            now feed it JSON.
          </Slam>
        </Card>
      </Sequence>

      {seqs.map((q, i) =>
        q.type === "midcard" ? (
          <Sequence key={i} from={q.from} durationInFrames={q.dur}>
            <Card dark={false}>
              <Slam at={2} size={66} from={2.2} rotate={1}>
                each one ≈ twenty numbers.
              </Slam>
            </Card>
          </Sequence>
        ) : (
          <Sequence key={i} from={q.from} durationInFrames={q.dur}>
            <Slide
              preset={q.preset}
              name={q.name}
              entrance={q.entrance}
              dark={q.dark}
              hint={q.hint}
              index={q.index}
            />
          </Sequence>
        )
      )}

      <Sequence from={cursor} durationInFrames={QUAD}>
        <QuadGrid />
      </Sequence>
    </AbsoluteFill>
  );
};
