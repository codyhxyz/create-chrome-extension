# Fallback ladders

> Status: **draft spec, not yet implemented.** Reviewing the shape before encoding.

## Why this exists

The factory's other gates (`compile`, `check:cws`, `check:cws:ship`, `zip`) refuse to lie — they pass or fail and `zip` won't produce an artifact until ship-mode is green. Screenshots break that contract. They cheerfully render a structurally-valid PNG that is *semantically* a fake screenshot of a different extension, and nothing flags it.

The fallback ladder pattern fixes that asymmetry by giving each artifact-type-that-can-degrade an explicit ranked list of how to produce it, where it landed, and whether that rung is ship-acceptable.

The deeper goal: **asking the user a question is a defect.** Every place the model running the factory has to stop and ask is a place we didn't think of in advance. The ladder pattern lets the factory always produce *something honest* without asking, and surfaces what's missing in one readable place when the user comes back.

## What does and doesn't get a ladder

Most of the factory is binary — code compiles or it doesn't, manifest is valid or it isn't, permission is in the allowlist or it isn't. Adding rungs to binary checks would be complexity for nothing.

**Earns a ladder** (artifact has a meaningful "good enough but honest" middle):
- **Screenshots** (5 PNGs for the CWS listing)
- **Promo video** (1 MP4 for the CWS listing)

**Stays binary** (no useful intermediate state):
- TypeScript / build / manifest / permissions / CSP / structural CWS rules — these are correctness gates, no middle ground.
- Listing copy, welcome content, store description — placeholder text would defeat the existing `listing-drift` gate that detects un-customized copy. The honest middle here is "field is empty and validator says so," which the existing gate already does.
- Icon — `assets/icon.svg` is shipped with a default the factory considers acceptable. If the user deletes it, that's a binary failure, not a ladder.

**Scope check:** if a future artifact needs a ladder, justify it against this list. The bar is "is there a useful, honest intermediate output between ideal and missing?" If not, keep it binary.

## Ladder shape

A ladder is a small ordered list of `Rung` functions. Each rung is tried in order until one succeeds. The factory records which rung landed and whether it cleared the ship threshold.

```ts
interface Rung<T> {
  id: string;                    // e.g. "real-build", "surface-mock", "concept-card"
  name: string;                  // human-readable, shown in validator output
  shipAcceptable: boolean;       // does landing here let `zip` proceed?
  attempt: () => Promise<T | RungSkip>;
}

interface LadderResult<T> {
  artifactId: string;            // e.g. "screenshot:1", "promo-video"
  landedRung: string;            // id of the rung that succeeded
  shipAcceptable: boolean;       // copied from landed rung
  reason?: string;               // why we didn't reach a higher rung (one line)
  output: T;
}
```

The result of every ladder run is appended to `.factory/ladder-status.json`. The validator reads that file and prints a one-line readout per artifact.

`.factory/` is a new top-level dir (gitignored) for factory-internal bookkeeping. Not co-located with `.output/` because that gets blown away by WXT builds; not under `node_modules/.cache/` because that's opaque. One conventional dot-dir is the right cost for a single source of truth the validators can read.

**Reporting format** (in `check:cws:ship` output):
```
screenshots/01.png    rung: real-build       ✓ ship-ok
screenshots/02.png    rung: surface-mock     ⚠ stub  (reason: surface=newtab not in SurfaceMock)
screenshots/03.png    rung: concept-card     ⚠ stub  (reason: no .output build found)
promo-video.mp4       rung: missing          ✗ blocked  (reason: hyperframes skill not installed)
```

## Per-artifact ladders

### Screenshots

Five rungs, top to bottom. The factory attempts each per-screenshot; different screenshots in the set may land on different rungs.

| # | Rung | Ship-acceptable | What it does |
|---|---|---|---|
| 1 | `real-build` | ✓ | Loads the corresponding surface from `.output/chrome-mv3/` in an iframe and screenshots it inside the browser-frame chrome. Requires a recent `npm run build`. |
| 2 | `surface-mock` | ✗ | Falls back to `SurfaceMock` for surfaces it knows (popup/sidepanel/options/welcome/content). Only used when `real-build` fails for a *known* surface (no build yet). Marked stub. |
| 3 | `concept-card` | ✗ | A typographic card showing `extensionName` + `tagline` + a short surface label, on a fixed branded background. Used when the surface type isn't in SurfaceMock (newtab, devtools, etc.) and there's no build to load. Marked stub. |
| 4 | `missing` | ✗ | Writes nothing; records the gap. Used only if the screenshot config itself is malformed. |

