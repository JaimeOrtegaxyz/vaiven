# Vaiven — Workflow

Produces generative canvas figures for web projects: calm, perpetually looping
abstractions built from many simple primitives, in several ink styles — etched
(tonal fill + hairline stroke), veil (translucent multiply washes), phosphor
(luminous lines on dark), comet (motion trails) — embeddable anywhere as a
`<vaiven-figure>` web component driven by a JSON config. This document is the
operational reference behind `skill/SKILL.md` — when the workflow changes,
change both (see CLAUDE.md).

## Aesthetic principles (non-negotiable)

- **Abstraction over illustration.** A concept only picks a *territory* of
  parameters, never a literal picture. Judge every result purely by visual
  quality; any resemblance to the concept is a rhyme, not a requirement.
- **Simple primitives, rich accumulation.** Each figure is one shape (circle,
  polygon, or a custom SVG path) repeated 30–110 times with smoothly
  varying position, size, and rotation. The interest lives in the overlap.
- **Calm by default.** Slow perpetual evolution; energy lives in interaction
  (hold to accelerate ×10, pointer reshapes amplitude).
- **No pastiche.** The mechanics were learned from stripe.dev; the dressing
  must not be. No dotted-grid specimen frames, no "[ FIG. N ]" captions, no
  borrowed chrome — figures sit directly on the project's own surfaces.
- **Light.** Zero dependencies, two small engine files, pauses offscreen,
  renders a static frame under `prefers-reduced-motion`.

## Entry modes

- **A. Standalone ideation** (this repo): explore in the playground, save
  looks to the shelf (`vaiven.presets.json`) for later use.
- **B. Integration** (a target repo): "we need figures for sections X/Y/Z" →
  interview → candidates → pick → install.

## Step 1 — Interview (keep it to ≤4 questions)

1. **Slots**: which sections/surfaces need figures, how many, rough sizes.
2. **Palette**: explicit hexes | "extract from the repo" | default paper+ink.
3. **Mood** (global or per slot): calm-sparse ↔ dense-etched; mirrored-formal
   ↔ free.
4. **Constraints**: anything to avoid (motion limits, shapes, density).

**Palette extraction (mode B):** look in Tailwind config, `:root` custom
properties, and theme token files. Derive:

- `bg` — the page background behind the figure, or `"transparent"`.
- `fill` — the background mixed 8–15% toward the brand hue (the etched look
  needs fill and bg to be *close* in lightness).
- `stroke` — the darkest ink/text color (high contrast against bg).

## Step 2 — Concept → parameter territory

| Feel of the concept | Starting territory |
| --- | --- |
| flow, movement, pipelines, streams | `wave-x` / `wave-y`, freq 1–2.5, twist 3–7 |
| wholeness, orbit, network, protection | `ring`, floor 0.05–0.4 (deep size range), twirl 0.2–0.5, sometimes mirror |
| growth, compounding, scale | `spiral`, count 70–110, aspect 1.5–2.5 |
| precision, instruments, time | `dial`, noise 0.2–0.5, tight floor 0.5+ |
| multiplicity, composability, structure | `matrix`, size 0.4–0.8, floor 0.3–0.6 |
| turbulence, energy | any layout + noise 0.3–0.7, velocity 1.3–2 |
| clusters, coils, knots, tubes | `ring`/`wave-x` + orbit 0.3–0.8, coil 8–24, count 100+, stroke-only ink |
| mandalas, rosettes, formal emblems | any layout + kaleido 3–8 (radial repetition), low count per arm |

The mapping only chooses the starting neighborhood — iterate visually from
there and keep whatever looks best, meaning be damned.

**Ink style is a second, independent axis**, chosen by the surface it sits on
(knobs: `blend`, `fillAlpha`, `strokeAlpha`, `trail`):

