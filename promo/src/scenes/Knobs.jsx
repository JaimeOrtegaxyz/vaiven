import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Figure } from "../Figure.jsx";
import { Chip, JsonRow, Panel, Slam, Stamp } from "../kit.jsx";
import { FAINT, INK, LINE, MONO, PAPER } from "../theme.js";

export const KNOBS_DURATION = 300;

const LAYOUT_FLIPS = [
  [130, "wave-x"],
  [144, "ring"],
  [158, "spiral"],
  [172, "dial"],
  [186, "wave-x"],
];

/** All animated knob values as a pure function of the scene frame. */
function knobsAt(f) {
  const ease = Easing.inOut(Easing.cubic);

  let count = Math.round(
    interpolate(f, [26, 64], [14, 96], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: ease,
    })
  );
  const twist = interpolate(f, [80, 124], [0, 7.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

  let layout = "wave-x";
  for (const [at, name] of LAYOUT_FLIPS) if (f >= at) layout = name;

  const kaleido = Math.round(
    interpolate(f, [190, 224], [1, 6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const mirror = f >= 228 ? "xy" : "off";
  const zoom = interpolate(f, [190, 240], [1, 0.68], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  if (f >= 186) {
    count = Math.round(
      interpolate(f, [186, 214], [96, 38], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: ease,
      })
    );
  }

  let active = null;
  if (f >= 20 && f < 75) active = "count";
  else if (f < 130) active = "twist";
  else if (f < 186) active = "layout";
  else if (f < 228) active = "kaleido";
  else if (f < 244) active = "mirror";

  return { count, twist, layout, kaleido, mirror, zoom, active };
}

/** Engine-frames with the engine's own press-acceleration easing (×10 hold). */
function efAt(f) {
  if (f <= 240) return f;
  let ef = 240;
  let speed = 1;
  for (let i = 241; i <= f; i++) {
    const target = i > 248 && i < 294 ? 10 : 1;
    speed += (target - speed) * 0.08;
    ef += speed;
  }
  return ef;
}

const CAPTIONS = [
  [20, 75, "count."],
  [75, 130, "twist."],
  [130, 186, "layout."],
  [186, 240, "kaleido."],
];

export const Knobs = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = knobsAt(frame);
  const ef = efAt(frame);

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 170 } });

  const cfg = {
    layout: k.layout,
    shape: "circle",
    count: k.count,
    size: 1.25,
    floor: 0.22,
    aspect: 1.8,
    freq: 1.5,
    twist: k.twist,
    twirl: 0.3,
    velocity: 1.2,
    ampX: 0.87,
    ampY: 1,
    zoom: k.zoom,
    mirror: k.mirror,
    kaleido: k.kaleido,
    lineWidth: 0.5,
    seed: 3,
  };

  // small pop on each layout flip
  let flipPop = 1;
  for (const [at] of LAYOUT_FLIPS) {
    const d = frame - at;
    if (d >= 0 && d < 8) flipPop = 1 + 0.05 * (1 - d / 8);
  }

  const holding = frame > 248 && frame < 294;
  const pressScale = holding ? 0.97 : 1;

  const rows = [
    ["layout", `"${k.layout}"`],
    ["count", `${k.count}`],
    ["size", "1.25"],
    ["floor", "0.22"],
    ["freq", "1.5"],
    ["twist", k.twist.toFixed(1)],
    ["twirl", "0.3"],
    ["mirror", `"${k.mirror}"`],
    ["kaleido", `${k.kaleido}`],
    ["velocity", "1.2"],
  ];

  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <div style={{ position: "absolute", left: 84, top: 74 }}>
        <Stamp at={4} size={21} color={FAINT}>
          one config · turn the knobs
        </Stamp>
      </div>

      <div
        style={{
          position: "absolute",
          left: 30,
          top: 220,
          width: 640,
          height: 640,
          transform: `scale(${flipPop * pressScale})`,
          opacity: enter,
        }}
      >
        <Figure config={cfg} width={640} height={640} ef={ef} />

        {frame >= 244 && frame < 298 ? <PressCursor /> : null}
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          top: 240,
          transform: `translateX(${(1 - enter) * 420}px)`,
        }}
      >
        <Panel width={352} title="config.json">
          <div style={{ fontFamily: MONO, fontSize: 22, color: FAINT }}>{"{"}</div>
          {rows.map(([key, v]) => (
            <JsonRow key={key} k={key} v={v} active={k.active === key} />
          ))}
          <div style={{ fontFamily: MONO, fontSize: 22, color: FAINT }}>{"}"}</div>
        </Panel>
      </div>

      {CAPTIONS.map(([from, to, text]) => (
        <Sequence key={text} from={from} durationInFrames={to - from}>
          <div style={{ position: "absolute", left: 88, bottom: 96 }}>
            <Slam at={0} size={60} from={1.9} rotate={-1.5}>
              {text}
            </Slam>
          </div>
        </Sequence>
      ))}

      <Sequence from={240} durationInFrames={60}>
        <div style={{ position: "absolute", left: 88, bottom: 96 }}>
          <Chip at={4} size={38} rotate={-1.5}>
            hold = ×10
          </Chip>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

/** A pointer dot with expanding press ripples, centered on the figure. */
const PressCursor = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - 244;
  const inS = spring({ frame: f, fps, config: { damping: 12, stiffness: 300 } });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      {[0, 1].map((i) => {
        const cycle = ((f * 1.4 + i * 14) % 28) / 28;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 30 + cycle * 120,
              height: 30 + cycle * 120,
              marginLeft: -(30 + cycle * 120) / 2,
              marginTop: -(30 + cycle * 120) / 2,
              borderRadius: 999,
              border: `2px solid ${INK}`,
              opacity: (1 - cycle) * 0.5 * (f > 5 ? 1 : 0),
            }}
          />
        );
      })}
      <div
        style={{
          width: 26,
          height: 26,
          marginLeft: -13,
          marginTop: -13,
          borderRadius: 999,
          background: INK,
          border: `3px solid ${PAPER}`,
          boxShadow: "0 2px 10px rgba(30,30,30,0.35)",
          transform: `scale(${inS})`,
        }}
      />
    </div>
  );
};