**Note on rung 2:** `SurfaceMock` is currently the *default* path. Under this spec it becomes a fallback, not the default. The default is rung 1 (real build).

**Stub watermark:** rungs 2 and 3 produce PNGs with a diagonal `STUB — NOT FOR SUBMISSION` banner across the full image, semi-transparent so the layout below is still readable. The watermark is removed only on rung 1. Diagonal-banner over corner-ribbon because the watermark exists to prevent accidental upload — a tired user can crop or overlook a corner ribbon, but not a banner. The factory's whole bet is not lying; the watermark should be aggressive about that.

**newtab fix:** the immediate consequence is that `newtab` no longer needs to be added to `SurfaceMock`'s enum at all — rung 1 handles it for any surface in the build, and rung 3 handles it generically for any surface name.

### Promo video

| # | Rung | Ship-acceptable | What it does |
|---|---|---|---|
| 1 | `hyperframes-rendered` | ✓ | Renders via the hyperframes skill from a config (hook/beats/narration). |
| 2 | `missing` | ✗ | Writes nothing; records that hyperframes isn't installed and surfaces the exact remediation: `npx skills add heygen-com/hyperframes`, then re-run. |

No middle rung. An auto-slideshow from screenshots would be real implementation work (video encoding, timing, title cards) for an output that's never ship-acceptable and looks visibly bad in a way that doesn't help anyone. The honest middle for video is "we don't have a video yet, here's exactly what's needed to make one" — which is what rung 2 already does.

## Integration with existing gates

- `check:cws` (structural): unchanged. Doesn't read `ladder-status.json`. This stays a fast structural check.
- `check:cws:ship`: reads `ladder-status.json` and adds one rule per ladderable artifact: *"landed rung is ship-acceptable."* Renders the per-artifact readout shown above. If any artifact landed below ship-acceptable, ship-mode is red.
- `zip`: unchanged in mechanism — still gated on `check:cws:ship` green. The ladder makes failures more legible without changing the zip gate.
- `npm run screenshots` / `npm run video`: each one runs its ladder, writes outputs, updates `ladder-status.json`. Always exits 0 if *any* rung succeeded. Prints the rung it landed on.

## The asks-log

A separate, lighter mechanism: `docs/asks-log.md`. Every time the model running the factory has to stop and ask the user a question that *could plausibly have been automated or had a fallback*, it adds an entry:

```
- 2026-04-19 — screenshots: had to ask whether to mock newtab or screenshot real build.
  Should have been: rung 1 (real build) auto-attempted, fell back to rung 3.
  Status: addressed by fallback ladder spec (07-fallback-ladders.md).
```

This file is the roadmap for shrinking the factory's question count. Entries get closed when a fallback or automation lands.

The asks-log is **prose, manually maintained by the model**. Not a machine-checked artifact. The point is to make the defect class *visible*, not to formalize it.

## Out of scope (intentionally)

- Generalizing the ladder pattern to a framework. Two ladders is not a framework. If a third artifact ever earns a ladder, *then* extract.
- Model-generated stub aesthetics. Rung 3 for screenshots is a fixed typographic template — no model judgment in the rendering. Determinism over taste here, because the factory's bet is determinism.
- Auto-installing external skills (hyperframes). The user runs `npx skills add ...`; the ladder just makes the absence honest.

## Implementation order

When this is encoded, smallest-cost-highest-leverage first:

1. `.factory/ladder-status.json` writer + reader.
2. Screenshots ladder rungs 1 (real-build via iframe) and 3 (concept-card). Skip rung 2 (`SurfaceMock`) at first — it's an optimization for the "known surface, no build" case that real users rarely hit, and rung 3 covers it adequately. Add it back only if the missing-detail bothers in practice.
3. Diagonal stub watermark, applied to any non-rung-1 PNG.
4. `check:cws:ship` integration: read `ladder-status.json`, add per-artifact ship-acceptable rule, render the readout.
5. Video ladder (trivial — two rungs, rung 2 just records the gap).
6. `docs/asks-log.md` seeded with the screenshots/video incident that motivated this spec.

`SurfaceMock` itself stays in the repo for now — it's still useful as a worked example of what rung-2-shaped fallback surfaces look like if a future ladder ever needs one.
