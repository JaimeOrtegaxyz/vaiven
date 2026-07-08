// The promo's figure looks, baked in so the promo is self-contained.
// (These were formerly the repo's built-in presets, since removed from the
// product; the promo keeps its own copy as showcase content.)
export const PRESETS = {
  shell: {"layout":"wave-x","shape":"circle","count":65,"size":1.69,"floor":0.11,"aspect":1.44,"roundness":0,"freq":1.47,"noise":0,"twist":4.72,"twirl":0,"velocity":1.2,"ampX":0.87,"ampY":1.15,"zoom":1,"mirror":"off","lineWidth":0.5},
  feather: {"layout":"wave-x","shape":"circle","count":90,"size":1.09,"floor":0.29,"aspect":2.3,"roundness":0,"freq":2.2,"noise":0,"twist":6.5,"twirl":0.1,"velocity":1,"ampX":0.95,"ampY":0.85,"zoom":1,"mirror":"off","lineWidth":0.45},
  "ring-bloom": {"layout":"ring","shape":"circle","count":56,"size":1.73,"floor":0.21,"aspect":1.25,"roundness":0,"freq":1,"noise":0,"twist":2.4,"twirl":0.35,"velocity":0.9,"ampX":0.9,"ampY":0.9,"zoom":1,"mirror":"off","lineWidth":0.5},
  "spiral-fan": {"layout":"spiral","shape":"circle","count":80,"size":1.08,"floor":0.48,"aspect":1.7,"roundness":0,"freq":1.6,"noise":0,"twist":3.2,"twirl":0.2,"velocity":1.1,"ampX":0.85,"ampY":0.85,"zoom":1,"mirror":"x","lineWidth":0.5},
  "dial-hairs": {"layout":"dial","shape":"circle","count":30,"size":1.11,"floor":0.54,"aspect":1,"roundness":0,"freq":1,"noise":0.4,"twist":1.2,"twirl":0.25,"velocity":0.9,"ampX":0.8,"ampY":0.8,"zoom":1,"mirror":"off","lineWidth":0.45},
  "matrix-drift": {"layout":"matrix","shape":"circle","count":64,"size":0.8,"floor":0.38,"aspect":1,"roundness":0,"freq":1.4,"noise":0,"twist":0.8,"twirl":0.12,"velocity":0.9,"ampX":0.9,"ampY":0.9,"zoom":1,"mirror":"off","lineWidth":0.5},
  veil: {"layout":"wave-x","shape":"circle","count":70,"size":2.09,"floor":0.05,"aspect":1.15,"roundness":0,"freq":1.2,"noise":0,"twist":3.4,"twirl":0.1,"velocity":0.8,"ampX":0.8,"ampY":1,"zoom":1,"mirror":"off","lineWidth":0.5,"fillAlpha":0.12,"strokeAlpha":0,"blend":"multiply","trail":0,"colors":{"bg":"#F6F5F1","fill":"#6E6A8F","stroke":"#1D1D1D"}},
  phosphor: {"layout":"ring","shape":"circle","count":64,"size":1.5,"floor":0.33,"aspect":1.6,"roundness":0,"freq":1,"noise":0,"twist":2.8,"twirl":0.3,"velocity":0.9,"ampX":0.85,"ampY":0.85,"zoom":1,"mirror":"off","lineWidth":0.6,"fillAlpha":0.05,"strokeAlpha":0.85,"blend":"screen","trail":0,"colors":{"bg":"#101014","fill":"#7BE8C4","stroke":"#8AF0CE"}},
  comet: {"layout":"spiral","shape":"circle","count":40,"size":0.7,"floor":0.43,"aspect":1.3,"roundness":0,"freq":1.8,"noise":0.2,"twist":2,"twirl":0.5,"velocity":1.6,"ampX":0.9,"ampY":0.9,"zoom":1,"mirror":"off","lineWidth":0.7,"fillAlpha":0,"strokeAlpha":0.7,"blend":"lighter","trail":0.86,"colors":{"bg":"#14120F","fill":"#E8E4D8","stroke":"#E4DFCE"}},
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
