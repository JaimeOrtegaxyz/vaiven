# Vaivén

*vaivén (Spanish): a perpetual to-and-fro; the swing of things.*

**What**: A zero-dependency generative-figure system for the web — a Canvas 2D
engine where every animation is a JSON config, a `<vaiven-figure>` web
component for embedding, and a local playground (the UI surface) for
composing figures.
The eventual product is a Claude skill that generates figures for arbitrary
web projects; the playground is the instrument used to design them.

**Who**: A designer-developer composing generative animations for his own
sites. Single local user, desktop, long focused sessions with an animation
always running in view.

**Register**: product — the tool serves the task. The artwork is the only
element allowed to be loud; all chrome recedes.

## Design system (playground)

Tokens:
- `--paper #F6F5F1` — body / canvas surface
- `--panel #FBFAF8` — floating inspector, popovers (second neutral layer)
- `--ink #1E1E1E` — text, active states, selection
- `--line #D8D5CC` — hairline borders, slider tracks
- `--faint #8B887F` — secondary text, resting value readouts

Type: IBM Plex Mono only (vendored woff2 in `assets/fonts/`, weights
400/500/600). 9–13px scale; uppercase letter-spaced section labels.

Radius scale: 3px controls · 4px cards/frame/toast · 8px panels/popovers.

Aesthetic: drafting-instrument minimalism. Hairline strokes, paper surfaces,
ink accents; depth via layered low-alpha shadows, not heavy borders. No
stripe.dev pastiche (no dotted grids, no "[ FIG. ]" captions).

Conventions:
- Sliders: 2px hairline track, 11px ring thumb (paper fill + ink ring),
  fills ink while dragging. Never `accent-color` defaults.
- Value readouts look like text, become inputs on focus.
- Selection = solid ink (segmented toggles, card contour overlays).
- Custom tooltip (`#tip`) and custom color picker (hex + RGB together, no
  HSL, opacity as %). Native `title`/`<input type=color>` not used in the
  sidebar.
- Motion: 100–180ms, `cubic-bezier(0.2, 0, 0, 1)`, state feedback only;
  `prefers-reduced-motion` disables all of it. Press scale 0.96.
- Numbers are `tabular-nums` everywhere they update live.
