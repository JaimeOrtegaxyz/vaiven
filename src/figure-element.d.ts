/**
 * `import "vaiven/element"` — registers <vaiven-figure> (and the legacy
 * <gen-figure> alias). Side-effect only module; safe to import during SSR,
 * where it is a no-op.
 *
 * Attributes: `preset` (named entry in /vaiven.presets.json — the project
 * shelf, the source of truth), `src` (config JSON URL; `#name` fragment picks
 * an entry from a preset map), `config` (inline JSON; merges on top of the
 * fetched config, and renders alone as fallback if the fetch fails).
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
