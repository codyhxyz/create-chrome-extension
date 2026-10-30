## [0.3.0] — 2026-10-29

### Added
- **Listing-copy lint** (ship mode): `listing-copy-placeholder` (`Lorem ipsum`; uppercase `TODO` / `TBD` / `FIXME`), `listing-copy-test-wording` ("debug build", "for testing purposes"), `listing-copy-other-store` (Firefox / Edge / Opera add-ons, App Store, Google Play: Yellow Argon risk), all warn; `listing-copy-unfinished` ("coming soon", "public beta", "pre-release"), info. Checks the title, summary, their `_locales` translations and `store/listing-description.txt` (with line numbers). Ported from the content checks in `asc validate`.
- `validate-cws.ts --strict`: warnings block too. New `info` severity that never blocks. The JSON envelope gains `strict`, `summary.info` and `summary.blocking` (additive).
- `publish-cws.ts --dry-run` (also `npm run ship -- --dry-run`, `CWS_DRY_RUN=1`): exchanges the token and reads the item to prove the secrets work, reports what it would upload and publish, changes nothing.
- `cws-dashboard.mjs --dry-run` for `set`, `save`, `submit`, `cancel-review` and `js`: reads the page and reports the diff / button state / blockers without filling or clicking.
- cws-ship marks every command it runs as read-only, local or remote.

### Changed
- **`publish-cws.ts` exit codes are one per terminal state:** 0 live, 1 rejected, 2 setup, 3 failed / upload-failed, 4 error, 7 in-review, 8 timeout. `in-review` used to exit 0 and is now 7, the normal result of a submission, so `npm run ship` exits non-zero on success-pending. The JSON envelope gains `exitCode` and `dryRun`.

### Fixed
- CI on main was red: the validator snapshot test still expected 16 structural / 22 ship rules, and compared the ship findings against the error set although the warn rule `ship-ready-promo-tiles` also fires on the factory. It now counts 17 / 26 and compares error findings only.

## [0.1.0] — 2026-04-19

### Added
- First plugin release packaging the six existing factory skills:
  - `cce-init` — onboarding interview that strips unused entrypoints, delegates content/screenshots/video, confirms structural-green
  - `cws-content` — fills listing copy (name, description, host origins, welcome) and clears the four content rules
  - `cws-screens` — interviews + generates the five Chrome Web Store screenshots
  - `cws-ship` — gates on the validator, version-syncs, and submits via the CWS API (with manual-zip fallback)
  - `cws-video` — interviews + generates the 30-second promo video via the external hyperframes skill
  - `setup-cws-credentials` — walks Google Cloud project + OAuth client setup and harvests refresh tokens
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` so the repo is installable via `/plugin marketplace add codyhxyz/create-chrome-extension`.
