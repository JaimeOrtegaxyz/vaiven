// The real presets from the repo, imported as-is.
import shell from "../../../presets/shell.json";
import feather from "../../../presets/feather.json";
import ringBloom from "../../../presets/ring-bloom.json";
import spiralFan from "../../../presets/spiral-fan.json";
import dialHairs from "../../../presets/dial-hairs.json";
import matrixDrift from "../../../presets/matrix-drift.json";
import veil from "../../../presets/veil.json";
import phosphor from "../../../presets/phosphor.json";
import comet from "../../../presets/comet.json";

export const PRESETS = {
  shell,
  feather,
  "ring-bloom": ringBloom,
  "spiral-fan": spiralFan,
  "dial-hairs": dialHairs,
  "matrix-drift": matrixDrift,
  veil,
  phosphor,
  comet,
};

/** Deterministic PRNG for mutateConfig variations. */
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
