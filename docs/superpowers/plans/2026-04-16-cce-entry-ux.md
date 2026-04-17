# CCE Entry UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land one-liner scaffold entry (`npx create-chrome-extension my-thing`) plus a pitch-driven `/cce-init` skill that replaces the existing menu-driven `/cws-init`.

**Architecture:** Monorepo. Root repo is the factory template (WXT + React + skills). A new `packages/cli/` subpackage publishes the `create-chrome-extension` npm binary that clones the repo, installs deps, installs the skill, and prints a handoff banner. The `/cws-init` skill is renamed to `/cce-init` and expanded: pitch-first interview, bespoke code generation, detect+clone for non-factory directories.

**Tech Stack:** Node 20+, tsx, Claude Code skills, npm workspaces. CLI uses zero runtime deps where possible; tests are tsx scripts (same pattern as `scripts/__tests__/validator-snapshot.ts`).

**Spec:** `docs/superpowers/specs/2026-04-16-cce-entry-ux-design.md`

---

## File structure

**Renamed:**
- `skills/cws-init/` → `skills/cce-init/`
- `skills/cws-init/SKILL.md` → `skills/cce-init/SKILL.md` (with substantial edits — see tasks 6–9)

**New:**
- `packages/cli/package.json` — publishable CLI package manifest (name: `create-chrome-extension`)
- `packages/cli/bin/cli.mjs` — CLI entry point (~80 LOC, zero deps)
- `packages/cli/README.md` — user-facing install/usage docs
- `packages/cli/__tests__/cli.test.mjs` — end-to-end test that spawns the CLI against a temp dir

**Modified:**
- `package.json` (root) — rename to `cce-factory`, add `workspaces: ["packages/*"]`
- `README.md` — replace Quick Start with one-liner
- `CLAUDE.md` — update skill references (`/cws-init` → `/cce-init`)
- `skills/README.md` — rename reference
- Cross-skill references in `skills/cws-content/SKILL.md`, `skills/cws-screens/SKILL.md`, `skills/cws-video/SKILL.md`, `skills/cws-ship/SKILL.md` — any mention of `/cws-init`

**Deleted:** None. This spec is purely additive + renames.

---

## Tasks

### Task 1: Rename skill directory + update internal references

**Files:**
- Rename: `skills/cws-init/` → `skills/cce-init/`
- Modify: `skills/cce-init/SKILL.md` (change `name: cws-init` → `name: cce-init`, swap `/cws-init` occurrences to `/cce-init` in triggers + body)
- Modify: `skills/README.md` (rename references)
- Modify: `CLAUDE.md` (rename references)

- [ ] **Step 1: Git-move the skill directory**

```bash
git mv skills/cws-init skills/cce-init
```

- [ ] **Step 2: Update the skill's `name` frontmatter**

Edit `skills/cce-init/SKILL.md` line 2 — change `name: cws-init` to `name: cce-init`.

- [ ] **Step 3: Replace `/cws-init` with `/cce-init` in skill body**

In `skills/cce-init/SKILL.md`, use Edit with `replace_all: true`:
- `old_string`: `/cws-init`
- `new_string`: `/cce-init`

Also replace `cws-init` (unprefixed) → `cce-init` in the same file. Preview each occurrence to ensure you're not corrupting directory paths — the word `cws-init` should only appear as skill name references.

- [ ] **Step 4: Update cross-skill references**

Run: `grep -rn "cws-init" skills/ CLAUDE.md README.md`

For each hit, replace `cws-init` → `cce-init` and `/cws-init` → `/cce-init`. Leave `cws-content`, `cws-screens`, `cws-ship`, `cws-video` untouched — those are different skills.

- [ ] **Step 5: Verify no stale references**

Run: `grep -rn "cws-init" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.output --exclude-dir=.wxt --exclude-dir=sources`

Expected: zero results.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Rename cws-init skill to cce-init"
```

---

### Task 2: Rename root package, add workspaces

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Rename root package**

Edit `package.json` line ~2 — change `"name": "create-chrome-extension"` to `"name": "cce-factory"`.

- [ ] **Step 2: Add workspaces field**

Add to root `package.json` (after `"private": true`):

```json
  "workspaces": [
    "packages/*"
  ],
