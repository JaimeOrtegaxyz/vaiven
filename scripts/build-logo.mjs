/**
 * Regenerates the logo SVGs from the canonical master
 * (assets/vaiven-logo-master.svg): an ink copy for the playground header and
 * a cream copy for dark surfaces (the README's prefers-color-scheme variant).
 * Re-run whenever the master logo changes.
 *
 * The master may contain any number of <path> elements; every fill except
 * "none" is treated as the mark colour.
 *
 *   node scripts/build-logo.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = readFileSync(join(root, "assets", "vaiven-logo-master.svg"), "utf8");

const recolor = (fill) => master.replace(/fill="(?!none")[^"]*"/g, `fill="${fill}"`);
writeFileSync(join(root, "assets", "vaiven-logo.svg"), recolor("#1E1E1E"));
writeFileSync(join(root, "assets", "vaiven-logo-cream.svg"), recolor("#F5F4F1"));

console.log("wrote assets/vaiven-logo.svg (ink) and assets/vaiven-logo-cream.svg");
