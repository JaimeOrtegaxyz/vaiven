import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { drawVaivenFrame } from "./vaiven/draw.js";

/**
 * A Vaiven figure as a Remotion-driven canvas.
 *
 * width/height are display pixels inside the 1080 comp; the engine sees
 * width/pixelRatio css-ish units so hairline strokes read like the real
 * component does on a retina screen.
 *
 * `ef` — elapsed engine-frames. Defaults to the current frame (engine fps ==
 * video fps == 30), pass your own for offsets / speed ramps.
 */
export const Figure = ({
  config,
  width,
  height,
  ef,
  pixelRatio = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const ref = useRef(null);
  const engineFrames = ef === undefined ? frame : ef;
  const w = width / pixelRatio;
  const h = height / pixelRatio;
  const key = useMemo(() => JSON.stringify(config), [config]);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawVaivenFrame(ctx, config, { w, h, dpr: pixelRatio, ef: engineFrames });
  }, [key, engineFrames, w, h, pixelRatio, config]);

  return (
    <canvas
      ref={ref}
      width={Math.round(width)}
      height={Math.round(height)}
      style={{ width, height, display: "block", ...style }}
    />
  );
};
