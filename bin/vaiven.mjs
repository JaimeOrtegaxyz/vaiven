#!/usr/bin/env node
/**
 * `npx vaiven` — the vaiven workspace.
 *
 * Serves the playground from the installed package and gives it live
 * read/write access to THIS project's preset shelf (vaiven.presets.json).
 * Zero dependencies — node builtins only.
 *
 * The shelf must live where the site serves static files, so that embeds can
 * fetch it at /vaiven.presets.json. Frameworks serve a dedicated directory
 * (Next/Vite/Astro/Nuxt: public/, SvelteKit/Hugo: static/), plain sites serve
 * the root — so the shelf is resolved, in order: an existing shelf in
 * public/ or static/, an existing shelf at the root, a NEW shelf in public/
 * or static/ when the directory exists, else the root. `--shelf` overrides.
 *
 *   npx vaiven                 serve on 4633 (or next free port) and open
 *   npx vaiven --port 5000     pick the port
 *   npx vaiven --no-open       don't open the browser
 *   npx vaiven --shelf <path>  use a different shelf file
 */

import { createServer } from "node:http";
import { statSync, realpathSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve, extname, sep, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = fileURLToPath(new URL("..", import.meta.url));
const MAX_BODY = 2 * 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

// ------------------------------------------------------------------ arguments
const args = process.argv.slice(2);
function flagValue(name) {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}
if (args.includes("--help") || args.includes("-h")) {
  console.log(`vaiven — local workspace for this project's figures

  npx vaiven                 serve the playground, open the browser
  npx vaiven --port <n>      port (default 4633; tries upward if taken)
  npx vaiven --no-open       don't open the browser
  npx vaiven --shelf <path>  shelf file (default: vaiven.presets.json found
                             in public/, static/, or the project root — new
                             shelves are created in public//static/ when the
                             directory exists, so the site serves them)

The SHELF row in the playground reads and writes the shelf file directly —
saved looks land in your project, ready to embed or hand to an agent.`);
  process.exit(0);
}
const basePort = Number(flagValue("--port") || process.env.PORT || 4633);
if (flagValue("--port") && !(Number.isInteger(basePort) && basePort >= 1 && basePort <= 65535)) {
  console.error("vaiven: --port must be an integer between 1 and 65535");
  process.exit(1);
}
// Conventional framework static dirs, in preference order. The shelf's whole
// job is to be served at /vaiven.presets.json, so it belongs in whichever
// directory the site actually serves.
const STATIC_DIRS = ["public", "static"];
function findShelf() {
  const cwd = process.cwd();
  const isFile = (p) => !!statSync(p, { throwIfNoEntry: false })?.isFile();
  const isDir = (p) => !!statSync(p, { throwIfNoEntry: false })?.isDirectory();
  const atRoot = resolve(cwd, "vaiven.presets.json");
  const served = STATIC_DIRS.map((d) => resolve(cwd, d, "vaiven.presets.json")).find(isFile);
  const staticDir = STATIC_DIRS.find((d) => isDir(resolve(cwd, d)));
  if (served) {
    // realpath: a symlinked shelf (public/ → root) is one file, not two
    if (isFile(atRoot) && realpathSync(atRoot) !== realpathSync(served)) {
      console.warn(
        `vaiven: two shelf files found — using ${relative(cwd, served)} (the copy the site serves); ` +
        `./vaiven.presets.json is ignored (delete it, or pick it with --shelf)`
      );
    }
    return served;
  }
  if (isFile(atRoot)) {
    if (staticDir) {
      console.warn(
        `vaiven: the shelf is at ./vaiven.presets.json but this project serves static files from ` +
        `${staticDir}/ — the site can't serve it there. Fix:  mv vaiven.presets.json ${staticDir}/`
      );
    }
    return atRoot;
  }
  return staticDir ? resolve(cwd, staticDir, "vaiven.presets.json") : atRoot;
}
const shelfPath = flagValue("--shelf")
  ? resolve(process.cwd(), flagValue("--shelf"))
  : findShelf();
const openBrowser = !args.includes("--no-open");

// ---------------------------------------------------------------------- shelf
async function readShelf() {
  try {
    const obj = JSON.parse(await readFile(shelfPath, "utf8"));
    return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
  } catch {
    return {};
  }
}

function validShelf(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  return Object.values(obj).every((v) => v && typeof v === "object" && !Array.isArray(v));
}

function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": MIME[".json"], "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

async function handleApi(req, res, pathname) {
  if (pathname !== "/api/shelf") return sendJson(res, 404, { error: "unknown endpoint" });

  if (req.method === "GET") {
    return sendJson(res, 200, {
      project: basename(process.cwd()),
      file: relative(process.cwd(), shelfPath) || basename(shelfPath),
      presets: await readShelf(),
    });
  }

  if (req.method === "PUT") {
    let size = 0;
    const chunks = [];
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) return sendJson(res, 413, { error: "body too large" });
      chunks.push(chunk);
    }
    let obj;
    try {
      obj = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return sendJson(res, 400, { error: "invalid JSON" });
    }
    if (!validShelf(obj)) {
      return sendJson(res, 400, { error: "expected { name: config, ... }" });
    }
    await writeFile(shelfPath, JSON.stringify(obj, null, 2) + "\n");
    return sendJson(res, 200, { ok: true, count: Object.keys(obj).length });
  }

  res.writeHead(405, { allow: "GET, PUT" });
  res.end();
}