```

- [ ] **Step 3: Verify nothing broke**

Run: `npm install` then `npm run compile`.

Expected: install succeeds, compile passes. (There are no `packages/*` yet, so workspaces is a no-op.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Rename root package to cce-factory, enable workspaces"
```

---

### Task 3: Scaffold `packages/cli` with failing end-to-end test

**Files:**
- Create: `packages/cli/package.json`
- Create: `packages/cli/__tests__/cli.test.mjs`
- Create: `packages/cli/bin/cli.mjs` (empty placeholder)
- Create: `packages/cli/README.md`

- [ ] **Step 1: Create the CLI package manifest**

Write `packages/cli/package.json`:

```json
{
  "name": "create-chrome-extension",
  "version": "0.1.0",
  "description": "Scaffold a Chrome extension factory project in one command.",
  "type": "module",
  "bin": {
    "create-chrome-extension": "./bin/cli.mjs"
  },
  "files": [
    "bin"
  ],
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "test": "node __tests__/cli.test.mjs"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create empty CLI placeholder**

Write `packages/cli/bin/cli.mjs`:

```javascript
#!/usr/bin/env node
// Placeholder. Implementation lands in Task 4.
process.exit(1);
```

Make it executable:

```bash
chmod +x packages/cli/bin/cli.mjs
```

- [ ] **Step 3: Write the failing end-to-end test**

Write `packages/cli/__tests__/cli.test.mjs`:

```javascript
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const CLI = new URL('../bin/cli.mjs', import.meta.url).pathname;

function run(args, cwd) {
  return spawnSync('node', [CLI, ...args], { cwd, encoding: 'utf8' });
}

function withTempDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'cce-cli-test-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Test 1: No args prints usage and exits non-zero
{
  const r = run([], process.cwd());
  assert.notEqual(r.status, 0, 'no-args should fail');
  assert.match(r.stderr + r.stdout, /Usage:/, 'should print usage');
  console.log('PASS: no-args usage');
}

// Test 2: --help prints usage and exits 0
{
  const r = run(['--help'], process.cwd());
  assert.equal(r.status, 0, '--help should exit 0');
  assert.match(r.stdout, /Usage:/, 'should print usage');
  console.log('PASS: --help');
}

// Test 3: `<name>` clones + installs + prints handoff banner
withTempDir((dir) => {
  const r = run(['demo-app', '--skip-install', '--skip-skill'], dir);
  assert.equal(r.status, 0, `clone should succeed. stderr: ${r.stderr}`);
  const projectDir = join(dir, 'demo-app');
  assert.ok(existsSync(projectDir), 'project dir created');
  assert.ok(existsSync(join(projectDir, 'package.json')), 'factory package.json present');
  assert.ok(existsSync(join(projectDir, 'wxt.config.ts')), 'wxt.config.ts present');
  assert.match(r.stdout, /cce-init/, 'banner mentions /cce-init');
  console.log('PASS: clone + banner');
});

console.log('\nAll CLI tests passed.');
```

- [ ] **Step 4: Run the test — verify it fails**

Run: `node packages/cli/__tests__/cli.test.mjs`

Expected: FAIL. The placeholder CLI exits 1 on no args, but tests 2 and 3 will fail (no `--help` support, no clone logic).

- [ ] **Step 5: Create `packages/cli/README.md`**

```markdown
# create-chrome-extension

Scaffold a [Chrome Extension Factory](https://github.com/<your-org>/cce-factory) project in one command.

## Usage

```bash
npx create-chrome-extension my-extension
cd my-extension
# Open in Claude Code and run /cce-init
```

## What it does

1. Clones the factory template into `./my-extension/`
2. Runs `npm install`
3. Installs the `/cce-init` skill into Claude Code (if available)
4. Prints next-step instructions

## Flags

- `--skip-install` — skip `npm install`
- `--skip-skill` — skip the `npx skills add` step
- `--help` — print usage

## Requirements

- Node >= 20
- git
```

- [ ] **Step 6: Commit**

```bash
git add packages/cli/
git commit -m "Scaffold packages/cli with failing end-to-end test"
```

---

### Task 4: Implement CLI (clone + install + skill-add + banner)

**Files:**
- Modify: `packages/cli/bin/cli.mjs`

- [ ] **Step 1: Replace the placeholder with the real CLI**

Write `packages/cli/bin/cli.mjs` (replacing the placeholder from Task 3):

```javascript
#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_URL = process.env.CCE_REPO_URL || 'https://github.com/your-org/cce-factory.git';

function usage() {
  console.log(`Usage: create-chrome-extension <project-name> [flags]

Clone the Chrome Extension Factory into ./<project-name>/, install deps,
and register the /cce-init skill in Claude Code.

Flags:
  --skip-install   Skip "npm install"
  --skip-skill     Skip "npx skills add"
  --help           Show this message

After the scaffold finishes, open the project in Claude Code and run /cce-init.`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (r.status !== 0) {
    console.error(`\nCommand failed: ${cmd} ${args.join(' ')}`);
    process.exit(r.status ?? 1);
  }
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  const positional = argv.filter((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));

  if (positional.length !== 1) {
    console.error('Error: exactly one project name required.\n');
    usage();
    process.exit(1);
  }

  const name = positional[0];
  const target = resolve(process.cwd(), name);

  if (existsSync(target)) {
    console.error(`Error: ${target} already exists. Pick a different name or remove it.`);
    process.exit(1);
  }

  console.log(`Cloning factory into ${target}...`);
  run('git', ['clone', '--depth', '1', REPO_URL, target]);
  run('rm', ['-rf', resolve(target, '.git')]);
  run('git', ['init', '--quiet'], { cwd: target });

  if (!flags.has('--skip-install')) {
    console.log('\nInstalling dependencies...');
    run('npm', ['install'], { cwd: target });
  } else {
    console.log('\nSkipped npm install (--skip-install).');
  }

  if (!flags.has('--skip-skill')) {
    console.log('\nInstalling /cce-init skill into Claude Code...');
    const r = spawnSync('npx', ['skills', 'add', REPO_URL], { stdio: 'inherit' });
    if (r.status !== 0) {
      console.log('(Skill install skipped — run `npx skills add <repo>` manually if you use Claude Code.)');
    }
  } else {
    console.log('\nSkipped skill install (--skip-skill).');
  }

  console.log(`
Done. Next steps:

  cd ${name}
  npm run dev        # start dev server
  Open in Claude Code and run:  /cce-init

The /cce-init skill asks about your extension, strips the factory to match,
and generates tailored first-run code.
`);
}

main(process.argv.slice(2));
```

- [ ] **Step 2: Run the test — verify it passes**

Run: `node packages/cli/__tests__/cli.test.mjs`

Expected: PASS all 3 tests. If the clone test fails because `REPO_URL` points at a non-existent repo, set `CCE_REPO_URL` to the absolute path of this checkout before running:

```bash
CCE_REPO_URL="$(pwd)" node packages/cli/__tests__/cli.test.mjs
```

- [ ] **Step 3: Wire up `CCE_REPO_URL` fallback in the test**

Edit `packages/cli/__tests__/cli.test.mjs` — before the `run` helper, add:

```javascript
process.env.CCE_REPO_URL = process.env.CCE_REPO_URL || join(process.cwd(), '..', '..');
```

Adjust the path so `CCE_REPO_URL` points at the factory repo root regardless of where the test is invoked from. Re-run: `node packages/cli/__tests__/cli.test.mjs`. All 3 tests should pass.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/bin/cli.mjs packages/cli/__tests__/cli.test.mjs
git commit -m "Implement create-chrome-extension CLI"
```

---

### Task 5: Add test script to root package, wire into check suite

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Add CLI test script**

In root `package.json`, add to `scripts`:

```json
    "test:cli": "node packages/cli/__tests__/cli.test.mjs",
```

- [ ] **Step 2: Run it from the root**

Run: `npm run test:cli`

Expected: PASS all 3 CLI tests.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Add test:cli script to root package"
```

---

### Task 6: Skill Phase 0 — detect + clone

**Files:**
- Modify: `skills/cce-init/SKILL.md`

The existing skill assumes it's already inside a factory repo. Add a new **Phase 0** ahead of Phase A that handles the "invoked in a non-factory directory" case.

- [ ] **Step 1: Insert Phase 0 after the skill body opener**

Find the line in `skills/cce-init/SKILL.md` that reads `## Phase A — Detect state` and insert this block immediately before it:

```markdown
## Phase 0 — Locate the factory

Before anything else, figure out whether the current working directory IS a factory repo. A factory repo has BOTH of:

- `wxt.config.ts` at the repo root
- `scripts/validate-cws.ts`

**If both present:** you're in a factory. Proceed to Phase A.

**If either is missing:** the user invoked `/cce-init` outside a factory. Offer to clone:

> This directory isn't a Chrome Extension Factory. Want me to clone one?
>
> 1. Clone into a new subdirectory of the current working directory (recommended). Ask for a name.
> 2. Clone into an existing empty directory. Ask for the path.
> 3. Cancel — I'll exit and the user can run `npx create-chrome-extension <name>` themselves.

On choice 1: ask for the name, then run `git clone --depth 1 <factory-repo-url> ./<name>` + `rm -rf ./<name>/.git` + `git init ./<name>` + `cd ./<name>` (the skill's working directory; use the Bash tool's `cwd` semantics). Then run `npm install`. Then proceed to Phase A from the new directory.

On choice 2: validate the target is empty; same sequence.

On choice 3: exit cleanly with instructions:

> Run `npx create-chrome-extension <name>` to scaffold the factory, then re-invoke `/cce-init` inside the new directory.

The factory repo URL is fixed — use the canonical URL documented in `packages/cli/bin/cli.mjs` (`REPO_URL`). Do not invent a different URL.
```

- [ ] **Step 2: Smoke-check the edit**

Read the top of `skills/cce-init/SKILL.md` — confirm Phase 0 appears before Phase A and the section anchors are intact.

- [ ] **Step 3: Commit**

```bash
git add skills/cce-init/SKILL.md
git commit -m "cce-init: add Phase 0 for detect+clone"
```

---

### Task 7: Skill Phase C — pitch-driven profile selection

**Files:**
- Modify: `skills/cce-init/SKILL.md`

Current Phase C presents a 4-profile menu and asks the user to pick. New Phase C: open-ended pitch first, Claude recommends a profile from the pitch, user confirms.

- [ ] **Step 1: Replace Phase C's opening**

Find in `skills/cce-init/SKILL.md`:

```markdown
## Phase C — Profile selection

Present the 4 shapes from `docs/01-extension-type-profiles.md`. Ask the user which fits. Show the delete list for each one up front so the tradeoffs are explicit:

> What's the shape of your extension? Pick one:
```

Replace it with:

```markdown
## Phase C — Profile selection (pitch-driven)

Ask the user for their pitch first. Open-ended, not a menu:

> In one or two sentences — what are you building?

Read the pitch. Based on it, **recommend** one of the 4 profiles from `docs/01-extension-type-profiles.md`. Use these heuristics:

- "page enhancer / injector / modifier / block / highlight / modify the DOM" → **content-script-only**
- "quick action from the toolbar / popup / click the icon to ___" → **popup-based**
- "persistent panel / research / reference / chat with a page" → **sidepanel**
- "everything / I need it all / let me decide later" → **full hybrid**

Present the recommendation with a clear exit:

> Sounds like **<profile name>** fits best: <one-sentence why>. That means I'll delete:
>
> <exact delete list from the profile-strip semantics below>
>
> Does that match? (yes / show the other options / keep everything)

On "yes": proceed to the welcome follow-up (below) and then profile-strip semantics.

On "show the other options": present the 4-option menu from the previous version of this skill (keep that fallback) and let the user pick.

On "keep everything": treat as full-hybrid (profile 4, no deletions).
```

- [ ] **Step 2: Preserve the menu fallback**

The existing 4-option menu block (starting `> What's the shape of your extension?`) should be kept further down as the fallback. Move it under a new subsection heading within Phase C: `### Fallback: menu selection`. Add a one-line intro: `If the user asks to see the options, show this menu verbatim:`.

- [ ] **Step 3: Commit**

```bash
git add skills/cce-init/SKILL.md
git commit -m "cce-init: pitch-driven profile selection in Phase C"
```

---

### Task 8: Skill Phase C2 — bespoke code generation

**Files:**
- Modify: `skills/cce-init/SKILL.md`

After profile-strip (Phase C), current skill goes straight to Phase D (delegate to `cws-content` for listing copy). Insert a new **Phase C2** between them: generate bespoke first-run code from the pitch.

- [ ] **Step 1: Insert Phase C2**

Find the line in `skills/cce-init/SKILL.md`:

```markdown
---

## Phase D — Listing content
```

Insert this block immediately before it:

```markdown
---

## Phase C2 — Bespoke first-run code

The kept entrypoints still contain factory templates (generic hello-world popups, placeholder content-script DOM hooks). Now tailor them to the user's pitch so the first `npm run dev` shows something resembling their idea, not a stock demo.

**Scope:** only the entrypoint files that were kept. Do NOT touch `utils/`, `scripts/`, `wxt.config.ts` (already handled in Phase C), or any test file.

**What "bespoke" means, per kept entrypoint:**

- `entrypoints/content.ts` — replace the demo DOM-manipulation with a skeleton that matches the pitch. If the user said "highlight headlines on news sites," write a `queryAllDeep('h1, h2, h3')` loop with a `background: yellow` application. If they said "block tracker scripts," write a `MutationObserver` that looks for `<script src="...">` and removes matches. Do not leave `console.log('hello')` placeholders.
- `entrypoints/popup/App.tsx` — replace the demo counter with the minimal UI implied by the pitch. "Save the tab to a list" → a button + a list component reading from `chrome.storage.local`. "Translate selected text" → a textarea + a button + a result div. Keep it short (~50 LOC), functional, and compile-clean.
- `entrypoints/sidepanel/App.tsx` — same as popup, but laid out for a taller persistent panel.
- `entrypoints/background.ts` — if the pitch implies message-passing or storage, wire the minimal handler. Keep the factory's typed-messaging pattern (`@webext-core/messaging`).
- `entrypoints/options/App.tsx` — leave as a minimal settings stub unless the pitch explicitly calls for settings (e.g., "let users configure which sites to run on").

**Do not** fabricate features the user didn't ask for. Do not add auth, analytics, or third-party integrations unless they came up in the interview.

**After writing bespoke code, run `npm run check:cws`.** It must stay green. If it goes red, most likely you imported a browser global incorrectly or referenced a deleted util — fix before moving on.

**If the pitch is too vague to generate real code** (e.g., "I'll figure it out later"): skip this phase. Leave the factory templates in place. Tell the user:

> Leaving the factory templates in `entrypoints/` — you can flesh them out once you know what you're building. Moving on to listing content.
```

- [ ] **Step 2: Update the skill frontmatter `writes` list**

At the top of `skills/cce-init/SKILL.md`, the `writes:` list currently mentions `entrypoints/` only for deletion. Add:

```yaml
  - "entrypoints/*/App.tsx"                            # bespoke UI skeletons in Phase C2
  - "entrypoints/content.ts"                           # bespoke DOM hook in Phase C2
  - "entrypoints/background.ts"                        # bespoke message/storage wiring in Phase C2
