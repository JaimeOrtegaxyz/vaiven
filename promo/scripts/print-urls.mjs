// Prints a vaiven-playground URL for each mood config (open in the editor,
// tweak, hand the values back).  Run the playground first:
//   cd .. && python3 -m http.server 4633   →   http://localhost:4633/playground/
import { MOODS } from "../src/moods.js";

const base = "http://localhost:4633/playground/#";
for (const m of MOODS) {
  const url = base + encodeURIComponent(JSON.stringify(m.config));
  console.log(`\n### ${m.id} — ${m.genre}\n${url}`);
}
