# Vaiven

*vaiven — Spanish for the swing of things: a perpetual to-and-fro.*

Calm, endlessly looping generative figures for the web. One zero-dependency
Canvas 2D engine (two plain ES modules, ~15KB) where **every animation is a
JSON config**: many simple shapes, arranged and breathed by a couple dozen
numbers, accumulating into living hairline patterns. Hold a figure to
accelerate it ×10.

## Quick start

Vendor the two files from `src/` (npm package coming):

```html
<script type="module" src="/vendor/vaiven/figure-element.js"></script>

<vaiven-figure config='{"layout":"wave-x","count":65,"twist":4.7,"floor":0.2}'
               style="max-width:480px"></vaiven-figure>

<!-- or from a config file: -->
<vaiven-figure src="/figures/hero.json"></vaiven-figure>
```

Or drive a canvas directly:

```js
import { createFigure } from "./src/figure.js";

const fig = createFigure(canvas, { layout: "ring", count: 56, orbit: 0.5 });
// fig.set({ ... })  ·  fig.pause()  ·  fig.resume()  ·  fig.destroy()
```

Configs are fully self-contained — even custom SVG shapes travel inside the
JSON as path data. An embed with no config (or a failed load) renders a
deliberately loud green/pink fallback figure, so a broken embed is
impossible to miss.

## The knobs

- **Pattern**: `layout` (wave-x, wave-y, ring, spiral, dial, matrix) placed
  by `count`, `ampX`/`ampY`, `freq`.
- **Shape**: circle, square, triangle, diamond, pentagon, hexagon, or any
  single-path SVG (`shape: "custom"` + `path`); squash with `aspect`
  (area-preserving), round corners with `roundness`.
- **Size range**: `size` (the largest) + `floor` (the smallest, as a
  fraction; 1 = uniform) + `noise` (per-shape jitter).
- **Structure**: `twist` (fan pitch), `mirror` (`off|x|y|xy`), `kaleido`
  (radial repeats), `orbit` + `coil` (epicycles — coiled tubes, toruses,
  clusters).
- **Motion**: `velocity`, `twirl` (spin), `trail` (motion streaks).
- **Ink**: `lineWidth`, `fillAlpha`, `strokeAlpha`, `blend`
  (normal/multiply/screen/lighter), `colors` (`bg`, `fill`, `stroke`,
  optional flowing `ramp` gradient).
- **Camera**: `zoom` (stroke width stays constant), `offsetX`/`offsetY`
  (pan; ±1 = figure center at the view edge), `rotate` (degrees).

## The playground

The studio for composing figures — live pattern/shape pickers, sliders for
every knob with ⓘ tips, gradient fill builder, SVG upload, undo/redo, and
the whole config in the URL hash (share a look as a link).

```sh
cd vaiven
python3 -m http.server 4633
# → http://localhost:4633/playground/
```

## Files

- `src/figure.js` — the engine: `createFigure(canvas, config)`, plus
  `DEFAULTS`, `FALLBACK`, `randomConfig`, `mutateConfig`, `mergeConfig`.
- `src/figure-element.js` — `<vaiven-figure>` web component (`config` or
  `src` attribute; `<gen-figure>` kept as a legacy alias).
- `playground/` — the editor; the SHELF row curates a project's saved looks
  (`vaiven.presets.json`).
- `WORKFLOW.md` — the interview → candidates → pick → install workflow
  (draft of the future skill). `PRODUCT.md` — design system + register.

## Built-in behavior

Figures pause when scrolled offscreen, render a static frame under
`prefers-reduced-motion`, cap their framerate, handle DPR and resize, and
carry the interactions (hold to accelerate, pointer reshapes the spread)
with no extra wiring.

MIT © Jaime Ortega
