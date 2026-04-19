# Asks log

Every entry here is a place where the factory (or the model running it) had
to stop and ask the user for input that *could plausibly have been automated
or had a fallback*. Each entry is a defect — the goal of this file is to drive
the count down over time by either automating the missing piece or adding it
to a fallback ladder.

This file is **prose, manually maintained**. Not a machine-checked artifact.
The point is to make the defect class visible, not to formalize it.

When closing an entry, leave it in place with a `Status:` line citing the
commit / spec / skill that closed it — the historical record is the value.

## Format

```
- YYYY-MM-DD — <surface>: <what we had to ask>
  Should have been: <what the automation or fallback should look like>
  Status: <open | addressed by …>
```

## Entries

- 2026-04-19 — screenshots: had to ask whether to extend `SurfaceMock` with
  a newtab variant or screenshot the real built extension, because the
  generic SurfaceMock rendered "Your extension" placeholder UI rather than
  the actual newtab surface. Also had to ask whether to skip ship-mode.
  Should have been: rung 1 (real built surface via iframe) attempted
  automatically with rung 3 (concept card) as fallback, recorded in
  `.factory/ladder-status.json` and surfaced by `check:cws:ship`.
  Status: addressed by docs/07-fallback-ladders.md and the screenshots
  ladder implementation (capture.ts + validate-cws.ts shipReadyScreenshots).

- 2026-04-19 — video: had to ask the user to install the external
  `heygen-com/hyperframes` skill before any video could be produced.
  Should have been: the validator already says "run `npx skills add
  heygen-com/hyperframes`" via the existing `ship-ready-video` rule, which
  is the honest middle. No further automation is appropriate — installing
  third-party skills is a user action by design.
  Status: confirmed acceptable. The current `ship-ready-video` rule is
  the right shape; no change needed.
