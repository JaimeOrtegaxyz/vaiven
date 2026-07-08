/**
 * Vaiven — a config-driven Canvas 2D instrument for generative figures.
 *
 * Every animation is one JSON config: N simple shapes whose position, size
 * and rotation are parametric functions of (index, time). Calm perpetual
 * motion, hold-to-accelerate. Zero dependencies.
 *
 * The organic feel comes from stacked sines (not Perlin noise): a slow global
 * drift, a breathing size wave between `floor` and `size`, and an irregular
 * per-index `noise` term. Overlap of many near-identical shapes makes the
 * pattern.
 */

const TAU = Math.PI * 2;

export const LAYOUTS = ["wave-x", "wave-y", "ring", "spiral", "dial", "matrix"];
export const SHAPES = ["circle", "square", "triangle", "diamond", "pentagon", "hexagon", "custom"];
export const BLENDS = ["normal", "multiply", "screen", "lighter"];
export const MIRRORS = ["off", "x", "y", "xy"];

const BLEND_MAP = {
  normal: "source-over",
  multiply: "multiply",
  screen: "screen",
  lighter: "lighter",
};

// [sides, first-vertex angle, inner-radius ratio for stars]
const POLYGONS = {
  square: [4, -Math.PI / 4],
  triangle: [3, -Math.PI / 2],
  diamond: [4, -Math.PI / 2],
  pentagon: [5, -Math.PI / 2],
  hexagon: [6, -Math.PI / 2],
  star: [10, -Math.PI / 2, 0.45],
};

export const DEFAULTS = {
  layout: "wave-x", // wave-x | wave-y | ring | spiral | dial | matrix
  shape: "circle",  // circle | square | triangle | diamond | pentagon | hexagon | star | custom
  path: "",  //       SVG path data, used when shape is "custom"
  count: 60, //       number of shapes drawn
  size: 1, //         size of the largest shapes
  floor: 1, //        smallest size as a fraction of size (1 = all equal)
  aspect: 1, //       wide vs tall squash, area-preserving (0.2 .. 5)
  roundness: 0, //    corner rounding for angular shapes (0 .. 1)
  freq: 1, //         wave cycles across the index sweep
  noise: 0, //        per-index size irregularity (stacked sines)
  twist: 0, //        per-index rotation increment — the fan/spiral pitch
  twirl: 0, //        whole-figure rotation rate (accumulated, never jumps)
  velocity: 1, //     time speed
  ampX: 0.8, //       horizontal spread of the placement pattern
  ampY: 0.8, //       vertical spread of the placement pattern
  zoom: 1, //         camera framing; scales figure + spacing, never the stroke
  offsetX: 0, //      view pan; ±1 = figure center at the view edge, up to ±1.5
  offsetY: 0, //      view pan; ±1 = figure center at the view edge, up to ±1.5
  rotate: 0, //       view rotation in degrees
  mirror: "off", //   off | x | y | xy
  kaleido: 1, //      radial repeats of the whole figure around the center
  orbit: 0, //        radius of a secondary circle each shape rides — coils/tubes
  coil: 12, //        how many times the orbit winds across the sweep
  lineWidth: 0.5, //  0 = no outline
  fillAlpha: 1, //    fill opacity — low values + multiply/screen give washes
  strokeAlpha: 1, //  stroke opacity
  blend: "normal", // normal | multiply | screen | lighter
  trail: 0, //        0 = clean redraw each frame, toward 1 = motion trails
  fps: 30,
  seed: 0, //         phase offset; same params, different moment
  colors: { bg: "transparent", fill: "#EFEFEF", stroke: "#1D1D1D", ramp: null },
  interact: { press: true, hover: true, pauseOffscreen: true },
};

/**
 * Shown when there is literally no config to load (no attributes, failed
 * fetch, empty hash). Deliberately loud — like magenta missing-texture
 * materials — so an unconfigured embed is impossible to miss.
 */
export const FALLBACK = {
  layout: "wave-y",
  shape: "circle",
  count: 115,
  size: 1.8,
  floor: 0.2,
  aspect: 0.25,
  freq: 4,
  twist: 5.3,
  twirl: 0.8,
  velocity: 2,
  ampX: 1.15,
  ampY: 0.4,
  orbit: 0.1,
  coil: 1,
  lineWidth: 0.75,
  colors: { bg: "#00FF00", fill: "#FF1490", stroke: "#1D1D1D" },
};

