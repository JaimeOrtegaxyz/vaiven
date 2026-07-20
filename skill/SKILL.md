---
name: vaiven
description: >-
  Design and embed **vaiven** generative canvas figures — calm, perpetually
  looping, config-driven abstractions built from many overlapping simple
  primitives (the specific vaiven aesthetic) — into a web project, and manage a
  small per-project shelf of saved figure presets. Use ONLY when the user
  explicitly asks for a *vaiven* figure/animation: by name ("vaiven"), or
  clearly pointing at this generative-figure look — e.g. "add a vaiven figure to
  the hero", "generate a vaiven animation for this section", "put my `hero`
  vaiven preset here", "design a vaiven background for X". Do NOT trigger for
  generic animation requests, CSS/scroll transitions, Lottie, Framer
  Motion/GSAP, video, SVG/SMIL, or any non-vaiven motion. If the user just says
  "add an animation" without invoking vaiven, do not use this skill.
---

# Vaiven — embed generative figures

Vaiven is a zero-dependency Canvas 2D engine where **every animation is one JSON
config**: N simple shapes (circle, polygon, or a custom SVG path) whose
position, size and rotation are parametric functions of (index, time). Overlap
of many near-identical shapes makes the pattern. This skill designs those
configs for a real project, embeds them, and keeps a per-project shelf.

## When to act (be strict)

Act only when the user explicitly wants a **vaiven** figure (see description).
If they ask for "an animation" with no reference to vaiven, ask whether they
mean a vaiven figure before proceeding — don't assume. Never reach for vaiven to
satisfy a generic motion request that another tool (CSS, Lottie, Framer Motion,
video) fits better.

## Aesthetic principles (non-negotiable)

- **Abstraction over illustration.** A concept picks a *territory* of
  parameters, never a literal picture. Judge every result purely by visual
  quality; any resemblance to the concept is a rhyme, not a requirement.
- **Simple primitives, rich accumulation.** One shape repeated ~30–120 times
  with smoothly varying position/size/rotation. The interest lives in overlap.
- **Calm by default.** Slow perpetual evolution; energy lives in interaction
  (hold to accelerate ×10, pointer reshapes the spread).
- **No pastiche.** No dotted-grid specimen frames, no "[ FIG. N ]" captions, no
  borrowed chrome. Figures sit directly on the project's own surfaces.
- **Light.** Two small ESM files, zero deps; pauses offscreen; static under
  `prefers-reduced-motion`.

## Workflow

### 1 — Locate the slot and the palette

Find the exact section/component that needs a figure. Then derive colors from
the project (do not invent brand colors):

- Look in Tailwind config, `:root` custom properties, and theme token files.
- `bg` — the surface behind the figure, or `"transparent"`.
- `fill` — the surface mixed 8–15% toward the brand hue (etched looks need
  `fill` and `bg` *close* in lightness).
- `stroke` — the darkest ink/text color (high contrast on `bg`).

### 2 — Concept → parameter territory

The mapping only picks a starting neighborhood; iterate visually from there and
keep whatever looks best.

| Feel of the concept | Starting territory |
| --- | --- |
| flow, movement, pipelines, streams | `wave-x`/`wave-y`, freq 1–2.5, twist 3–7 |
| wholeness, orbit, network, protection | `ring`, floor 0.05–0.4, twirl 0.2–0.5, sometimes mirror |
| growth, compounding, scale | `spiral`, count 70–110, aspect 1.5–2.5 |
| precision, instruments, time | `dial`, noise 0.2–0.5, tight floor 0.5+ |
| multiplicity, composability, structure | `matrix`, size 0.4–0.8, floor 0.3–0.6 |
| turbulence, energy | any layout + noise 0.3–0.7, velocity 1.3–2 |
| clusters, coils, knots, tubes | `ring`/`wave-x` + orbit 0.3–0.8, coil 8–24, count 100+, stroke-only |
| mandalas, rosettes, emblems | any layout + kaleido 3–8, low count per arm |

Ink style is a second axis (chosen by the surface): **etched** (fillAlpha 1,
strokeAlpha 1, normal) · **veil** (fillAlpha 0.08–0.2, strokeAlpha 0, multiply)
· **phosphor** (strokeAlpha 0.7–1, low fill, screen/lighter, dark bg) · **comet**
(trail 0.8–0.92, lighter, stroke-only). Full knob list: `reference/config.md`.

### 3 — Design candidates, and ALWAYS hand back a playground link

For the slot, produce **1–3 configs**, changing one dominant knob per candidate
(density, twist, squash, or layout) so the choice reads clearly.

For **every** candidate, print a playground URL so the user can hand-tune —
the whole config rides in the hash:

```
http://localhost:4633/playground/#<encodeURIComponent(JSON.stringify(config))>
```