```

- [ ] **Step 3: Commit**

```bash
git add skills/cce-init/SKILL.md
git commit -m "cce-init: add Phase C2 for bespoke code generation"
```

---

### Task 9: Skill — front-load the interview

**Files:**
- Modify: `skills/cce-init/SKILL.md`

Current skill interleaves: ask profile → strip → delegate to cws-content (which asks name/description) → delegate to cws-screens → etc. Front-loaded variant: collect every answer up front in a single Phase B2 interview, then phases C/C2/D/E/F execute in one burst.

- [ ] **Step 1: Insert Phase B2 after Phase B**

Find the line `## Phase C — Profile selection (pitch-driven)` and insert this block immediately before it:

```markdown
---

## Phase B2 — Front-loaded interview

Collect every answer needed for Phases C, C2, D, E, E2, F in one pass. No scaffolding, no deletions, no delegation yet — just questions.

Ask in this order, one at a time (wait for each answer before the next):

1. **Pitch** — "In one or two sentences, what are you building?" (feeds Phase C recommendation + Phase C2 bespoke code)
2. **Target sites** — "What URLs will this run on? Be specific (e.g., `https://news.ycombinator.com/*`) or say 'no host access needed' if you're only using `activeTab`." (feeds Phase C welcome-page decision + `wxt.config.ts` permissions)
3. **Welcome page** — inferred from (2): if host access needed, keep welcome; if not, ask "delete the welcome page?" and default to yes.
4. **Features** — ask once, comma-separated: "Any of: auth / persistent storage / keyboard shortcuts / background alarms / none?"
5. **Listing basics** — "What's the extension's public name? (3–45 chars)" and "One-line tagline? (used as the CWS summary)"
6. **Screenshots** — "Scaffold 5 CWS screenshots now, or defer? (now / defer)"
7. **Video** — "Scaffold a launch video now, or defer? (now / defer)"
8. **OAuth** — "Set up automated publishing credentials now, or defer? (now / defer)"

