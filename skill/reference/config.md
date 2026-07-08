# Vaiven config reference

Every figure is one JSON object merged over these defaults. All numbers are
plain; omit anything you don't change.

## Pattern
| key | default | range | meaning |
| --- | --- | --- | --- |
| `layout` | `"wave-x"` | wave-x, wave-y, ring, spiral, dial, matrix | placement curve |
| `count` | 60 | 8–140 | number of shapes |
| `freq` | 1 | 0.3–3.2 | wave cycles across the index sweep |
| `ampX` / `ampY` | 0.8 | 0.3–1.3 | horizontal / vertical spread |

## Shape
| key | default | range | meaning |
| --- | --- | --- | --- |
| `shape` | `"circle"` | circle, square, triangle, diamond, pentagon, hexagon, star, custom | primitive |
| `path` | `""` | SVG path `d` | used when `shape:"custom"`; travels inside the JSON |
| `aspect` | 1 | 0.25–4 | wide/tall squash, area-preserving |
| `roundness` | 0 | 0–1 | corner rounding for angular shapes |

## Size range
| key | default | range | meaning |
| --- | --- | --- | --- |
| `size` | 1 | 0.3–2.2 | size of the largest shapes |
| `floor` | 1 | 0–1 | smallest as a fraction of size (1 = uniform) |
| `noise` | 0 | 0–0.8 | per-index size irregularity |

## Structure
| key | default | range | meaning |
| --- | --- | --- | --- |
| `twist` | 0 | 0–10 | per-index rotation increment (fan/spiral pitch) |
| `mirror` | `"off"` | off, x, y, xy | reflection |
| `kaleido` | 1 | 1–8 | radial repeats of the whole figure |
| `orbit` | 0 | 0–1 | radius of a secondary circle each shape rides (epicycle) |
| `coil` | 12 | 2–32 | how many times the orbit winds across the sweep |

## Motion
| key | default | range | meaning |
| --- | --- | --- | --- |
| `velocity` | 1 | 0.4–2 | time speed |
| `twirl` | 0 | 0–1 | whole-figure spin rate (accumulated, never jumps) |
| `trail` | 0 | 0–0.985 | 0 = clean redraw; toward 1 = motion streaks |
| `seed` | 0 | any | phase offset — same params, different moment |

## Camera
| key | default | range | meaning |
| --- | --- | --- | --- |
| `zoom` | 1 | 0.05+ | framing; scales figure + spacing, never the stroke |
| `offsetX` / `offsetY` | 0 | ±1.5 | pan; ±1 puts the figure center at the view edge |
| `rotate` | 0 | degrees | view rotation |

## Ink
| key | default | meaning |
| --- | --- | --- |
| `lineWidth` | 0.5 | 0 = no outline |
| `fillAlpha` | 1 | fill opacity — low + multiply/screen give washes |
| `strokeAlpha` | 1 | stroke opacity |
| `blend` | `"normal"` | normal, multiply, screen, lighter |

## Color
```json
"colors": {
  "bg": "transparent",     // or a hex; the surface behind the figure
  "fill": "#EFEFEF",
  "stroke": "#1D1D1D",
  "ramp": ["#0010FF", "#B2FFDD", "#90FFCE"]   // optional; flows through the shapes over time
}
```
A `ramp` (2+ hex stops) overrides `fill`, cycling smoothly through the shapes —
great for depth. Cyclic: it wraps back to the first stop.

## API
```js
import { createFigure } from "vaiven";
const fig = createFigure(canvas, config);
fig.set(patch);   // merge new values, redraws
fig.pause(); fig.resume(); fig.destroy();
fig.config;       // current merged config
```
Also exported: `DEFAULTS`, `FALLBACK`, `randomConfig(rand)`, `mutateConfig(cfg, amount, rand)`, `mergeConfig(base, patch)`.
