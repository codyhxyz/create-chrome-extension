---
name: cce-import
description: Convert an existing vanilla MV3 Chrome extension (hand-authored manifest.json + flat HTML/JS/CSS) into a WXT-based factory clone. Auto-detects popup/options/sidepanel/welcome/background/content profiles from the manifest, auto-detects whether React or Tailwind is actually in use (default-off for pure vanilla), scaffolds the factory skeleton at a sibling directory, moves vanilla files into the WXT entrypoint layout, wraps background/content scripts, translates manifest fields into wxt.config.ts, and runs `npm install` + `wxt prepare` + `npm run check:cws` to leave a structurally-green extension ready for the rest of CCE's skill pipeline. Use when the user says things like "convert my extension to WXT", "import this vanilla extension", "migrate to the factory", "I have an existing extension I want to use with CCE", or "/cce-import".
triggers:
  - "convert my extension to WXT"
  - "import this vanilla extension"
  - "migrate my extension to the factory"
  - "adopt this existing extension into CCE"
  - "I have a vanilla MV3 extension I want to use with the factory"
  - "turn this into a WXT extension"
  - "bring my extension into the factory"
  - "/cce-import"
invokes:
  - "npx tsx scripts/import-vanilla.ts"                # the actual converter
  - "npm install"                                      # run by the script inside the target dir
  - "npx wxt prepare"                                  # run by the script inside the target dir
  - "npm run check:cws"                                # run by the script inside the target dir
  - "cws-content"                                      # delegate after import to fill welcome + listing copy
  - "cws-screens"                                      # optional post-import delegation
writes:
  - "<target-dir>/"                                    # new sibling WXT-layout dir (default <source>-wxt)
---

# cce-import skill

You are driving the `cce-import` skill. Your single responsibility is to take the user from **"I have a vanilla MV3 extension sitting at some path"** to **"a new WXT-layout sibling directory that boots, validates structural-green, and is ready for the rest of the factory's skills."**

You do NOT rewrite the user's application logic. You do NOT swap `chrome.*` for `browser.*`. You do NOT regenerate icons or screenshots. You DO:

- Locate the vanilla source dir and verify it's MV3.
- Run the importer in dry-run mode first, show the plan, ask for confirmation.
- Surface CSP warnings (inline handlers, inline `<script>`) — user must either fix or pass `--force`.
- Execute the import, which also runs `npm install` + `wxt prepare` + `check:cws`.
- Hand off to `/cws-content` for welcome-page copy and any listing polish.

## Phase 0 — Locate the factory

Before anything else, confirm you're running inside a CCE factory clone: `wxt.config.ts` at repo root AND `scripts/import-vanilla.ts` exists. If not, tell the user to `cd` into a factory clone (or run `npx create-chrome-extension` to scaffold one) and stop.

## Phase 1 — Source input

Ask the user for the path to their vanilla extension dir. Accept absolute or relative. Verify:

- Directory exists.
- `manifest.json` exists inside it.
- `manifest_version: 3`. If MV2, stop and link: https://developer.chrome.com/docs/extensions/develop/migrate

## Phase 2 — Dry-run inspection

Run:

```bash
npx tsx scripts/import-vanilla.ts <source-path> --dry-run --json
```

Parse the envelope (`schemaVersion: 1`, `kind: 'import-vanilla'`). Surface to the user, in this order:

1. **Detected profile** — which entrypoints the manifest uses. E.g. `[popup, options, sidepanel, welcome, background]`.
2. **Stack detection** — did the importer find React imports? Tailwind `@tailwind`? If both are `false`, confirm "your extension is pure vanilla — I'll scaffold without React/Tailwind to keep it minimal."
3. **Planned moves** — count + first ~10 examples. Full list available in `plannedMoves[]`.
4. **Manifest translations** — count. Fields translate to `wxt.config.ts > manifest.*`.
5. **Warnings** — if any. Group by rule:
   - `csp-inline-handler` / `csp-inline-script` → **blocking** unless `--force`. Walk the user through each line; suggest `addEventListener` refactor.
   - `broad-host-permission` → move to `optional_host_permissions` per factory best practices.
   - `unsupported-field-stub` → rare manifest fields (externally_connectable, devtools_page, etc.) get copied literally; user may need to hand-wire the entrypoint.
6. **Skipped dev artifacts** — e.g. `.zip`, `.map`, `.log` in source root get ignored.
7. **Target path** — default is `<source>-wxt` sibling; user can override.

## Phase 3 — Stack confirmation

If auto-detection differs from what the user wants, offer flags:

- `--react` / `--no-react` — override React detection
- `--tailwind` / `--no-tailwind` — override Tailwind detection