After the user answers all 8, show a one-screen summary of what's about to happen:

> Here's the plan:
>
> - Profile: <picked>
> - Deletes: <list>
> - Bespoke code in: <kept entrypoints>
> - Listing: name "<name>", tagline "<tagline>"
> - Screenshots: <now | defer>
> - Video: <now | defer>
> - OAuth: <now | defer>
>
> Run the plan? (yes / change something / cancel)

On "yes": execute Phases C → C2 → D → E → E2 → F in order without re-interviewing.

On "change something": ask which answer to revise, update it, re-show the summary.

On "cancel": exit cleanly, no changes.

**Important:** when delegating to `cws-content`, `cws-screens`, `cws-video` in later phases, pass the answers already collected here as context so those skills don't re-ask. If a sub-skill insists on re-interviewing, accept it — don't fight it — but prefer skills that accept pre-filled answers.
```

- [ ] **Step 2: Update Phase C opening to reference pre-collected answers**

In Phase C, change the opening from `Ask the user for their pitch first.` to:

```markdown
Use the pitch already collected in Phase B2. If for any reason it's missing (skill was invoked directly into Phase C), ask now.
```

Make parallel changes in Phases D/E/E2/F: each should reference the Phase B2 answers first and only re-ask if missing.

- [ ] **Step 3: Commit**

```bash
git add skills/cce-init/SKILL.md
git commit -m "cce-init: front-load interview into Phase B2"
```

---

### Task 10: Update README.md one-liner

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Quick Start section**

Find in `README.md`:

```markdown
## Quick Start