| Surface | Style |
| --- | --- |
| light editorial page | etched (fillAlpha 1, strokeAlpha 1, normal) or veil (fillAlpha 0.08–0.2, strokeAlpha 0, multiply) |
| dark hero / feature section | phosphor (strokeAlpha 0.7–1, low fillAlpha, screen/lighter) or comet (trail 0.8–0.92, lighter, stroke-only) |

**Shape is a third axis**: `circle | square | triangle | diamond | pentagon |
hexagon | star`, all inscribed in the same ellipse so `aspect` (area-preserving
squash) and `roundness` (corner rounding) work identically across them — or
any single-path SVG via `shape: "custom"` + `path`. Size range is `size`
(the largest shapes) plus `floor` (the smallest, as a fraction of size;
1 = uniform).

**The view is a camera**: `zoom` (framing; stroke width stays constant),
`offsetX`/`offsetY` (pan, ±1 puts the figure center at the view edge —
useful for figures bleeding out of a page section), `rotate` (degrees),
`mirror` (`off | x | y | xy`).

**Structure multipliers**: `kaleido` (2–8 radial repeats of the whole figure
— rotational symmetry, the generalization of mirror) and `orbit` + `coil`
(each shape rides a secondary circle as it travels the path — epicycles that
produce coiled tubes, toruses and circular clusters).

## Step 3 — Candidates

For each slot produce 1–3 configs. Start from `DEFAULTS` or a `randomConfig()`
seed, then change **one dominant knob per candidate** (density, twist pitch,
squash, or layout) so the choice reads clearly. Keep the working candidates on
the shelf (`vaiven.presets.json`), then hand over playground URLs (the whole
config lives in the hash) or a simple review grid page.

`randomConfig()` / `mutateConfig()` from `src/figure.js` are available for
programmatic candidate generation.

## Step 4 — Pick & refine

The user picks in the browser and refines live in the playground (sliders;
`R` random, `0` reset, `⌘Z` undo). In a project with vaiven installed,
`npx vaiven` serves the playground with the project's `vaiven.presets.json`
shelf live — saving in the SHELF row writes the file directly. Otherwise
COPY CONFIG, then save the canonical look to the shelf (`vaiven.presets.json`)
named for the slot (e.g. `hero`).

## Step 5 — Install & embed (mode B)

1. `npm i @jaimeortega/vaiven` — or copy `src/figure.js` + `src/figure-element.js` into the
   target repo (e.g. `public/vendor/vaiven/` — they're plain ESM, zero deps).
2. Put the chosen looks in the shelf (`vaiven.presets.json`) where the site
   serves static files, so it's reachable at `/vaiven.presets.json`
   (Next/Vite/Astro/Nuxt `public/`, SvelteKit/Hugo `static/`, plain sites the
   web root). `npx vaiven` resolves the shelf the same way, so the workspace
   and the site share one file.
3. Embed by reference — the shelf is the source of truth; editing a preset
   changes what the site serves, no re-sync:

```html
<script type="module" src="/vendor/vaiven/figure-element.js"></script>

<vaiven-figure preset="hero" style="max-width:480px"></vaiven-figure>
<!-- custom shelf location: -->
<vaiven-figure src="/assets/my-shelf.json#hero"></vaiven-figure>
<!-- inline (no-server contexts, ship-time freeze, per-instance override): -->
<vaiven-figure config='{"layout":"ring","count":56,"floor":0.2}'></vaiven-figure>
```

Fetches of the same shelf are deduped (a page of figures = one request); a
broken reference renders the loud fallback figure. Inline `config` on top of
`preset` overrides per instance and doubles as a fallback if the fetch fails.

Size via CSS (host is `display:block`, default `aspect-ratio: 340/270`).
Defaults already include press-accelerate, hover-reshape, offscreen pause,
and reduced-motion static rendering — no extra wiring.

## Skill backlog

The skill exists (`skill/SKILL.md` + `reference/config.md` + `install.sh`).
Still open:

- [ ] Include the palette-extraction recipe as a scripted step.
- [ ] Optional: headless candidate-grid generation (render N configs to a
      review page automatically).
