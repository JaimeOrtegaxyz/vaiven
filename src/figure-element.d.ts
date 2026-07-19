/**
 * `import "vaiven/element"` — registers <vaiven-figure> (and the legacy
 * <gen-figure> alias). Side-effect only module; safe to import during SSR,
 * where it is a no-op.
 */

import type { FigureHandle } from "./figure.js";

declare class VaivenFigureElement extends HTMLElement {
  /** Engine handle (.set(), .pause(), .resume(), .config) — null until connected. */
  readonly figure: FigureHandle | null;
}

declare global {
  interface HTMLElementTagNameMap {
    "vaiven-figure": VaivenFigureElement;
    "gen-figure": VaivenFigureElement;
  }
}

export {};
