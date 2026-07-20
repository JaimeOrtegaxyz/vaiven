/**
 * Vaiven — a config-driven Canvas 2D instrument for generative figures.
 * Type surface for `import { createFigure } from "vaiven"`.
 */

export type Layout = "wave-x" | "wave-y" | "ring" | "spiral" | "dial" | "matrix";
export type Shape =
  | "circle" | "square" | "triangle" | "diamond"
  | "pentagon" | "hexagon" | "custom";
export type Blend = "normal" | "multiply" | "screen" | "lighter";
export type Mirror = "off" | "x" | "y" | "xy";

export interface FigureColors {
  /** Background behind the figure. `"transparent"` lets the page show through. */
  bg?: string;
  /** Body color of every shape. */
  fill?: string;
  /** Outline color. */
  stroke?: string;
  /** 2–6 hex stops: the fill becomes a gradient flowing across the figure. */
  ramp?: string[] | null;
}

export interface FigureInteract {
  /** Hold to accelerate ×10. */
  press?: boolean;
  /** Pointer position reshapes the spread. */
  hover?: boolean;
  /** Stop the loop while scrolled offscreen. */
  pauseOffscreen?: boolean;
}

/**
 * One JSON config = one animation. Every field is optional; omitted fields
 * take DEFAULTS. Numbers are resolution-independent (340px reference space).
 */
export interface FigureConfig {
  layout?: Layout;
  shape?: Shape;
  /** SVG path data, used when shape is "custom". */
  path?: string;
  /** Number of shapes drawn (~30–120 is the usual territory). */
  count?: number;
  /** Size of the largest shapes. */
  size?: number;
  /** Smallest size as a fraction of `size` (1 = all equal). */
  floor?: number;
  /** Wide vs tall squash, area-preserving (0.2–5). */
  aspect?: number;
  /** Corner rounding for angular shapes (0–1). */
  roundness?: number;
  /** Wave cycles across the index sweep. */
  freq?: number;
  /** Per-index size irregularity. */
  noise?: number;
  /** Per-index rotation increment — the fan/spiral pitch. */
  twist?: number;
  /** Whole-figure rotation rate. */
  twirl?: number;
  /** Time speed. */
  velocity?: number;
  /** Horizontal spread of the placement pattern. */
  ampX?: number;
  /** Vertical spread of the placement pattern. */
  ampY?: number;
  /** Camera framing; scales figure + spacing, never the stroke. */
  zoom?: number;
  /** View pan; ±1 = figure center at the view edge (up to ±1.5). */
  offsetX?: number;
  /** View pan; ±1 = figure center at the view edge (up to ±1.5). */
  offsetY?: number;
  /** View rotation in degrees. */
  rotate?: number;
  mirror?: Mirror;
  /** Radial repeats of the whole figure around the center (1 = off). */
  kaleido?: number;
  /** Radius of a secondary circle each shape rides — coils/tubes (0 = off). */
  orbit?: number;
  /** How many times the orbit winds across the sweep. */
  coil?: number;
  /** Outline thickness in 340-reference px — the stroke-to-shape ratio holds
   * at any canvas size (0 = no outline). */
  lineWidth?: number;
  /** Fill opacity — low values + multiply/screen give washes. */
  fillAlpha?: number;
  /** Stroke opacity. */
  strokeAlpha?: number;
  blend?: Blend;
  /** 0 = clean redraw each frame, toward 1 = motion trails. */
  trail?: number;
  fps?: number;
  /** Phase offset; same params, different moment. */
  seed?: number;
  colors?: FigureColors;
  interact?: FigureInteract;
}

/** A fully resolved config: every knob present (as returned by `.config`). */
export type ResolvedFigureConfig =
  Required<Omit<FigureConfig, "colors" | "interact">> & {
    colors: Required<FigureColors>;
    interact: Required<FigureInteract>;
  };

export interface FigureHandle {
  readonly canvas: HTMLCanvasElement;
  /** The current fully-resolved config (a copy). */
  readonly config: ResolvedFigureConfig;
  /** Merge a partial config into the running figure. */
  set(patch: FigureConfig): FigureHandle;
  pause(): void;
  resume(): void;
  destroy(): void;
}

export declare const LAYOUTS: readonly Layout[];
export declare const SHAPES: readonly Shape[];
export declare const BLENDS: readonly Blend[];
export declare const MIRRORS: readonly Mirror[];
export declare const DEFAULTS: ResolvedFigureConfig;
export declare const FALLBACK: FigureConfig;

/** Drive a canvas directly. Resize/DPR, offscreen pause, reduced-motion and
 * the built-in interactions are wired automatically; call `destroy()` when done. */
export declare function createFigure(canvas: HTMLCanvasElement, config?: FigureConfig): FigureHandle;

/** Map legacy config keys (pre-rename) onto the current schema. */
export declare function normalizeConfig(patch?: FigureConfig & Record<string, unknown>): FigureConfig;
export declare function mergeConfig<B extends FigureConfig>(base: B, patch?: FigureConfig): B;
export declare function randomConfig(rand?: () => number): ResolvedFigureConfig;
export declare function mutateConfig(
  cfg: FigureConfig,
  amount?: number,
  rand?: () => number,
): ResolvedFigureConfig;