```bash
git clone <this-repo> my-extension
cd my-extension
npm install
npm run dev   # opens Chrome with extension loaded
```
```

Replace with:

```markdown
## Quick Start

```bash
npx create-chrome-extension my-extension
cd my-extension
# Open in Claude Code, run /cce-init
```

Or install the skill directly into Claude Code and let it clone:

```bash
npx skills add <your-org>/cce-factory
# Then in Claude Code: /cce-init
```

Or clone manually:

```bash
git clone <this-repo> my-extension
cd my-extension
npm install
npm run dev
```
```

- [ ] **Step 2: Update the intro line**

Find `> **First time here?** After cloning and running \`npm install\`, invoke **\`/cws-init\`** in Claude Code.`

Replace with:

```markdown
> **First time here?** Run `npx create-chrome-extension my-thing` (or clone + `/cce-init`). The skill walks you through a pitch-driven interview and scaffolds tailored code — see [ARCHITECTURE.md](ARCHITECTURE.md) for the design philosophy.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "README: lead with npx create-chrome-extension one-liner"
```

---

### Task 11: Verify `npx skills add` layout compatibility

**Files:** (no writes — verification only)

- [ ] **Step 1: Inspect hyperframes' skill layout for reference**

Run: `gh api repos/heygen-com/hyperframes/contents/skills 2>&1 | head -60`

