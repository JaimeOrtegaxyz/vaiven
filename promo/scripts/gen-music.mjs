/**
 * Audio for the promo.
 *
 * Music: one FULL ~20s track per genre (so it has a real intro/groove/middle),
 * generated instrumentally. The video plays a hard 3-second slice from the
 * MIDDLE of each (via <Audio trimBefore> in the component) — i.e. it sounds
 * like you cut three seconds out of the middle of a real song, hard in/out.
 *
 * SFX: a short mechanical-keyboard typing clip for the install card.
 *
 *   node scripts/gen-music.mjs           # everything
 *   node scripts/gen-music.mjs calm      # just one id (or "typing")
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const env = {};
try {
  for (const line of readFileSync(join(root, ".env"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const API_KEY = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY (promo/.env)");
  process.exit(1);
}

const outDir = join(root, "public", "audio");
mkdirSync(outDir, { recursive: true });
const FMT = "?output_format=mp3_44100_128";

// Five real, distinct genres — one full track each, sliced in the middle.
const TRACKS = [
  {
    id: "calm",
    prompt:
      "Neoclassical chamber music. A warm string quartet plays a slow tender adagio — legato violins, viola and cello with gentle rubato, intimate and emotional, a little soft piano underneath. Acoustic, elegant, no drums.",
  },
  {
    id: "pop",
    prompt:
      "Bright modern synth-pop, almost hyperpop. Punchy four-on-the-floor kick, sugary plucky synth hook, sidechained shiny chords, huge euphoric and radio-ready, super catchy. Instrumental.",
  },
  {
    id: "psych",
    prompt:
      "Heavy psychedelic rock jam. Thick fuzz guitars drenched in wah and phaser bending and melting the notes, swirling Hammond organ, loose live drums, hypnotic driving groove. Instrumental.",
  },
  {
    id: "flamenco",
    prompt:
      "Fiery flamenco. Virtuosic nylon-string Spanish guitar with rapid rasgueado runs, driving palmas handclaps and cajón, passionate rhythmic bulería feel, intense. Instrumental.",
  },
  {
    id: "dnb",
    prompt:
      "Fast liquid drum and bass, 174 bpm. Rolling chopped amen breakbeat, deep rumbling sub bass, bright reese stabs, frenetic energetic and relentless. Instrumental.",
  },
];

async function music({ id, prompt }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/music${FMT}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      music_length_ms: 20000,
      model_id: "music_v1",
      force_instrumental: true,
    }),
  });
  if (!res.ok) throw new Error(`music ${id}: HTTP ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, `mood-${id}.mp3`), buf);
  console.log(`♪ ${id.padEnd(10)} ${(buf.length / 1024).toFixed(0)} KB`);
}

async function typing() {
  const res = await fetch(`https://api.elevenlabs.io/v1/sound-generation${FMT}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Typing a short command on a clicky mechanical keyboard, crisp individual key presses, close and dry, no room reverb.",
      duration_seconds: 2.5,
      prompt_influence: 0.6,
    }),
  });
  if (!res.ok) throw new Error(`typing sfx: HTTP ${res.status} ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(outDir, "typing.mp3"), buf);
  console.log(`⌨ typing     ${(buf.length / 1024).toFixed(0)} KB`);
}

const only = process.argv[2];
const jobs = [];
for (const t of TRACKS) if (!only || only === t.id) jobs.push(() => music(t));
if (!only || only === "typing") jobs.push(typing);

// Subscription caps at 2 concurrent generations — run sequentially.
let failures = 0;
for (const job of jobs) {
  try {
    await job();
  } catch (e) {
    failures++;
    console.error("✗", e.message);
  }
}
process.exit(failures ? 1 : 0);
