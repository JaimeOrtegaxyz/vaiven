# Vaiven — repo instructions

Calm, perpetually looping generative figures for the web. A zero-dependency
Canvas 2D engine where **every animation is one JSON config**: N simple shapes
whose position, size and rotation are parametric functions of `(index, time)`.
Overlap of many near-identical shapes makes the pattern.

The end product is a Claude **skill** that designs and embeds these figures into
real web projects; the **playground** is the instrument used to compose them.

## Non-negotiables

- **Zero dependencies, no build step.** The engine is two plain ES modules in
  `src/`. Never add a bundler, transpile step, or runtime dependency to it. It
  must stay copy-pasteable / vendorable as-is.
- **Config-driven.** New expressive power is a new knob in `DEFAULTS`, not a new
  code path per figure. Configs are self-contained JSON (custom SVG shapes ride
  inside the JSON as `path` data).
- **Calm by default; the artwork is the only loud element.** All chrome recedes
  (see design system). Energy lives in interaction, not resting motion.
- **No pastiche.** No dotted-grid specimen frames, no "[ FIG. N ]" captions, no
  borrowed stripe.dev chrome. Figures sit directly on the host surface.

## Layout — how the pieces fit

- `src/figure.js` — the engine. `createFigure(canvas, config)` + config helpers.
- `src/figure-element.js` — `<vaiven-figure>` web component (side-effect import
  that registers the custom element). Wraps the engine for HTML embedding.
- `playground/index.html` — the studio (single self-contained file): live
  pattern/shape pickers, a slider per knob, gradient/SVG builders, undo/redo,
  the whole config in the URL hash, and a SHELF row that reads/writes the
  `vaiven.presets.json` shape (the per-project shelf). Served by the workspace
  server the shelf is live (the project's file, via `/api/shelf`); served
  statically it falls back to sessionStorage + COPY/drag-drop import. This is
  the UI surface — hold it to the design system below.
- `bin/vaiven.mjs` — the workspace server behind `npx vaiven` (zero-dep
  node:http): serves the playground from the installed package, exposes
  GET/PUT `/api/shelf` against `vaiven.presets.json` in the cwd, and serves
  that shelf at `/vaiven.presets.json` (like a deployed site would).
- `skill/` — the shippable Claude skill (`SKILL.md` + `reference/config.md` +
  `install.sh`). The consumer-facing product.
- `promo/` — a Remotion promo video (React, **its own** `package.json`/deps;
  the zero-dep rule does not apply inside `promo/`).
- `PRODUCT.md` — design system + register. `WORKFLOW.md` — the interview →
  candidates → pick → install workflow (the proto-skill). Keep these and
  `skill/SKILL.md` in sync when the workflow changes.

## Engine public API

`import` surface (package `exports`): `"."` → `src/figure.js`,
`"@jaimeortega/vaiven/element"` → `src/figure-element.js`.

From `figure.js`:
- `createFigure(canvas, config)` → handle `{ canvas, config (getter),
  set(patch), pause(), resume(), destroy() }`. `set()` merges a patch and
  redraws; always `destroy()` on teardown (disconnects observers + listeners).
- Constants: `DEFAULTS`, `FALLBACK` (the loud green/pink missing-config figure),
  `LAYOUTS`, `SHAPES`, `BLENDS`, `MIRRORS`.
- Config helpers: `mergeConfig(base, patch)`, `normalizeConfig(patch)` (maps
  legacy keys), `randomConfig(rand?)`, `mutateConfig(cfg, amount?, rand?)`.

`<vaiven-figure>` attributes: `preset` (named entry in `/vaiven.presets.json`
— the shelf is the source of truth: sites serve it, embeds reference it by
name, editing a preset changes what the site serves), `src` (URL to a config
JSON; `#name` fragment picks an entry from a preset map), and `config`
(inline JSON — merges on top of the fetched config as per-instance override,
renders alone if the fetch fails, and is the tool for no-server contexts).
Shelf fetches are deduped per page. Host is `display:block`, default
`aspect-ratio: 340/270`; size it with CSS. `.figure` property exposes the live
engine handle. `<gen-figure>` is a legacy alias. Built in: offscreen pause, `prefers-reduced-motion` static
frame, DPR/resize handling, hold-to-accelerate ×10, pointer-reshapes-spread.

Sizing/stroke contract: the host sets only the CSS size; the engine owns
`canvas.width/height` (backing store = CSS × DPR, capped 2×) — a consumer must
never set those attributes (doing so pins the canvas to 1×: blurry, thick
strokes). Figures crop/fit into the host slot; the engine never resizes the
host. `lineWidth` is 340-reference px and scales with the figure (`* unit` in
`draw()`), so the stroke-to-shape ratio is constant at any canvas size (WYSIWYG).

TypeScript: co-located `src/figure.d.ts` / `src/figure-element.d.ts` type the
full config surface; keep them in sync when adding knobs.

Full knob list, ranges, and the color/ramp model: `skill/reference/config.md`
(and the inline comments on `DEFAULTS` in `figure.js`).

## Design system (playground / any UI chrome)

Register: **product** — the tool serves the task; chrome recedes; drafting-
instrument minimalism (hairline strokes, paper surfaces, ink accents; depth via
layered low-alpha shadows, not heavy borders).

Tokens: `--paper #F6F5F1` (body/canvas) · `--panel #FBFAF8` (floating panels) ·
`--ink #1E1E1E` (text/active/selection) · `--line #D8D5CC` (hairlines) ·
`--faint #8B887F` (secondary text).

Type: **IBM Plex Mono only** (vendored woff2 in `assets/fonts/`, weights
400/500/600), 9–13px scale, uppercase letter-spaced section labels.
`tabular-nums` everywhere numbers update live.

Radius: 3px controls · 4px cards/frame/toast · 8px panels/popovers.

Conventions: sliders are a 2px hairline track + 11px ring thumb (paper fill,
ink ring), never `accent-color`. Value readouts look like text, become inputs
on focus. Selection = solid ink. Custom tooltip (`#tip`) and custom color
picker (hex + RGB, opacity as %) — no native `title`/`<input type=color>` in
the sidebar. Motion 100–180ms `cubic-bezier(0.2,0,0,1)`, state-feedback only,
press scale 0.96; `prefers-reduced-motion` disables all of it.

## Run / build

- Workspace: `node bin/vaiven.mjs` from repo root (or `npx vaiven` in any
  project with vaiven installed) → `http://localhost:4633/playground/` with
  the shelf live. Static fallback: `python3 -m http.server 4633`.
- Engine: nothing to build — it's shipped source.
- Promo video: `cd promo && npm i`, then `npm run studio` (Remotion Studio),
  `npm run render` (→ `out/vaiven-promo.mp4`), or `npm run still`.
- Published as **`@jaimeortega/vaiven`** (npm's similarity rule blocks
  unscoped `vaiven` — too close to `raven`). The bin stays `vaiven`, so
  `npx vaiven` works in any project that has it installed. Do not
  `npm publish` (new versions) without explicit go-ahead; bump the version
  first, `publishConfig.access` is already public.
</content>
