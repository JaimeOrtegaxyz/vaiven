import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FAINT, INK, LINE, MONO, PANEL, PAPER } from "./theme.js";

/** Word that slams in with a spring scale punch. */
export const Slam = ({
  at,
  children,
  size = 72,
  color = INK,
  weight = 600,
  from = 2.1,
  rotate = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 14, stiffness: 260, mass: 0.7 } });
  const scale = interpolate(s, [0, 1], [from, 1]);
  const opacity = interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.02,
        color,
        opacity,
        transform: `scale(${scale}) rotate(${rotate * (1 - s)}deg)`,
        transformOrigin: "center",
        whiteSpace: "pre",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Uppercase letter-spaced label that slides in from a side. */
export const Stamp = ({
  at,
  children,
  size = 22,
  color = FAINT,
  dir = "left",
  dist = 26,
  weight = 600,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 18, stiffness: 220 } });
  const d = (1 - s) * dist * (dir === "left" ? -1 : dir === "right" ? 1 : 0);
  const dy = (1 - s) * dist * (dir === "up" ? -1 : dir === "down" ? 1 : 0);
  return (
    <div
      style={{
        fontFamily: MONO,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: s,
        transform: `translate(${d}px, ${dy}px)`,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Ink chip — solid ink block with paper text, springs in. */
export const Chip = ({ at, children, size = 26, rotate = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 13, stiffness: 300, mass: 0.6 } });
  return (
    <div
      style={{
        display: "inline-block",
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: size,
        color: PAPER,
        background: INK,
        padding: "0.42em 0.7em",
        borderRadius: 4,
        transform: `scale(${interpolate(s, [0, 1], [1.6, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(f, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
        whiteSpace: "pre",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Text typed on per-frame steps, with a block cursor. */
export const TypeLine = ({
  at,
  text,
  cps = 1.4, // chars per frame
  size = 30,
  color = INK,
  cursor = true,
  weight = 500,
  style,
}) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0) return null;
  const chars = Math.min(text.length, Math.floor(f * cps));
  const done = chars >= text.length;
  const blink = Math.floor(frame / 9) % 2 === 0;
  return (
    <span
      style={{
        fontFamily: MONO,
        fontWeight: weight,
        fontSize: size,
        color,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {text.slice(0, chars)}
      {cursor && (!done || blink) ? (
        <span style={{ background: color, color: "transparent" }}>█</span>
      ) : null}
    </span>
  );
};

/** Drafting-minimal terminal / editor panel. */
export const Panel = ({ children, title, width = 780, style }) => (
  <div
    style={{
      width,
      background: PANEL,
      border: `1.5px solid ${LINE}`,
      borderRadius: 8,
      boxShadow:
        "0 1px 2px rgba(30,30,30,0.05), 0 8px 28px rgba(30,30,30,0.08), 0 24px 64px rgba(30,30,30,0.07)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 18px",
        borderBottom: `1.5px solid ${LINE}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ width: 10, height: 10, borderRadius: 99, background: LINE }}
        />
      ))}
      {title ? (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 15,
            fontWeight: 500,
            color: FAINT,
            marginLeft: 10,
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </div>
      ) : null}
    </div>
    <div style={{ padding: "26px 30px" }}>{children}</div>
  </div>
);

/** Row of a JSON config listing; highlights when active. */
export const JsonRow = ({ k, v, active, size = 23, vColor }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      fontWeight: active ? 600 : 400,
      lineHeight: 1.75,
      color: active ? PAPER : FAINT,
      background: active ? INK : "transparent",
      borderRadius: 3,
      padding: "0 10px",
      whiteSpace: "pre",
    }}
  >
    <span style={{ opacity: active ? 0.75 : 1 }}>"{k}"</span>
    <span style={{ opacity: 0.6 }}>: </span>
    <span
      style={{
        color: active ? PAPER : vColor || INK,
        fontWeight: active ? 600 : 500,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {v}
    </span>
    <span style={{ opacity: 0.6 }}>,</span>
  </div>
);
