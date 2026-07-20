/**
 * Generates a recolorable inline <Logo> React component from the canonical
 * master SVG (assets/vaiven-logo-master.svg), and an ink-filled copy for the
 * playground header. Re-run whenever the master logo changes.
 *
 * The master may contain any number of <path> elements (per-letter paths,
 * fill-rule and all); every fill except "none" is treated as the mark colour.
 *
 *   node scripts/build-logo.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = readFileSync(join(root, "..", "assets", "vaiven-logo-master.svg"), "utf8");

const viewBox = (master.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 689 105";
const paths = [...master.matchAll(/<path\b[^>]*>/g)]
  .map((m) => ({
    d: (m[0].match(/\sd="([^"]+)"/) || [])[1],
    evenodd: /fill-rule="evenodd"/.test(m[0]),
  }))
  .filter((p) => p.d);
if (!paths.length) throw new Error("no <path d> found in master SVG");

const pathJsx = paths
  .map(
    (p) => `    <path
      d="${p.d}"${p.evenodd ? '\n      fillRule="evenodd"\n      clipRule="evenodd"' : ""}
      fill={color}
      stroke={outline || "none"}
      strokeWidth={outlineWidth}
      strokeLinejoin="round"
      paintOrder="stroke"
    />`
  )
  .join("\n");

const component = `// AUTO-GENERATED from assets/vaiven-logo-master.svg by scripts/build-logo.mjs
import React from "react";

export const LOGO_VIEWBOX = "${viewBox}";

/**
 * The Vaiven wordmark as inline SVG so its colour can be set per surface.
 * Optional \`outline\` draws a contrasting keyline behind the fill (paintOrder
 * "stroke"), keeping the mark legible over same-coloured artwork.
 */
export const Logo = ({ color = "#F5F4F1", outline, outlineWidth = 0, width, style }) => (
  <svg
    viewBox="${viewBox}"
    width={width}
    style={{ display: "block", height: "auto", overflow: "visible", ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
${pathJsx}
  </svg>
);
`;
writeFileSync(join(root, "src", "Logo.jsx"), component);

// Ink copy for the (light) playground header.
writeFileSync(
  join(root, "..", "assets", "vaiven-logo.svg"),
  master.replace(/fill="(?!none")[^"]*"/g, 'fill="#1E1E1E"')
);

console.log(`wrote promo/src/Logo.jsx and assets/vaiven-logo.svg (ink, ${paths.length} paths)`);
