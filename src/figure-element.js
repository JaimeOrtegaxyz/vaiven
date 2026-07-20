/**
 * <vaiven-figure> — web component wrapper around the Vaiven engine.
 *
 * Usage:
 *   <script type="module" src=".../figure-element.js"></script>
 *   <vaiven-figure preset="hero"></vaiven-figure>
 *   <vaiven-figure src="/figures/hero.json"></vaiven-figure>
 *   <vaiven-figure config='{"layout":"ring","count":56}'></vaiven-figure>
 *
 * `preset="hero"` resolves the named entry from /vaiven.presets.json (the
 * project shelf) — the shelf is the source of truth, so editing the preset
 * changes what the site serves. `src` fetches a config JSON; a `#name`
 * fragment (src="/my-shelf.json#hero") picks an entry out of a preset map,
 * and `src` + `preset` together read `preset` from a custom shelf URL.
 * Concurrent fetches of the same file are deduped, so a page of figures
 * costs one request.
 *
 * <gen-figure> is registered as a legacy alias.
 * Size it with CSS; the host is display:block with a default 340/270
 * aspect-ratio. `config` merges on top of the fetched config when both are
 * set (per-instance override); if the fetch fails, `config` alone still
 * renders, so an inline snapshot doubles as an offline fallback.
 */

import { createFigure, mergeConfig, DEFAULTS, FALLBACK } from "./figure.js";

// In non-browser environments (SSR, Node tooling) importing this module is a
// safe no-op: the class falls back to a dummy base and registration is skipped.
const Base = typeof HTMLElement !== "undefined" ? HTMLElement : class {};

const SHELF_URL = "/vaiven.presets.json";

// Dedupes the burst of identical shelf fetches when a page of figures
// connects. Entries drop right after settling, so a later reload (attribute
// change, SPA navigation) refetches fresh — live edits stay live.
const inflight = new Map();
function fetchJson(url) {
  let p = inflight.get(url);
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(r.status + " " + r.statusText);
      return r.json();
    });
    inflight.set(url, p);
    p.catch(() => {}).finally(() => setTimeout(() => inflight.delete(url), 0));
  }
  return p;
}

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
      if (src || preset) {
        const hash = src ? src.indexOf("#") : -1;
        const file = (hash === -1 ? src : src.slice(0, hash)) || SHELF_URL;
        const name = hash !== -1 ? decodeURIComponent(src.slice(hash + 1)) : preset;
        const json = await fetchJson(file);
        if (name) {
          config = json && typeof json === "object" ? json[name] : null;
          if (config == null) throw new Error(`preset "${name}" not found in ${file}`);
        } else {
          config = json;
        }
      }
    } catch (err) {
      console.warn("<vaiven-figure> failed to load config:", err);
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
