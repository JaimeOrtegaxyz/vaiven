/**
 * Deterministic frame renderer for the Vaiven engine, for Remotion.
 *
 * The live engine (../../src/figure.js) advances t/drift/rotPhase per rAF
 * frame; all three are linear in elapsed engine-frames, so a Remotion frame
 * can be rendered as a pure function of (config, engineFrames). Trails, which
 * the live engine gets from canvas accumulation, are emulated by multipass
 * drawing with trail^k alpha decay.
 *
 * Geometry below is a line-for-line port of draw() in src/figure.js with the
 * interaction/rAF/observer plumbing removed. Pointer rests at center (0.5),
 * which makes the hover multiplier exactly 1.
 */

import { DEFAULTS, mergeConfig } from "../../../src/figure.js";

const TAU = Math.PI * 2;

const BLEND_MAP = {
  normal: "source-over",
  multiply: "multiply",
  screen: "screen",
  lighter: "lighter",
};

const POLYGONS = {
  square: [4, -Math.PI / 4],
  triangle: [3, -Math.PI / 2],
  diamond: [4, -Math.PI / 2],
  pentagon: [5, -Math.PI / 2],
  hexagon: [6, -Math.PI / 2],
  star: [10, -Math.PI / 2, 0.45],
};

export function resolveConfig(patch) {
  return mergeConfig(DEFAULTS, patch || {});
}

/** Engine time state after `ef` engine-frames (speed 1 unless integrated). */
export function stateAt(cfg, ef) {
  const dt = cfg.velocity * 3;
  return {
    t: cfg.seed * 997 + ef * dt,
    drift: cfg.seed * 1.7 + ef * dt * 0.003,
    rotPhase: cfg.seed * 2.3 + ef * dt * cfg.twirl * 0.003,
  };
}

