/**
 * <vaiven-figure> — web component wrapper around the Vaiven engine.
 *
 * Usage:
 *   <script type="module" src=".../figure-element.js"></script>
 *   <vaiven-figure config='{"layout":"ring","count":56}'></vaiven-figure>
 *   <vaiven-figure src="/figures/hero.json"></vaiven-figure>
 *   <vaiven-figure preset="shell"></vaiven-figure>   (presets/ next to src/)
 *
 * <gen-figure> is registered as a legacy alias.
 * Size it with CSS; the host is display:block with a default 340/270
 * aspect-ratio. `config` merges on top of `src`/`preset` when both are set.
 */

import { createFigure, mergeConfig, DEFAULTS, FALLBACK } from "./figure.js";

// In non-browser environments (SSR, Node tooling) importing this module is a
// safe no-op: the class falls back to a dummy base and registration is skipped.
const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class VaivenFigure extends Base {
  static observedAttributes = ["config", "src", "preset"];

  #fig = null;
  #canvas = null;
  #token = 0;

  connectedCallback() {
    if (!this.#canvas) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `<style>
        :host { display: block; aspect-ratio: 340 / 270; }
        canvas { display: block; width: 100%; height: 100%; touch-action: pan-y; }
      </style><canvas></canvas>`;
      this.#canvas = shadow.querySelector("canvas");
    }
    this.#load();
  }

  disconnectedCallback() {
    this.#fig?.destroy();
    this.#fig = null;
  }

  attributeChangedCallback() {
    if (this.isConnected && this.#canvas) this.#load();
  }

  async #load() {
    const token = ++this.#token;
    let config = null;
    const src = this.getAttribute("src");
    const preset = this.getAttribute("preset");
    try {
      if (src) {
        config = await (await fetch(src)).json();
      } else if (preset) {
        const url = new URL(`../presets/${preset}.json`, import.meta.url);
        config = await (await fetch(url)).json();
      }
    } catch (err) {
      console.warn("<vaiven-figure>failed to load config:", err);
      config = null;
    }
    if (token !== this.#token || !this.isConnected) return;

    const inline = this.getAttribute("config");
    if (inline) {
      try {
        config = mergeConfig(mergeConfig(DEFAULTS, config || {}), JSON.parse(inline));
      } catch (err) {
        console.warn("<vaiven-figure>bad config JSON:", err);
      }
    }
    // no attributes at all, or every source failed → loud missing-config signal
    if (config == null) config = FALLBACK;
    if (this.#fig) this.#fig.set(config);
    else this.#fig = createFigure(this.#canvas, config);
  }

  /** Engine handle: .set(), .pause(), .resume(), .config */
  get figure() {
    return this.#fig;
  }
}

if (typeof customElements !== "undefined") {
  if (!customElements.get("vaiven-figure")) {
    customElements.define("vaiven-figure", VaivenFigure);
  }
  // legacy alias from the pre-name era
  if (!customElements.get("gen-figure")) {
    customElements.define("gen-figure", class extends VaivenFigure {});
  }
}