Typical case for a genuine vanilla ext: both default to `--no-react --no-tailwind`, leaving a minimal WXT dir with zero framework deps.

## Phase 4 — Target confirmation

Default: `<source>-wxt` sibling dir. Alternatives:

- `--out <path>` — explicit target.
- `--in-place` — overlay into source dir. **Destructive.** Refuses if git dirty or `.output/` exists. Offer only if user explicitly asks.

## Phase 5 — Warnings triage

Walk blocking CSP warnings line by line:

- **Inline handler** (`onclick="save()"`): show the refactor: move `save` to a `<script>` block in a JS file, call `document.getElementById('btn').addEventListener('click', save)`.
- **Inline `<script>`**: move contents to an external JS file, reference via `<script src="./foo.js">`.

User has three choices:
1. Fix the source, re-run `/cce-import`.
2. Pass `--force` — import proceeds but extension will fail at Chrome load until user fixes.
3. Abort.

Non-blocking warnings (broad hosts, stub fields) surface but don't gate execution.

## Phase 6 — Execute

Re-run the importer without `--dry-run`, with any user-confirmed flags:

```bash
npx tsx scripts/import-vanilla.ts <source-path> [--out <path>] [--react|--no-react] [--tailwind|--no-tailwind] [--force]
```

The script itself runs `npm install`, `npx wxt prepare`, and `npm run check:cws` inside the target dir. Watch the output stream. If any post-scaffold step fails, exit code is 3 — target dir still exists for the user to inspect.

## Phase 7 — Post-import delegation

Once structural green:

1. **Welcome config** — the importer wrote a stub `entrypoints/welcome/config.ts` with the description from manifest but placeholder everything else. Delegate to `/cws-content` to fill properly (activation surfaces, permission steps with justifications, repo/issues/privacy links). Running `check:cws:ship` will flag `ship-ready-welcome-config` until this is done.
2. **Listing copy** — `cws-content` also polishes `manifest.name` / `manifest.description` for CWS-worthy length & tone. The importer copied the raw values; they may be fine or may need tightening.
3. **Screenshots** — offer `/cws-screens` if the user wants the screenshot pipeline.
4. **Dev loop** — `cd <target> && npm run dev` auto-opens Chrome with the extension loaded. User should manually click through popup/sidepanel/options to confirm behavior matches the vanilla version.

## Phase 8 — External reminders

The importer doesn't touch anything outside the source → target mapping. Remind the user:

- **Git remote** — target dir is not a git repo yet. `cd <target> && git init && git add -A && git commit -m "Import from vanilla" && gh repo create <name> --public --push`.
- **CWS listing** — if the vanilla extension is already published on the Chrome Web Store, the listing is unchanged until they upload a new zip. Run `/cws-ship` when ready.
- **Privacy policy** — if the vanilla ext had a privacy policy URL anywhere, confirm it's still referenced correctly (currently only appears in `entrypoints/welcome/config.ts > links.privacy`).
- **Icons** — if the importer used `assets/icon.svg` (SVG path), WXT regenerates PNGs at build. If it used the PNG fallback (no SVG source), PNGs live at `public/icons/` and WXT ships them as-is. Confirm either way.

## Edge cases

- **MV2 input** → refuse, link migration doc. Don't attempt partial import.
- **No `manifest.json` at source** → refuse. Don't guess.
- **Target dir already exists** → refuse. User must delete or pick `--out <different-path>`.
- **Non-standard entrypoints** (HTML files loaded via `chrome.windows.create` but not referenced in manifest) → the script copies them as-is into `entrypoints/<name>.html` flat (WXT unlisted page convention). Tell the user and confirm the runtime-load paths still work post-build.
- **Shared CSS across entrypoints** (e.g. `tokens.css` referenced by both popup and sidepanel) → script hoists to `public/` and rewrites HTML link hrefs to absolute paths (`/tokens.css`). Works at extension runtime.
- **Source is already partially WXT-like** (has `wxt.config.ts`) → likely a false alarm; ask user if they meant `/cce-init` instead.
- **Source uses Webpack/Vite already** → script doesn't detect this. Warn user the existing build output (`dist/`) will be copied as files; they should delete those first or pass a cleaner source dir.

## Done criteria

- Target dir exists at the confirmed path.
- `wxt.config.ts` has `manifest:{}` populated from the vanilla manifest.
- `entrypoints/` contains only the entrypoints the vanilla ext actually used.
- `package.json > version` matches the vanilla `manifest.version`.
- `npm run check:cws` passes structural (script ran it; exit 0).
- User has the next-steps checklist (`/cws-content`, `npm run dev`, etc.).