// --------------------------------------------------------------- static files
async function handleStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    return res.end();
  }
  // The shelf at its canonical URL, exactly as a deployed site would serve
  // it — <vaiven-figure preset="…"> resolves here like anywhere else.
  if (pathname === "/vaiven.presets.json") {
    const body = JSON.stringify(await readShelf(), null, 2);
    res.writeHead(200, { "content-type": MIME[".json"], "cache-control": "no-store" });
    return res.end(req.method === "HEAD" ? undefined : body);
  }
  if (pathname === "/") {
    res.writeHead(302, { location: "/playground/" });
    return res.end();
  }
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  if (rel.endsWith("/")) rel += "index.html";
  const file = resolve(PKG_ROOT, "." + rel);
  if (file !== resolve(PKG_ROOT) && !file.startsWith(resolve(PKG_ROOT) + sep)) {
    res.writeHead(403);
    return res.end();
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404, { "content-type": MIME[".txt"] });
    res.end("not found");
  }
}

// --------------------------------------------------------------------- server
const server = createServer(async (req, res) => {
  try {
    // Only answer for localhost hosts: a remote page that rebinds its DNS to
    // 127.0.0.1 would otherwise reach /api/shelf (a file write) same-origin.
    const host = String(req.headers.host || "").replace(/:\d+$/, "");
    if (host !== "localhost" && host !== "127.0.0.1" && host !== "[::1]") {
      res.writeHead(403, { "content-type": MIME[".txt"] });
      return res.end("forbidden host");
    }
    const { pathname } = new URL(req.url, "http://localhost");
    if (pathname.startsWith("/api/")) await handleApi(req, res, pathname);
    else await handleStatic(req, res, pathname);
  } catch (err) {
    if (!res.headersSent) sendJson(res, 500, { error: String(err && err.message || err) });
    else res.end();
  }
});

function listen(port, triesLeft) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && triesLeft > 0) listen(port + 1, triesLeft - 1);
    else {
      console.error("vaiven: " + err.message);
      process.exit(1);
    }
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://localhost:${server.address().port}/playground/`;
    console.log(`vaiven workspace  ${url}`);
    console.log(`project shelf     ${shelfPath}`);
    if (openBrowser) {
      const cmd = process.platform === "darwin" ? ["open", url]
        : process.platform === "win32" ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url];
      spawn(cmd[0], cmd.slice(1), { stdio: "ignore", detached: true }).on("error", () => {}).unref();
    }
  });
}
listen(Number.isFinite(basePort) ? basePort : 4633, 20);
