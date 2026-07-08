/**
 * Generates a recolorable inline <Logo> React component from the canonical
 * master SVG (assets/vaiven-logo-master.svg), and an ink-filled copy for the
 * playground header. Re-run whenever the master logo changes.
 *
 *   node scripts/build-logo.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = readFileSync(join(root, "..", "assets", "vaiven-logo-master.svg"), "utf8");

const d = master.match(/\sd="([^"]+)"/)[1];
const viewBox = (master.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 702 105";

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
    <path
      d="${d}"
      fill={color}
      stroke={outline || "none"}
      strokeWidth={outlineWidth}
      strokeLinejoin="round"
      paintOrder="stroke"
    />
  </svg>
);
`;
writeFileSync(join(root, "src", "Logo.jsx"), component);

// Ink copy for the (light) playground header.
writeFileSync(
  join(root, "..", "assets", "vaiven-logo.svg"),
  master.replace(/fill="black"/, 'fill="#1E1E1E"')
);

console.log("wrote promo/src/Logo.jsx and assets/vaiven-logo.svg (ink)");
