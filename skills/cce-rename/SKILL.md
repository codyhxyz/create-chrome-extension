---
name: cce-rename
description: Rename a Chrome Extension Factory project — change the display name, slug, description, and (optionally) the parent folder in one pass. Updates wxt.config.ts, package.json, marketing/og.config.mjs, and per-entrypoint configs (welcome/screenshots/video), then lists prose files (README, CHANGELOG, etc.) that still mention the old name for manual follow-up. Idempotent; supports dry-run. Use when the user says things like "rename this extension", "change the extension name", "rebrand", "I renamed the project", or "/cce-rename".
triggers:
  - "rename this extension"
  - "rename the extension"
  - "change the extension name"
  - "change the name"
  - "rebrand"
  - "I renamed the project"
  - "update the extension name everywhere"
  - "I want to call it something else"
  - "/cce-rename"
invokes:
  - "npx tsx scripts/rename.ts"                        # the actual rewriter
  - "npm run check:cws"                                # confirm structural green after
writes:
  - "wxt.config.ts"                                    # manifest.name, optionally manifest.description
  - "package.json"                                     # "name" (slug), only if slug changed
  - "marketing/og.config.mjs"                          # top-level `name:` field
  - "entrypoints/welcome/config.ts"                    # `appName` if the field is present
  - "screenshots/config.ts"                            # `appName` if the field is present
  - "video/config.ts"                                  # `appName` if the field is present
---

# cce-rename skill

You are driving the `cce-rename` skill. Your single responsibility is to take the user from **"I've decided on a new name for this extension"** to **"every config file reflects it, and I have a checklist of the prose files I still need to hand-edit."**

You do NOT rewrite prose. You do NOT submit. You do NOT regenerate screenshots or video. You DO:

- Gather the new display name, slug, and (optionally) description from the user.
- Run `scripts/rename.ts` with `--dry-run --json` FIRST to show the user the plan.
- On user approval, re-run without `--dry-run`.
- Surface the prose-hit report so the user can update human-facing copy.
- Re-run `npm run check:cws` to confirm nothing broke.

## Phase 0 — Locate the factory

A factory repo has BOTH:

- `wxt.config.ts` at the repo root
- `scripts/rename.ts` (i.e., a factory new enough to have this skill)

If either is missing, tell the user and stop. Don't clone or scaffold.

## Phase 1 — Gather the new identity

Ask, in one message:

1. **New display name** — what shows in the Chrome Web Store, the Chrome toolbar, and the install prompt. Title Case. 4–45 chars.
2. **New slug** (optional) — kebab-case, used for `package.json > name` and the folder name. If the user omits it, the script auto-derives from the display name (`"Webpage Summarizer"` → `webpage-summarizer`).
3. **New description** (optional) — if the user wants to update `manifest.description` in the same pass. Otherwise leave alone.
4. **Rename the parent folder on disk?** — off by default. Ask explicitly. If yes, the script does `mv $ROOT $PARENT/$NEW_SLUG` at the end.

## Phase 2 — Dry-run the plan

Run:

```bash
npx tsx scripts/rename.ts "<New Display Name>" \
  --slug <new-slug> \
  --description "<new description>" \
  --dry-run --json
```

Omit the flags the user didn't supply. Parse the envelope:

```json
{
  "schemaVersion": 1,
  "kind": "rename",
  "dryRun": true,
  "oldName": "...",
  "newName": "...",
  "oldSlug": "...",
  "newSlug": "...",
  "edits": [{ "file": "...", "before": "...", "after": "..." }],
  "proseHits": [{ "file": "...", "line": 42, "text": "...", "match": "..." }],
  "warnings": []
}
```

Show the user:

- The file edits that will land.
- Count of prose hits, grouped by file.
- Any warnings (e.g., "nothing to change").

Ask: **"Apply?"**

## Phase 3 — Apply

On yes, re-run without `--dry-run` and without `--json` (so the user gets human output):

```bash
npx tsx scripts/rename.ts "<New Display Name>" \
  --slug <new-slug> \
  --description "<new description>"
```

Add `--rename-dir` if the user opted into folder rename.

If the git working tree is dirty, the script bails with exit 1. Tell the user to commit or stash, or pass `--force` (only if they understand the risk).

## Phase 4 — Prose follow-up

The script prints a per-file list of lines that still reference the old display name or slug. Walk the user through them file by file if they want; most are one-line README titles, CHANGELOG entries, or doc references. A few judgment calls to surface:

- `CHANGELOG.md` — historical entries should usually keep the old name (that's what was released). New entries use the new name.
- `docs/` — references inside skills/scripts usually need updating.
- `README.md` — H1 title, intro paragraph, install instructions.

## Phase 5 — Re-validate

Run:

```bash
npm run check:cws
```

Structural green means no regressions. If the user plans to ship immediately, also run `npm run check:cws:ship` — a rename usually doesn't break ship-readiness, but `listing-ready-name` now checks against the new name, so re-confirm.

## Phase 6 — Remind about external surfaces

The script only touches files in the repo. Rename does NOT update:

- The Chrome Web Store listing (edit in CWS admin, or re-run `/cws-content`).
- Git remote / GitHub repo name (`gh repo rename <new-slug>` if they want).
- The OG card (`marketing/og.config.mjs` got updated, but re-render with the og-card skill to regenerate `assets/og.png`).
- Published npm package name, if any.
- Privacy-policy page URLs, if hard-coded anywhere outside `wxt.config.ts`.

List whichever apply to the user's extension, then stop.

## Edge cases

- **User invokes `/cce-rename` with no new name given.** Ask for it; don't guess.
- **Slug collides with sibling folder.** Script prints a warning and skips the dir rename. File edits still apply.
- **`entrypoints/welcome/config.ts` doesn't exist yet.** Script skips it silently; user's profile doesn't use a welcome page.
- **Repo isn't a git repo.** Script skips the dirty-tree check. Proceed.
- **User wants to undo.** `git checkout -- .` reverts file edits. The dir rename is reversible with `mv` by hand (print the inverse command).

## Done criteria

`check:cws` is green, `git diff` shows only the expected renames, and the user has acknowledged the prose follow-up list.