/** Map legacy config keys (pre-rename) onto the current schema. */
export function normalizeConfig(patch = {}) {
  const p = { ...patch };
  if (p.shape === "ellipse") p.shape = "circle";
  if (p.shape === "rect") p.shape = "square";
  if (typeof p.mirror === "boolean") p.mirror = p.mirror ? "x" : "off";
  if (p.lineart !== undefined) {
    if (p.lineart && p.fillAlpha === undefined) p.fillAlpha = 0;
    delete p.lineart;
  }
  if (p.scale !== undefined || p.lump !== undefined) {
    const scale = p.scale ?? 1;
    const lump = p.lump ?? 0;
    if (p.size === undefined) p.size = scale * (1 + lump);
    if (p.floor === undefined) p.floor = Math.max(0, Math.min(1, (1 - lump) / (1 + lump)));
    delete p.scale;
    delete p.lump;
  }
  return p;
}

export function mergeConfig(base, patch = {}) {
  const p = normalizeConfig(patch);
  const out = { ...base, ...p };
  out.colors = { ...base.colors, ...(p.colors || {}) };
  out.interact = { ...base.interact, ...(p.interact || {}) };
  return out;
}

function hexToRgb(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Cyclic ramp sample: pos 0..1 wraps smoothly back to the first stop. */
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

// Custom SVG paths, normalized once to a centered [-1, 1] box and cached.
const pathCache = new Map();
function getCustomPath(d) {
  if (pathCache.has(d)) return pathCache.get(d);
  let entry = null;
  try {
    const raw = new Path2D(d);
    let bx = -1, by = -1, bw = 2, bh = 2;
    if (typeof document !== "undefined" && document.body) {
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      const pathEl = document.createElementNS(ns, "path");
      pathEl.setAttribute("d", d);
      svg.appendChild(pathEl);
      svg.setAttribute("width", "0");
      svg.setAttribute("height", "0");
      svg.style.position = "absolute";
      svg.style.visibility = "hidden";
      document.body.appendChild(svg);
      const b = pathEl.getBBox();
      document.body.removeChild(svg);
      if (b.width > 0 && b.height > 0) {
        bx = b.x; by = b.y; bw = b.width; bh = b.height;
      }
    }
    const s = 2 / Math.max(bw, bh);
    const norm = new Path2D();
    norm.addPath(raw, new DOMMatrix([s, 0, 0, s, -(bx + bw / 2) * s, -(by + bh / 2) * s]));
    entry = norm;
  } catch {
    entry = null; // no Path2D/DOMMatrix here — caller falls back to a circle
  }
  pathCache.set(d, entry);
  return entry;
}

/** Trace a (possibly rounded) polygon inscribed in the rx/ry ellipse. */
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
      // max radius whose tangent points stay within the half-edges
      r = Math.min(1e4, roundness * Math.tan(theta / 2) * Math.min(l1, l2) * 0.5);
    }
    ctx.arcTo(v[0], v[1], (v[0] + next[0]) / 2, (v[1] + next[1]) / 2, Math.max(0, r));
  }
  ctx.closePath();
}

