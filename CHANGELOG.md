# Changelog

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