Note the directory structure. Compare to our `skills/cce-init/SKILL.md`.

- [ ] **Step 2: Check the `skills add` convention**

Run: `npx skills --help` (if available) or search docs for the expected layout.

Confirm either:
- (a) `skills/<name>/SKILL.md` is the expected layout → no changes needed, or
- (b) A different layout is expected → open a new task to reshape

- [ ] **Step 3: If layout mismatch, document**

If `npx skills add` needs a different layout, don't restructure silently — add a TODO to this plan noting the mismatch and open a discussion. The skill content is correct; the packaging is the question.

- [ ] **Step 4: Smoke-test if feasible**

If `npx skills add <this-repo>` is runnable locally, try it. Confirm `/cce-init` appears in Claude Code's skill list after install.

- [ ] **Step 5: Commit any findings**

If you needed to adjust layout, commit with a message explaining the shape change. If no changes were needed, no commit.

---

### Task 12: End-to-end smoke test

**Files:** (no writes — verification only)

- [ ] **Step 1: Scaffold a clean project via the CLI**

```bash
cd /tmp
CCE_REPO_URL=/Users/codyhergenroeder/code/claude/create-chrome-extension npx /Users/codyhergenroeder/code/claude/create-chrome-extension/packages/cli demo-e2e
```

Expected: project exists at `/tmp/demo-e2e/`, deps installed, banner printed.