function hexToRgb(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rampAt(ramp, pos) {
  const n = ramp.length;
  if (n === 1) return ramp[0];
  const x = (pos - Math.floor(pos)) * n;
  const i = Math.floor(x) % n;
  const f = x - Math.floor(x);
  const a = hexToRgb(ramp[i]);
  const b = hexToRgb(ramp[(i + 1) % n]);
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(",")})`;
}

function tracePolygon(ctx, spec, rx, ry, roundness) {
  const [sides, offset, inner] = spec;
  const pts = [];
  for (let k = 0; k < sides; k++) {
    const ang = offset + (k / sides) * TAU;
    const rr = inner && k % 2 ? inner : 1;
    pts.push([Math.cos(ang) * rx * rr, Math.sin(ang) * ry * rr]);
  }
  if (roundness < 0.01) {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < sides; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
    return;
  }
  ctx.moveTo((pts[sides - 1][0] + pts[0][0]) / 2, (pts[sides - 1][1] + pts[0][1]) / 2);
  for (let k = 0; k < sides; k++) {
    const prev = pts[(k + sides - 1) % sides];
    const v = pts[k];
    const next = pts[(k + 1) % sides];
    const a1x = prev[0] - v[0], a1y = prev[1] - v[1];
    const a2x = next[0] - v[0], a2y = next[1] - v[1];
    const l1 = Math.hypot(a1x, a1y), l2 = Math.hypot(a2x, a2y);
    let r = 0;
    if (l1 > 1e-6 && l2 > 1e-6) {
      const dot = Math.max(-1, Math.min(1, (a1x * a2x + a1y * a2y) / (l1 * l2)));
      const theta = Math.acos(dot);
      r = Math.min(1e4, roundness * Math.tan(theta / 2) * Math.min(l1, l2) * 0.5);
    }
    ctx.arcTo(v[0], v[1], (v[0] + next[0]) / 2, (v[1] + next[1]) / 2, Math.max(0, r));
  }
  ctx.closePath();
}

/** One pass of the figure at a given time state. Does not touch the bg. */
function drawPass(ctx, cfg, w, h, state, alphaScale) {
  const { t, drift, rotPhase } = state;

  ctx.save();
  ctx.strokeStyle = cfg.colors.stroke;
  ctx.globalCompositeOperation = BLEND_MAP[cfg.blend] || "source-over";
  const ox = Math.max(-1.5, Math.min(1.5, cfg.offsetX || 0));
  const oy = Math.max(-1.5, Math.min(1.5, cfg.offsetY || 0));
  ctx.translate(w / 2 + ox * (w / 2), h / 2 + oy * (h / 2));
  if (cfg.rotate) ctx.rotate((cfg.rotate * Math.PI) / 180);
  const zoom = Math.max(0.05, cfg.zoom || 1);
  if (zoom !== 1) ctx.scale(zoom, zoom);

  const unit = Math.min(w, h) / 340;
  const n = Math.max(1, Math.round(cfg.count));
  const freq = Math.max(0.0001, cfg.freq);
  const amp = 80 * unit;
  const aX = cfg.ampX;
  const aY = cfg.ampY;
  const sizeMax = 30 * unit * cfg.size;
  const sizeMin = sizeMax * Math.max(0, Math.min(1, cfg.floor));
  const sqA = Math.sqrt(Math.max(0.05, cfg.aspect));
  const roundness = Math.max(0, Math.min(1, cfg.roundness));
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const ramp = cfg.colors.ramp && cfg.colors.ramp.length ? cfg.colors.ramp : null;
  const poly = POLYGONS[cfg.shape] || null;

  let effLW = Math.max(0, cfg.lineWidth);
  const fillA = cfg.fillAlpha * alphaScale;
  let strokeA = (effLW > 0 ? cfg.strokeAlpha : 0) * alphaScale;
  if (cfg.fillAlpha <= 0 && (effLW > 0 ? cfg.strokeAlpha : 0) <= 0) {
    strokeA = alphaScale;
    effLW = Math.max(effLW, 0.35);
  }
  ctx.lineWidth = effLW / zoom;

  const m = cfg.mirror;
  const passes = [[1, 1]];
  if (m === "x" || m === "xy") passes.push([-1, 1]);
  if (m === "y" || m === "xy") passes.push([1, -1]);
  if (m === "xy") passes.push([-1, -1]);

  const K = Math.max(1, Math.round(cfg.kaleido || 1));
  for (let k = 0; k < K; k++) {
    if (k) {
      ctx.save();
      ctx.rotate((k / K) * TAU);
    }
    for (const [sx, sy] of passes) {
      ctx.save();
      ctx.scale(sx, sy);
      for (let i = 0; i < n; i++) {
        const p = n > 1 ? i / (n - 1) : 0;
        const th = p * TAU * freq + drift;

        let x = 0, y = 0;
        switch (cfg.layout) {
          case "wave-y":
            x = Math.sin(th) * amp * aX;
            y = (p - 0.5) * h * 0.85 * aY;
            break;
          case "ring":
            x = Math.cos(th) * amp * 1.6 * aX;
            y = Math.sin(th) * amp * 1.6 * aY;
            break;
          case "spiral": {
            const th2 = p * TAU * freq * 2 + drift;
            const rad = (0.12 + 0.88 * p) * amp * 1.8;
            x = Math.cos(th2) * rad * aX;
            y = Math.sin(th2) * rad * aY;
            break;
          }
          case "dial": {
            const thd = p * TAU + drift;
            x = Math.cos(thd) * amp * 0.2 * aX;
            y = Math.sin(thd) * amp * 0.2 * aY;
            break;
          }
          case "matrix": {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const spacing = (Math.min(w, h) * 0.8) / cols;
            x = (col - (cols - 1) / 2) * spacing +
              Math.cos(col * 0.9 + row * 0.4 + t * 0.002) * spacing * 0.22 * aX;
            y = (row - (rows - 1) / 2) * spacing +
              Math.sin(row * 0.9 + col * 0.4 + t * 0.002) * spacing * 0.22 * aY;
            break;
          }
          default: // wave-x
            x = (p - 0.5) * w * 0.85 * aX;
            y = Math.sin(th) * amp * aY;
        }

        if (cfg.orbit) {
          const oa = p * TAU * cfg.coil + drift * 2;
          x += Math.cos(oa) * cfg.orbit * amp * 0.6;
          y += Math.sin(oa) * cfg.orbit * amp * 0.6;
        }

        const breath = 0.5 + 0.5 * Math.sin(t * 0.002 + i / (Math.PI * freq));
        let r = sizeMin + (sizeMax - sizeMin) * breath;
        if (cfg.noise) {
          r += (Math.sin(i * 0.13) * 13 + Math.sin(i * 1.57) * 6 +
                Math.sin(i * 0.71) * 0.31 + Math.sin(i * 0.33) * 1.7) * cfg.noise * unit;
        }
        r = Math.max(0.1, r);
        if (cfg.layout === "dial") r *= 0.25 + 0.75 * (1 - p);
        const rx = r * sqA;
        const ry = r / sqA;
        const rot = i * cfg.twist * 0.03 + rotPhase;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = ramp ? rampAt(ramp, p + t * 0.0004) : cfg.colors.fill;
        ctx.beginPath();
        if (poly) tracePolygon(ctx, poly, rx, ry, roundness);
        else ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
        if (fillA > 0) {
          ctx.globalAlpha = fillA;
          ctx.fill();
        }
        if (strokeA > 0) {
          ctx.globalAlpha = strokeA;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      ctx.restore();
    }
    if (k) ctx.restore();
  }
  ctx.restore();
}

/**
 * Render one video frame of a figure.
 *
 * @param ctx    2d context
 * @param patch  partial Vaiven config (merged over DEFAULTS)
 * @param opts   { w, h, dpr, ef } — design-space size, device-pixel ratio,
 *               elapsed engine-frames (may be fractional after integration)
 */
export function drawVaivenFrame(ctx, patch, { w, h, dpr = 1, ef = 0 }) {
  const cfg = resolveConfig(patch);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  const bg = cfg.colors.bg;
  if (!bg || bg === "transparent") ctx.clearRect(0, 0, w, h);
  else {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  const trail = Math.max(0, Math.min(0.985, cfg.trail || 0));
  if (trail > 0) {
    // emulate canvas accumulation: k engine-frames ago survives at trail^k
    const K = Math.min(48, Math.ceil(Math.log(0.02) / Math.log(trail)));
    for (let k = K; k >= 0; k--) {
      drawPass(ctx, cfg, w, h, stateAt(cfg, ef - k), Math.pow(trail, k));
    }
  } else {
    drawPass(ctx, cfg, w, h, stateAt(cfg, ef), 1);
  }
}
