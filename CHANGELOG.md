# Changelog

## 0.1.1 — 2026-07-20

- Removed the `star` shape — six built-ins remain (circle, square, triangle,
  diamond, pentagon, hexagon) plus `custom`. A `shape: "star"` config now
  renders circles.
- Playground: randomize (`R`) keeps a chosen custom SVG shape — random looks
  rotate through it; built-in shapes still randomize freely.
- `npx vaiven` now resolves the shelf to where the site serves static files:
  an existing `public/` or `static/` shelf wins, new shelves are created
  there when the directory exists, and a root shelf next to an unused static
  dir gets a warning with the `mv` fix. Kills the silent two-shelf split in
  framework projects (Next, Vite, SvelteKit, Astro, …); `--shelf` still
  overrides.
- The playground SHELF label and `/api/shelf` now report the shelf's path
  relative to the project (e.g. `public/vaiven.presets.json`), not just the
  filename.
- Docs: shelf-placement rule (must be reachable at `/vaiven.presets.json`)
  in README, skill, and workflow; React + TypeScript `IntrinsicElements`
  snippet for `<vaiven-figure>` in README and `skill/reference/config.md`.

## 0.1.0 — 2026-07-20

First public release, published as
[`@jaimeortega/vaiven`](https://www.npmjs.com/package/@jaimeortega/vaiven).

- Zero-dependency Canvas 2D engine (`createFigure`) — every animation is one
  JSON config; WYSIWYG stroke scaling, offscreen pause, reduced-motion static
  frame, hold-to-accelerate, pointer-reshapes-spread.
- `<vaiven-figure>` web component with shelf-as-source-of-truth embedding:
  `preset="name"` resolves from `/vaiven.presets.json`, `src` supports
  `#name` fragments, deduped fetches, inline `config` as override/fallback.
- `npx vaiven` workspace: serves the playground with the project's preset
  shelf live (GET/PUT `/api/shelf`, canonical `/vaiven.presets.json` route,
  localhost Host allowlist).
- Playground studio: pattern/shape/knob editors, gradient + custom SVG
  shapes, undo/redo, config-in-URL, per-project SHELF row, COPY menu with
  inline and preset-reference embed snippets.
