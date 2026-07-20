# Contributing to vaiven

Thanks for your interest! vaiven is a small, opinionated project — a few
ground rules keep it that way.

## The non-negotiables

- **Zero dependencies, no build step.** The engine (`src/`) is two plain ES
  modules, shipped as source. PRs that add a bundler, transpiler, or runtime
  dependency to the engine, element, or `bin/` will be declined regardless of
  merit.
- **Config-driven.** New expressive power should be a new knob in `DEFAULTS`
  (with matching types in `src/figure.d.ts` and docs in
  `skill/reference/config.md`), not a new code path per figure.
- **A saved config keeps rendering the same** across patch and minor versions.
  Anything that changes how an existing config renders is a breaking change.

## Working on it

```sh
git clone https://github.com/JaimeOrtegaxyz/vaiven
cd vaiven
node bin/vaiven.mjs   # → http://localhost:4633/playground/
```

No install, no build. The playground is the test bench — if your change
affects rendering, look at it there (and at more than one figure).

## Sending changes

- Open an issue first for anything beyond a small fix, so we can agree on the
  knob/API before you build it.
- Keep PRs focused; match the style of the file you're editing.
- If you add or change a knob, update `src/figure.d.ts`,
  `skill/reference/config.md`, and the `DEFAULTS` comments together.

## Bugs

A playground URL (the whole config lives in the `#hash`) or a pasted JSON
config that reproduces the issue is the perfect bug report.
