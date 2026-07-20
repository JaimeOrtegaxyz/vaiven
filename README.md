<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/vaiven-logo-cream.svg">
    <img src="assets/vaiven-logo.svg" alt="vaiven" width="300">
  </picture>
</p>

<p align="center"><strong>vaiven</strong>, from the Spanish <em>vaivén</em> — the swing of things: a perpetual to-and-fro.</p>

<br>

Calm, endlessly looping generative figures for the web. One zero-dependency
Canvas 2D engine (two plain ES modules, ~9KB gzipped) where **every animation is a
JSON config**: many simple shapes, arranged and breathed by a couple dozen
numbers, accumulating into living hairline patterns. Hold a figure to
accelerate it ×10.

## Quick start

```sh
npm i @jaimeortega/vaiven
```

```js
import "@jaimeortega/vaiven/element"; // registers <vaiven-figure> (no-op during SSR)
```

```html
<!-- reference a preset by name — resolved from /vaiven.presets.json: -->
<vaiven-figure preset="hero" style="max-width:480px"></vaiven-figure>

<!-- or inline the config: -->
<vaiven-figure config='{"layout":"wave-x","count":65,"twist":4.7,"floor":0.2}'
               style="max-width:480px"></vaiven-figure>

<!-- or fetch any config file (a #name picks an entry from a preset map): -->
<vaiven-figure src="/figures/hero.json"></vaiven-figure>
```

Or drive a canvas directly:

```js
import { createFigure } from "@jaimeortega/vaiven";

const fig = createFigure(canvas, { layout: "ring", count: 56, orbit: 0.5 });
// fig.set({ ... })  ·  fig.pause()  ·  fig.resume()  ·  fig.destroy()
```

No bundler? Vendor `src/figure.js` + `src/figure-element.js` (plain ESM,
zero deps) or load from a CDN:

```html
<script type="module" src="https://esm.sh/@jaimeortega/vaiven/element"></script>
```

Configs are fully self-contained — even custom SVG shapes travel inside the
JSON as path data. An embed with no config (or a failed load) renders a
deliberately loud green/pink fallback figure, so a broken embed is
impossible to miss. TypeScript types for every knob ship with the package.

**The shelf is the source of truth.** A project's figures live in one file,
`vaiven.presets.json`, served by the site like any static asset. Embeds
reference entries by name (`preset="hero"`); editing a preset in the
workspace changes what the site serves — save, reload, done, no re-sync. A
page full of figures costs one request (fetches are deduped). Inline
`config` merges on top of the fetched preset (per-instance overrides — same
preset, different `bg`), renders alone if the fetch fails, and stays the
right tool where nothing can be fetched (`file://`, sandboxed embeds).

**The config is the API.** Projects accumulate configs — in
`vaiven.presets.json`, in embeds, in links. A saved config keeps rendering
the same figure across patch and minor versions.

## The knobs

- **Pattern**: `layout` (wave-x, wave-y, ring, spiral, dial, matrix) placed
  by `count`, `ampX`/`ampY`, `freq`.
- **Shape**: circle, square, triangle, diamond, pentagon, hexagon, star, or any
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
the whole config in the URL hash (bookmark a look to come back to it).

In any project that has vaiven installed:

```sh
npx vaiven
# → http://localhost:4633/playground/
```

This serves the playground *for that project*: the SHELF row reads and
writes `vaiven.presets.json` at the project root, live — and the server
also serves the shelf at `/vaiven.presets.json`, exactly like the deployed
site would. Open the workspace, see every saved look the project has,
tweak, rename, delete — every `preset="…"` embed picks up the edit on the
next reload. COPY ▾ hands you the reference snippet for the look you're
editing. (`--port`, `--no-open`, `--shelf <path>`, `--help`.)

In this repo, any static server works too (`python3 -m http.server 4633`);
without the workspace server behind it, the shelf falls back to
per-session storage with COPY / drag-drop import.

## Files

- `src/figure.js` — the engine: `createFigure(canvas, config)`, plus
  `DEFAULTS`, `FALLBACK`, `randomConfig`, `mutateConfig`, `mergeConfig`.
- `src/figure-element.js` — `<vaiven-figure>` web component (`config` or
  `src` attribute; `<gen-figure>` kept as a legacy alias).
- `bin/vaiven.mjs` — the workspace server behind `npx vaiven`.
- `playground/` — the editor; the SHELF row curates a project's saved looks
  (`vaiven.presets.json`).
- `skill/` — the Claude skill that designs and embeds figures into real
  projects (`SKILL.md` + config reference + installer).
- `WORKFLOW.md` — the interview → candidates → pick → install workflow
  behind the skill. `PRODUCT.md` — design system + register.

## Built-in behavior

Figures pause when scrolled offscreen, render a static frame under
`prefers-reduced-motion`, cap their framerate, handle DPR and resize, and
carry the interactions (hold to accelerate, pointer reshapes the spread)
with no extra wiring.

MIT © Jaime Ortega
