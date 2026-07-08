/**
 * Picks a legible, on-brand colour for the wordmark on a given surface.
 *
 * The logo recolours from the surface's own palette so it feels part of the
 * piece, but never at the cost of legibility. Order of preference:
 *   1. fill   (the surface's primary colour)
 *   2. stroke (its ink/accent)
 *   3. the highest-contrast ramp stop
 *   4. a neutral opposite the background (cream on dark, ink on light)
 *
 * A candidate is only accepted if its contrast against the background clears
 * WCAG AA for large bold display type (3.0), which is exactly what the
 * wordmark is.
 */

const CREAM = "#F5F4F1";
const INK = "#1E1E1E";
const MIN_CONTRAST = 3.0;

function hexToRgb(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export function pickLogoColor(colors = {}) {
  const bg = !colors.bg || colors.bg === "transparent" ? "#FFFFFF" : colors.bg;

  for (const c of [colors.fill, colors.stroke]) {
    if (c && contrast(c, bg) >= MIN_CONTRAST) return c;
  }

  const ramp = (colors.ramp || [])
    .filter((c) => contrast(c, bg) >= MIN_CONTRAST)
    .sort((a, b) => contrast(b, bg) - contrast(a, bg));
  if (ramp.length) return ramp[0];

  return luminance(bg) < 0.4 ? CREAM : INK;
}
