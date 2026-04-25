/**
 * Rename the extension — one command, all the right fields.
 *
 * Rewrites every place the factory encodes an extension's identity:
 *
 *   wxt.config.ts              manifest.name, manifest.description (optional)
 *   package.json               "name" (slug, only if user passed --slug)
 *   marketing/og.config.mjs    name, footer (if repo path)
 *   entrypoints/welcome/config.ts  appName (if file exists and exports it)
 *   screenshots/config.ts      appName (if file exists and exports it)
 *   video/config.ts            appName (if file exists and exports it)
 *
 * Then scans README.md, CHANGELOG.md, MARKETING.md, ROADMAP.md,
 * ARCHITECTURE.md, and docs/ for literal occurrences of the OLD display
 * name and old slug, printing them as a "manual follow-up" list. We do
 * NOT blind-rewrite prose — too easy to clobber unrelated sentences.
 *
 * Optional final step: rename the parent folder on disk to the new slug.
 * Off by default; enable with --rename-dir. Refuses if git working tree
 * is dirty (override with --force).
 *
 * Usage:
 *   npx tsx scripts/rename.ts "<New Display Name>" [flags]
 *
 * Flags:
 *   --slug <kebab-name>    New package.json name / new folder name.
 *                          Defaults to kebab-case of the display name.
 *   --description "..."    Also update manifest.description.
 *   --rename-dir           Also `mv` the current folder to the new slug.
 *                          (Run this LAST; the script exits after so the
 *                          user can `cd` into the new path.)
 *   --dry-run              Print the plan; touch no files.
 *   --force                Proceed even if `git status` is dirty.
 *   --json                 Emit structured envelope on stdout; suppress
 *                          human-readable output. Same shape family as
 *                          validate-cws / version-sync.
 *
 * Exit codes:
 *   0 — success (or dry-run completed)
 *   1 — user error (bad args, dirty tree without --force, missing file)
 *   2 — fatal setup problem (cannot parse wxt.config.ts / package.json)
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const ARGS = process.argv.slice(2);

// ---- arg parsing ----------------------------------------------------------

function takeFlag(name: string): boolean {
  const i = ARGS.indexOf(name);
  if (i === -1) return false;
  ARGS.splice(i, 1);
  return true;
}

function takeOpt(name: string): string | undefined {
  const i = ARGS.indexOf(name);
  if (i === -1) return undefined;
  const v = ARGS[i + 1];
  ARGS.splice(i, 2);
  return v;
}

const DRY = takeFlag('--dry-run');
const FORCE = takeFlag('--force');
const JSON_MODE = takeFlag('--json');
const RENAME_DIR = takeFlag('--rename-dir');
const SLUG_ARG = takeOpt('--slug');
const DESC_ARG = takeOpt('--description');
const POSITIONAL = ARGS.filter((a) => !a.startsWith('--'));
const DISPLAY_NAME = POSITIONAL[0];

if (!DISPLAY_NAME) {
  emitError(1, 'Missing new display name. Usage: tsx scripts/rename.ts "<New Name>" [--slug foo] [--description "..."] [--rename-dir] [--dry-run] [--force] [--json]');
}

// ---- slug helpers ---------------------------------------------------------

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const NEW_NAME = DISPLAY_NAME!;
const NEW_SLUG = SLUG_ARG ?? toSlug(NEW_NAME);

// ---- load current state ---------------------------------------------------

type State = {
  wxtPath: string;
  pkgPath: string;
  oldName: string;         // display name from wxt.config.ts
  oldSlug: string;         // "name" from package.json
  oldDescription: string;  // manifest.description from wxt.config.ts
  oldDirBase: string;      // basename(ROOT)
};

function loadState(): State {
  const wxtPath = join(ROOT, 'wxt.config.ts');
  const pkgPath = join(ROOT, 'package.json');
  if (!existsSync(wxtPath)) emitError(2, `Not a factory repo: ${wxtPath} missing.`);
  if (!existsSync(pkgPath)) emitError(2, `Not a factory repo: ${pkgPath} missing.`);

  const wxt = readFileSync(wxtPath, 'utf8');
  const nameMatch = wxt.match(/manifest:\s*\{[\s\S]*?name:\s*(['"])([^'"]*)\1/);
  const descMatch = wxt.match(/manifest:\s*\{[\s\S]*?description:\s*(['"])([^'"]*)\1/);
  if (!nameMatch) emitError(2, 'Could not locate manifest.name in wxt.config.ts.');

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return {
    wxtPath,
    pkgPath,
    oldName: nameMatch![2],
    oldDescription: descMatch?.[2] ?? '',
    oldSlug: pkg.name ?? '',
    oldDirBase: basename(ROOT),
  };
}

// ---- edit planners (pure; build a list, then apply) -----------------------

type Edit = {
  file: string;        // relative path
  before: string;      // excerpt (for logging)
  after: string;
  apply: () => void;
};

function planWxtConfig(s: State): Edit[] {
  const edits: Edit[] = [];
  let src = readFileSync(s.wxtPath, 'utf8');

  // manifest.name — first occurrence inside manifest: { ... }
  const nameRe = /(manifest:\s*\{[\s\S]*?name:\s*)(['"])([^'"]*)\2/;
  const nameNew = src.replace(nameRe, `$1$2${escapeStr(NEW_NAME)}$2`);
  if (nameNew !== src) {
    edits.push({
      file: 'wxt.config.ts',
      before: `manifest.name = "${s.oldName}"`,
      after: `manifest.name = "${NEW_NAME}"`,
      apply: () => writeFileSync(s.wxtPath, nameNew),
    });
    src = nameNew;
  }

  if (DESC_ARG !== undefined) {
    const descRe = /(manifest:\s*\{[\s\S]*?description:\s*)(['"])([^'"]*)\2/;
    const descNew = src.replace(descRe, `$1$2${escapeStr(DESC_ARG)}$2`);
    if (descNew !== src) {
      edits.push({
        file: 'wxt.config.ts',
        before: `manifest.description = "${s.oldDescription}"`,
        after: `manifest.description = "${DESC_ARG}"`,
        apply: () => writeFileSync(s.wxtPath, descNew),
      });
    }
  }
  return edits;
}

function planPackageJson(s: State): Edit[] {
  if (!SLUG_ARG && NEW_SLUG === s.oldSlug) return [];
  // Only touch package.json if slug changed (either via --slug or because
  // derived slug differs). Keep untouched if user just renames display.
  if (NEW_SLUG === s.oldSlug) return [];

  const pkg = JSON.parse(readFileSync(s.pkgPath, 'utf8'));
  pkg.name = NEW_SLUG;
  return [{
    file: 'package.json',
    before: `"name": "${s.oldSlug}"`,
    after: `"name": "${NEW_SLUG}"`,
    apply: () => writeFileSync(s.pkgPath, JSON.stringify(pkg, null, 2) + '\n'),
  }];
}

function planOgConfig(s: State): Edit[] {
  const p = join(ROOT, 'marketing', 'og.config.mjs');
  if (!existsSync(p)) return [];
  const src = readFileSync(p, 'utf8');
  // Only rewrite the top-level `name:` field — first one wins.
  const next = src.replace(/(^\s*name:\s*)(['"])([^'"]*)\2/m, `$1$2${escapeStr(NEW_NAME)}$2`);
  if (next === src) return [];
  return [{
    file: 'marketing/og.config.mjs',
    before: `name: "${s.oldName}"`,
    after: `name: "${NEW_NAME}"`,
    apply: () => writeFileSync(p, next),
  }];
}

function planEntrypointConfig(s: State, rel: string): Edit[] {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return [];
  const src = readFileSync(p, 'utf8');
  // Common shape: `appName: "..."` in an exported config object.
  const next = src.replace(/(appName:\s*)(['"`])([^'"`]*)\2/, `$1$2${escapeStr(NEW_NAME)}$2`);
  if (next === src) return [];
  return [{
    file: rel,
    before: `appName in ${rel}`,
    after: `appName = "${NEW_NAME}"`,
    apply: () => writeFileSync(p, next),
  }];
}

// ---- prose scanner (warn, do not rewrite) ---------------------------------

function scanProse(s: State): Array<{ file: string; line: number; text: string; match: string }> {
  const targets = [
    'README.md', 'CHANGELOG.md', 'MARKETING.md', 'ROADMAP.md', 'ARCHITECTURE.md',
    'CLAUDE.md', 'CONTRIBUTING.md',
  ];
  const hits: Array<{ file: string; line: number; text: string; match: string }> = [];
  const needles = [s.oldName, s.oldSlug].filter((n) => n && n.length > 2);
  for (const rel of targets) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((text, i) => {
      for (const needle of needles) {
        if (text.includes(needle)) {
          hits.push({ file: rel, line: i + 1, text: text.trim(), match: needle });
          break;
        }
      }
    });
  }
  return hits;
}

// ---- util -----------------------------------------------------------------

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isGitDirty(): boolean {
  const r = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) return false; // not a git repo; don't block
  return r.stdout.trim().length > 0;
}

type Envelope = {
  schemaVersion: 1;
  kind: 'rename';
  dryRun: boolean;
  oldName: string;
  newName: string;
  oldSlug: string;
  newSlug: string;
  edits: Array<{ file: string; before: string; after: string }>;
  proseHits: Array<{ file: string; line: number; text: string; match: string }>;
  renamedDir?: { from: string; to: string };
  warnings: string[];
};

function emitJson(env: Envelope): never {
  process.stdout.write(JSON.stringify(env, null, 2) + '\n');
  process.exit(0);
}

function emitError(code: 1 | 2, msg: string): never {
  if (JSON_MODE) {
    process.stdout.write(JSON.stringify({ schemaVersion: 1, kind: 'rename', error: msg, exitCode: code }) + '\n');
  } else {
    process.stderr.write(`error: ${msg}\n`);
  }
  process.exit(code);
}

// ---- main -----------------------------------------------------------------

const state = loadState();

if (!FORCE && !DRY && isGitDirty()) {
  emitError(1, 'Git working tree is dirty. Commit or stash first, or pass --force.');
}

const edits: Edit[] = [
  ...planWxtConfig(state),
  ...planPackageJson(state),
  ...planOgConfig(state),
  ...planEntrypointConfig(state, 'entrypoints/welcome/config.ts'),
  ...planEntrypointConfig(state, 'screenshots/config.ts'),
  ...planEntrypointConfig(state, 'video/config.ts'),
];

const proseHits = scanProse(state);
const warnings: string[] = [];

if (state.oldName === NEW_NAME && state.oldSlug === NEW_SLUG) {
  warnings.push('Nothing to change: display name and slug already match.');
}

// Apply edits
if (!DRY) {
  for (const e of edits) e.apply();
}

// Optional dir rename — always LAST so all file edits land first.
let renamedDir: { from: string; to: string } | undefined;
if (RENAME_DIR && NEW_SLUG !== state.oldDirBase) {
  const parent = dirname(ROOT);
  const target = join(parent, NEW_SLUG);
  if (existsSync(target)) {
    warnings.push(`Cannot rename dir: ${target} already exists. Skipped.`);
  } else if (DRY) {
    renamedDir = { from: ROOT, to: target };
  } else {
    renamedDir = { from: ROOT, to: target };
    renameSync(ROOT, target);
  }
}

if (JSON_MODE) {
  emitJson({
    schemaVersion: 1,
    kind: 'rename',
    dryRun: DRY,
    oldName: state.oldName,
    newName: NEW_NAME,
    oldSlug: state.oldSlug,
    newSlug: NEW_SLUG,
    edits: edits.map(({ file, before, after }) => ({ file, before, after })),
    proseHits,
    renamedDir,
    warnings,
  });
}

// Human output
const pre = DRY ? '[dry-run] ' : '';
console.log(`\n${pre}Rename: "${state.oldName}" → "${NEW_NAME}"`);
if (state.oldSlug !== NEW_SLUG) console.log(`${pre}Slug:   "${state.oldSlug}" → "${NEW_SLUG}"`);

if (edits.length === 0) {
  console.log(`${pre}No file edits needed.`);
} else {
  console.log(`\n${pre}File edits (${edits.length}):`);
  for (const e of edits) console.log(`  ${e.file}: ${e.before}  →  ${e.after}`);
}

if (renamedDir) {
  console.log(`\n${pre}Dir rename: ${renamedDir.from}  →  ${renamedDir.to}`);
  if (!DRY) console.log(`\ncd "${renamedDir.to}"`);
}

if (proseHits.length > 0) {
  console.log(`\nManual follow-up — prose files still mention "${state.oldName}" or "${state.oldSlug}":`);
  const byFile = new Map<string, typeof proseHits>();
  for (const h of proseHits) {
    const arr = byFile.get(h.file) ?? [];
    arr.push(h);
    byFile.set(h.file, arr);
  }
  for (const [file, hits] of byFile) {
    console.log(`  ${file} (${hits.length} lines):`);
    for (const h of hits.slice(0, 5)) {
      const snippet = h.text.length > 90 ? h.text.slice(0, 87) + '…' : h.text;
      console.log(`    L${h.line}: ${snippet}`);
    }
    if (hits.length > 5) console.log(`    … +${hits.length - 5} more`);
  }
  console.log('\n(Skim these and update manually. Prose rewrites are too context-sensitive to auto-apply.)');
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  - ${w}`);
}

if (!DRY && edits.length > 0) {
  console.log('\nNext:');
  console.log('  npm run check:cws       # confirm structural green');
  console.log('  git diff                # eyeball the changes');
  if (renamedDir) console.log(`  cd "${renamedDir.to}"    # working dir moved`);
}