- [ ] **Step 2: Confirm factory invariant**

```bash
cd /tmp/demo-e2e
npm run check:cws
```

Expected: green.

- [ ] **Step 3: Confirm `/cce-init` detection**

Open `/tmp/demo-e2e` in Claude Code. Invoke `/cce-init`.

Expected: skill lands in Phase A (detects fresh clone) and offers Phase B orient.

- [ ] **Step 4: Run a pitch-driven interview to completion**

Use a realistic pitch like "block tracker scripts on news sites." Confirm:
- Skill recommends content-script-only profile (Phase C pitch-driven).
- Phase B2 collects all 8 answers up front.
- Phase C2 generates bespoke content-script code that isn't stock hello-world.
- `npm run check:cws` stays green after scaffold.

- [ ] **Step 5: Clean up**

```bash
rm -rf /tmp/demo-e2e
```

- [ ] **Step 6: Document the smoke-test results inline in the PR or commit message**

No code commit needed if everything passed. If anything failed, open follow-up tasks.

---

## Self-review

**Spec coverage:**
- "Two entry points" → Tasks 1–5 deliver CLI; Task 11 verifies `npx skills add` path.
- "Pitch-driven interview" → Task 7.
- "Bespoke code" → Task 8.
- "Front-loaded" → Task 9.
- "Composability" → existing skill already delegates via `invokes:`; preserved in Phase B2 wording.
- "Rename cws-init → cce-init" → Task 1.
- "Detect+clone" → Task 6.
- "Risks (bespoke code quality)" → Task 8 includes the `check:cws` gate and "pitch too vague = skip" escape.
- "Reversibility" → Task 1 is a git mv (revertible); Task 2 is a rename (revertible); all CLI code is additive.

**Placeholders:** none. Every step has concrete code or concrete commands.

**Type consistency:** CLI functions `run`, `usage`, `main` are consistent across Tasks 3–4. Skill phase names (B2, C, C2, D, E, E2, F) match references in Task 9.

**Gaps against spec:** the spec's "Testing" section mentions "profile × feature combinations" — not every combination is covered by the smoke test. Acceptable for v0.1.0; add more after shipping.

---

## Plan complete

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