(If the project has vaiven installed, run `npx vaiven --no-open` at the project
root — it serves the playground on 4633 with the project's shelf live. Otherwise
serve the vaiven repo: `python3 -m http.server 4633` there. When the playground
is hosted, swap the origin.) If the project has a dev server, you may also embed
a candidate and screenshot it in place to verify — design → render → look →
refine, not fire-and-forget.

### 4 — Install the engine (once per project)

If `vaiven` isn't a dependency yet:

- `npm i @jaimeortega/vaiven` (published; unscoped `vaiven` is blocked by
  npm's name-similarity rule). The bin is still plain `vaiven`, so
  `npx vaiven` works inside the project after install.
- No bundler / no npm: vendor `src/figure.js` + `src/figure-element.js` into
  `public/vendor/vaiven/` (plain ESM, zero deps).

Wire the one-time registration in the app entry:
`import "@jaimeortega/vaiven/element";` (web component) or
`import { createFigure } from "@jaimeortega/vaiven";` (canvas API).

### 5 — Embed (framework-aware, reference the shelf)

**Default: embed by reference.** Save the chosen config to the shelf named
for its slot, make sure `vaiven.presets.json` is served by the site, and
embed the name. The one rule: **the shelf must be reachable at
`/vaiven.presets.json` on the served site** — so it lives in whatever
directory THIS project serves static files from. That varies by stack:
Next/Vite/Astro/Nuxt → `public/`, SvelteKit/Hugo → `static/`, plain
HTML/Rails → the web root / `public/`; for anything else, find where the
project's static assets (favicon, robots.txt) live and put it beside them.
A plain file — never a symlink (deploy steps drop them). `npx vaiven`
resolves the same way (uses `public/`/`static/` when present, creating new
shelves there), so the workspace and the site share one file with no flags:

```html
<vaiven-figure preset="hero" style="max-width:480px"></vaiven-figure>
```

The shelf is the source of truth: editing the preset (workspace or file)
changes what the site serves on next load — no re-sync step. Fetches are
deduped (a page of figures = one request), and a broken reference renders
the loud fallback figure, impossible to miss.

- **React/Next**: `<vaiven-figure preset="hero" style={{maxWidth:480}} />` —
  a plain string attribute, no `JSON.stringify` needed. With TypeScript,
  declare the element once in a `.d.ts` (exact snippet in
  `reference/config.md` → Embedding) or JSX rejects the tag. For the canvas
  API, `createFigure` against a `useRef` canvas in `useEffect` (call
  `fig.destroy()` on cleanup).
- **Plain HTML, no bundler**: vendor the files and `<script type="module" src="/vendor/vaiven/figure-element.js">`.
- **Custom shelf location**: `src="/assets/my-shelf.json#hero"` (or `src` +
  `preset` together).

**Inline `config` when the reference can't work or must not move**: contexts
with no server (`file://`, sandboxed embeds, email-ish surfaces), or when the
user asks to freeze a figure at ship time. Inline on top of a `preset` is a
per-instance override (same preset, different `bg`) and doubles as a fallback
if the fetch fails.

Size with CSS (host is `display:block`, default `aspect-ratio: 340/270`). Size
the SLOT, not the figure — the figure crops/fits into whatever CSS box you give
it and never resizes the host. With the canvas API (`createFigure`), set only
the CSS size and let the engine own `canvas.width/height` (it applies DPR);
never set those attributes yourself, or the figure renders at 1× (blurry, thick
strokes). `lineWidth` is 340-reference px and scales with figure size, so a
config's stroke-to-shape ratio is identical at any canvas size — pick it for the
ratio you want (a config tuned in the large playground usually needs a lower
`lineWidth` to read as a hairline in a smaller slot). Offscreen-pause,
reduced-motion, hold-to-accelerate and hover-reshape are built in — no wiring.

### 6 — The per-project shelf

Named looks the user curates for THIS project live in one discreet file:
**`vaiven.presets.json`**, placed where the site serves static files
(`public/`, `static/`, or the project root for root-served sites — step 5's
rule) — a flat map of `name → config`:

```json
{ "hero": { "layout": "ring", "count": 56, "floor": 0.2 } }
```

- "save this as `hero`" → add/replace that key (create the file if absent).
- "list my vaiven looks" → read and summarize the keys.
- "put `hero` and `footer-calm` here" → embed `preset="hero"` /
  `preset="footer-calm"` (and check the shelf is served — step 5).

Keep it to the single file; never scaffold folders. The shelf is not just a
design-time library — it is the site's figure storage: embeds name their
entry, so the shelf always answers "what's on the site". Ship it with the
site's static assets. When the playground runs via `npx vaiven` in the
project, its SHELF row reads and writes this exact file live (and serves it
at `/vaiven.presets.json`); served statically it falls back to COPY SHELF /
drag-drop import of the same shape.

## Config quick reference

Layouts: `wave-x wave-y ring spiral dial matrix`. Shapes: `circle square
triangle diamond pentagon hexagon star custom`(+`path`). See
`reference/config.md` for every knob, ranges, and the color/ramp model.