export function createFigure(canvas, config = {}) {
  const ctx = canvas.getContext("2d");
  let cfg = mergeConfig(DEFAULTS, config);

  let t = cfg.seed * 997; //   time counter (breathing, ramp flow, jitter)
  let drift = cfg.seed * 1.7; // accumulated wave-phase drift
  let rotPhase = cfg.seed * 2.3; // accumulated whole-figure rotation
  let speed = 1; //            press-acceleration multiplier
  let pressed = false;
  let px = 0.5, py = 0.5; //   eased pointer position (0..1), rests at center
  let pxT = 0.5, pyT = 0.5;
  let running = false;
  let visible = true;
  let destroyed = false;
  let raf = 0;
  let last = 0;
  let w = 340, h = 270, dpr = 1;

  const reducedMQ =
    typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;

  function resize() {
    dpr = Math.min(2, (typeof devicePixelRatio === "number" && devicePixelRatio) || 1);
    const rect = canvas.getBoundingClientRect();
    w = rect.width || 340;
    h = rect.height || 270;
    const bw = Math.max(1, Math.round(w * dpr));
    const bh = Math.max(1, Math.round(h * dpr));
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const bg = cfg.colors.bg;
    const transparent = !bg || bg === "transparent";
    const trail = Math.max(0, Math.min(0.985, cfg.trail || 0));
    if (trail > 0) {
      // fade the previous frame instead of clearing it
      if (transparent) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(0,0,0,${1 - trail})`;
      } else if (bg.startsWith("#")) {
        const [r, g, b] = hexToRgb(bg);
        ctx.fillStyle = `rgba(${r},${g},${b},${1 - trail})`;
      } else {
        ctx.fillStyle = bg;
      }
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    } else if (transparent) {
      ctx.clearRect(0, 0, w, h);
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.strokeStyle = cfg.colors.stroke;
    ctx.globalCompositeOperation = BLEND_MAP[cfg.blend] || "source-over";
    const ox = Math.max(-1.5, Math.min(1.5, cfg.offsetX || 0));
    const oy = Math.max(-1.5, Math.min(1.5, cfg.offsetY || 0));
    ctx.translate(w / 2 + ox * (w / 2), h / 2 + oy * (h / 2));
    if (cfg.rotate) ctx.rotate((cfg.rotate * Math.PI) / 180);
    const zoom = Math.max(0.05, cfg.zoom || 1);
    if (zoom !== 1) ctx.scale(zoom, zoom);

    // Design space is normalized to a 340px reference so configs are
    // resolution-independent.
    const unit = Math.min(w, h) / 340;
    const n = Math.max(1, Math.round(cfg.count));
    const freq = Math.max(0.0001, cfg.freq);
    const amp = 80 * unit;
    const hover = cfg.interact.hover;
    const aX = cfg.ampX * (hover ? 0.6 + px * 0.8 : 1);
    const aY = cfg.ampY * (hover ? 0.6 + py * 0.8 : 1);
    const sizeMax = 30 * unit * cfg.size;
    const sizeMin = sizeMax * Math.max(0, Math.min(1, cfg.floor));
    const sqA = Math.sqrt(Math.max(0.05, cfg.aspect));
    const roundness = Math.max(0, Math.min(1, cfg.roundness));
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const ramp = cfg.colors.ramp && cfg.colors.ramp.length ? cfg.colors.ramp : null;
    const poly = POLYGONS[cfg.shape] || null;
    const customPath = cfg.shape === "custom" && cfg.path ? getCustomPath(cfg.path) : null;

    let effLW = Math.max(0, cfg.lineWidth);
    const fillA = cfg.fillAlpha;
    let strokeA = effLW > 0 ? cfg.strokeAlpha : 0;
    if (fillA <= 0 && strokeA <= 0) {
      strokeA = 1; // never draw nothing
      effLW = Math.max(effLW, 0.35);
    }
    // divide by zoom so stroke width stays visually constant while zooming
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
          // epicycle: each shape rides a small circle around its path point
          const oa = p * TAU * cfg.coil + drift * 2;
          x += Math.cos(oa) * cfg.orbit * amp * 0.6;
          y += Math.sin(oa) * cfg.orbit * amp * 0.6;
        }

        // size breathes between floor and size; noise roughens it per index
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
        if (customPath) {
          const s = (rx + ry) / 2;
          ctx.scale(rx, ry);
          ctx.lineWidth = effLW / (zoom * Math.max(0.0001, s));
          if (fillA > 0) {
            ctx.globalAlpha = fillA;
            ctx.fill(customPath);
          }
          if (strokeA > 0) {
            ctx.globalAlpha = strokeA;
            ctx.stroke(customPath);
          }
        } else {
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
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      ctx.restore();
    }
    if (k) ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const interval = 1000 / Math.max(1, cfg.fps);
    if (now - last < interval - 0.5) return;
    last = now - ((now - last) % interval);

    speed += ((pressed && cfg.interact.press ? 10 : 1) - speed) * 0.08;
    px += (pxT - px) * 0.06;
    py += (pyT - py) * 0.06;
    const dt = cfg.velocity * 3 * speed;
    t += dt;
    drift += dt * 0.003;
    rotPhase += dt * cfg.twirl * 0.003;
    draw();
  }

  function shouldRun() {
    return !destroyed && visible && !(reducedMQ && reducedMQ.matches);
  }

  function start() {
    if (running || !shouldRun()) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const onDown = (e) => {
    pressed = true;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onUp = () => { pressed = false; };
  const onMove = (e) => {
    if (!cfg.interact.hover) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pxT = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    pyT = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
  };
  const onLeave = () => { pxT = 0.5; pyT = 0.5; };
  const onReduced = () => {
    if (shouldRun()) start();
    else { stop(); draw(); }
  };

  const listeners = [
    [canvas, "pointerdown", onDown],
    [canvas, "pointerup", onUp],
    [canvas, "pointercancel", onUp],
    [canvas, "pointermove", onMove],
    [canvas, "pointerleave", onLeave],
  ];
  for (const [el, type, fn] of listeners) el.addEventListener(type, fn);
  reducedMQ?.addEventListener?.("change", onReduced);

  let io = null;
  if (cfg.interact.pauseOffscreen && typeof IntersectionObserver === "function") {
    io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
  }

  let ro = null;
  if (typeof ResizeObserver === "function") {
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
  }

  resize();
  start();

  const handle = {
    canvas,
    get config() {
      return mergeConfig(cfg, {});
    },
    set(patch) {
      cfg = mergeConfig(cfg, patch);
      draw();
      return handle;
    },
    pause: stop,
    resume() {
      if (shouldRun()) start();
    },
    destroy() {
      destroyed = true;
      stop();
      io?.disconnect();
      ro?.disconnect();
      reducedMQ?.removeEventListener?.("change", onReduced);
      for (const [el, type, fn] of listeners) el.removeEventListener(type, fn);
    },
  };
  return handle;
}

// ---------------------------------------------------------------------------
// Variation helpers — used by candidate generation and the future skill.

const MUTABLE = {
  count: [8, 140, true],
  size: [0.3, 2.2],
  floor: [0, 1],
  aspect: [0.25, 4],
  roundness: [0, 1],
  freq: [0.3, 3.2],
  noise: [0, 0.8],
  twist: [0, 10],
  twirl: [0, 1],
  velocity: [0.4, 2],
  ampX: [0.3, 1.3],
  ampY: [0.3, 1.3],
  orbit: [0, 1],
  coil: [2, 32, true],
};

export function randomConfig(rand = Math.random) {
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const range = (a, b) => a + rand() * (b - a);
  const layout = pick(["wave-x", "wave-x", "wave-y", "ring", "ring", "spiral", "dial", "matrix"]);
  return mergeConfig(DEFAULTS, {
    layout,
    shape: pick(["circle", "circle", "circle", "square", "triangle", "diamond", "pentagon", "hexagon"]),
    count: Math.round(layout === "dial" ? range(16, 48) : range(28, 110)),
    size: range(0.6, 1.9),
    floor: range(0.05, 0.7),
    aspect: range(0.5, 2.6),
    roundness: rand() < 0.4 ? range(0.1, 0.8) : 0,
    freq: range(0.5, 2.8),
    noise: rand() < 0.35 ? range(0.1, 0.6) : 0,
    twist: rand() < 0.8 ? range(0.5, 8) : 0,
    twirl: rand() < 0.5 ? range(0.05, 0.6) : 0,
    velocity: range(0.6, 1.6),
    ampX: range(0.5, 1.15),
    ampY: range(0.5, 1.15),
    mirror: pick(["off", "off", "off", "x", "x", "y", "xy"]),
    kaleido: rand() < 0.2 ? Math.round(range(2, 6)) : 1,
    orbit: rand() < 0.3 ? range(0.15, 0.8) : 0,
    coil: Math.round(range(4, 26)),
    seed: rand() * 100,
  });
}

export function mutateConfig(cfg, amount = 0.25, rand = Math.random) {
  const out = mergeConfig(cfg, {});
  for (const [key, [min, max, round]] of Object.entries(MUTABLE)) {
    if (rand() < 0.6) {
      let v = out[key] + (rand() * 2 - 1) * amount * (max - min);
      v = Math.min(max, Math.max(min, v));
      out[key] = round ? Math.round(v) : v;
    }
  }
  if (rand() < amount * 0.3) {
    out.mirror = ["off", "x", "y", "xy"][Math.floor(rand() * 4)];
  }
  if (rand() < amount * 0.25) {
    out.kaleido = 1 + Math.floor(rand() * 6);
  }
  return out;
}
