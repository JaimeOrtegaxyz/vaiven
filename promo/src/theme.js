export const PAPER = "#F6F5F1";
export const PANEL = "#FBFAF8";
export const INK = "#1E1E1E";
export const LINE = "#D8D5CC";
export const FAINT = "#8B887F";
export const LOUD_GREEN = "#00FF00";
export const LOUD_PINK = "#FF1490";
export const DARK = "#101014";
export const DARK_WARM = "#14120F";

export const MONO = "'Plex', 'IBM Plex Mono', Menlo, monospace";

/** Deterministic decaying screen-shake offset. */
export function shake(f, amp, decayFrames = 14) {
  const k = Math.max(0, 1 - f / decayFrames);
  const a = amp * k * k;
  return {
    x: Math.sin(f * 12.9898) * a,
    y: Math.cos(f * 78.233) * a * 0.8,
    r: Math.sin(f * 3.7) * a * 0.12,
  };
}
