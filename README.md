# Vaiven

*vaiven — Spanish for the swing of things: a perpetual to-and-fro.*

Calm, endlessly looping generative figures for the web. One zero-dependency
Canvas 2D engine (two plain ES modules, ~15KB) where **every animation is a
JSON config**: many simple shapes, arranged and breathed by a couple dozen
numbers, accumulating into living hairline patterns. Hold a figure to
accelerate it ×10.

## Quick start

```sh
npm i vaiven
```

```js
import "vaiven/element"; // registers <vaiven-figure> (no-op during SSR)
```

```html
<vaiven-figure config='{"layout":"wave-x","count":65,"twist":4.7,"floor":0.2}'
               style="max-width:480px"></vaiven-figure>

<!-- or from a config file: -->
<vaiven-figure src="/figures/hero.json"></vaiven-figure>
```

Or drive a canvas directly:

```js
import { createFigure } from "vaiven";

const fig = createFigure(canvas, { layout: "ring", count: 56, orbit: 0.5 });
// fig.set({ ... })  ·  fig.pause()  ·  fig.resume()  ·  fig.destroy()
```

No bundler? Vendor `src/figure.js` + `src/figure-element.js` (plain ESM,
zero deps) or load from a CDN:

```html
<script type="module" src="https://esm.sh/vaiven/element"></script>
```

Configs are fully self-contained — even custom SVG shapes travel inside the
JSON as path data. An embed with no config (or a failed load) renders a
deliberately loud green/pink fallback figure, so a broken embed is
impossible to miss. TypeScript types for every knob ship with the package.

**The config is the API.** Projects accumulate configs — in
`vaiven.presets.json`, in embeds, in links. A saved config keeps rendering
the same figure across patch and minor versions.

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

## The workspace

The studio for composing figures — live pattern/shape pickers, sliders for
every knob with ⓘ tips, gradient fill builder, SVG upload, undo/redo, and
the whole config in the URL hash (share a look as a link).

In any project that has vaiven installed:

```sh
npx vaiven
# → http://localhost:4633/playground/
```

This serves the playground *for that project*: the SHELF row reads and
writes `vaiven.presets.json` at the project root, live. Open the workspace,
see every saved look the project has, tweak, rename, delete — then embed a
config yourself or hand the shelf to an agent to wire in. (`--port`,
`--no-open`, `--shelf <path>`, `--help`.)

In this repo, any static server works too (`python3 -m http.server 4633`);
without the workspace server behind it, the shelf falls back to
per-session storage with COPY / drag-drop import.

## Files

- `src/figure.js` — the engine: `createFigure(canvas, config)`, plus
  `DEFAULTS`, `FALLBACK`, `randomConfig`, `mutateConfig`, `mergeConfig`.
- `src/figure-element.js` — `<vaiven-figure>` web component (`config`,
  `src`, or `preset` attribute; `<gen-figure>` kept as a legacy alias).
  `preset` resolves `../presets/` next to the engine files — it works when
  vaiven's files are served as-is (vendored, or via the workspace server);
  in bundled apps use `config` or `src`.
- `bin/vaiven.mjs` — the workspace server behind `npx vaiven`.
- `playground/` — the editor.
- `presets/*.json` — saved configs; anchors for the workflow.
- `WORKFLOW.md` — the interview → candidates → pick → install workflow
  (draft of the future skill). `PRODUCT.md` — design system + register.

## Built-in behavior

Figures pause when scrolled offscreen, render a static frame under
`prefers-reduced-motion`, cap their framerate, handle DPR and resize, and
carry the interactions (hold to accelerate, pointer reshapes the spread)
with no extra wiring.

MIT © Jaime Ortega
