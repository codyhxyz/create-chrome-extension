/**
 * Import a vanilla MV3 Chrome extension into the WXT factory layout.
 *
 * Given a directory containing a hand-authored MV3 `manifest.json` + flat
 * HTML/JS/CSS files, this script:
 *
 *   1. Parses the vanilla manifest; detects which entrypoints are in use
 *      (popup / options / sidepanel / welcome / background / content).
 *   2. Scans the source for CSP violations (inline `onclick=`, inline
 *      `<script>`, `eval(`, etc.) and stack hints (React imports,
 *      Tailwind `@tailwind` / `@apply`) — surfaces as warnings.
 *   3. Scaffolds a fresh WXT factory copy at the target dir (default
 *      `<source>-wxt` sibling).
 *   4. Strips factory entrypoints the vanilla extension doesn't use.
 *   5. If the vanilla ext isn't using React / Tailwind, removes those
 *      modules + deps so the imported dir stays minimal.
 *   6. Moves the vanilla files into the WXT layout: HTMLs into
 *      `entrypoints/<kind>/index.html`, JS into `main.js`, CSS into
 *      `style.css`. `background.js` gets wrapped in `defineBackground`,
 *      content scripts in `defineContentScript`.
 *   7. Translates manifest fields into `wxt.config.ts > manifest:{}`.
 *   8. Runs `npm install`, `npx wxt prepare`, `npm run check:cws`
 *      (skip via `--skip-install`).
 *
 * The script does not rewrite `chrome.*` API calls or transform IIFE
 * scripts into ES modules. Your code keeps the shape it had; WXT + Vite
 * bundle it as-is. Rewrites are limited to asset href/src paths inside
 * HTML (so Vite can resolve them at build time).
 *
 * Usage:
 *   npx tsx scripts/import-vanilla.ts <source-dir> [flags]
 *   npm run import -- <source-dir> [flags]
 *
 * Flags:
 *   --out <path>               Target dir. Default: <source>-wxt sibling.
 *   --in-place                 Overlay into source (destructive; refuses
 *                              if git dirty or `.output/` already exists).
 *   --react / --no-react       Force or disable React. Default: auto.
 *   --tailwind / --no-tailwind Same for Tailwind. Default: auto.
 *   --skip-install             Don't run `npm install`, `wxt prepare`,
 *                              or `check:cws` after scaffolding.
 *   --dry-run                  Print the plan; touch no files.
 *   --force                    Proceed despite CSP / broad-host warnings.
 *   --json                     Emit schemaVersion:1 envelope to stdout;
 *                              suppress human-readable output.
 *
 * Exit codes:
 *   0 — success (or dry-run completed)
 *   1 — user error (bad source, MV2, in-place on dirty tree without --force)
 *   2 — fatal setup (cannot read manifest.json, cannot locate factory)
 *   3 — post-scaffold failure (files landed but install/prepare/check:cws
 *       failed — target dir left on disk for inspection)
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  copyFileSync,
  rmSync,
} from 'node:fs';
import { join, resolve, dirname, basename, relative } from 'node:path';
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
const IN_PLACE = takeFlag('--in-place');
const SKIP_INSTALL = takeFlag('--skip-install');
const REACT_ON = takeFlag('--react');
const REACT_OFF = takeFlag('--no-react');
const TW_ON = takeFlag('--tailwind');
const TW_OFF = takeFlag('--no-tailwind');
const OUT_ARG = takeOpt('--out');
const POSITIONAL = ARGS.filter((a) => !a.startsWith('--'));
const SOURCE_ARG = POSITIONAL[0];

if (!SOURCE_ARG) {
  emitError(1, 'Missing source dir. Usage: tsx scripts/import-vanilla.ts <source-dir> [flags]');
}

// ---- types ----------------------------------------------------------------

type ProfilePart = 'popup' | 'options' | 'sidepanel' | 'welcome' | 'background' | 'content';

type Warning = {
  file: string;
  line?: number;
  rule: string;
  text: string;
};

type Move = {
  from: string;  // relative to source
  to: string;    // relative to target
};

type ManifestTranslation = {
  field: string;
  target: string;  // e.g. "wxt.config.ts > manifest.permissions"
};

type Envelope = {
  schemaVersion: 1;
  kind: 'import-vanilla';
  dryRun: boolean;
  source: string;
  target: string;
  manifestVersion: number;
  detectedProfile: ProfilePart[];
  stackChoice: {
    react: boolean;
    tailwind: boolean;
    detected: { react: boolean; tailwind: boolean };
  };
  plannedMoves: Move[];
  manifestTranslations: ManifestTranslation[];
  warnings: Warning[];
  skipped: string[];
  postScaffold?: {
    install: { ran: boolean; ok: boolean; summary?: string };
    prepare: { ran: boolean; ok: boolean; summary?: string };
    checkCws: { ran: boolean; ok: boolean; summary?: string };
  };
  nextSteps: string[];
};

// ---- helpers --------------------------------------------------------------

function escapeStr(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function isGitDirty(dir: string): boolean {
  const r = spawnSync('git', ['status', '--porcelain'], { cwd: dir, encoding: 'utf8' });
  if (r.status !== 0) return false;
  return r.stdout.trim().length > 0;
}

function emitError(code: 1 | 2 | 3, msg: string, extras?: Record<string, unknown>): never {
  if (JSON_MODE) {
    process.stdout.write(
      JSON.stringify({ schemaVersion: 1, kind: 'import-vanilla', error: msg, exitCode: code, ...extras }) + '\n'
    );
  } else {
    process.stderr.write(`error: ${msg}\n`);
  }
  process.exit(code);
}

function readJson<T = unknown>(p: string): T {
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

function walk(dir: string, skip: Set<string> = new Set()): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (skip.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full, skip));
    else out.push(full);
  }
  return out;
}

function copyTree(src: string, dst: string, exclude: Set<string>): void {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    if (exclude.has(name)) continue;
    const s = join(src, name);
    const d = join(dst, name);
    const st = statSync(s);
    if (st.isDirectory()) copyTree(s, d, exclude);
    else {
      mkdirSync(dirname(d), { recursive: true });
      copyFileSync(s, d);
    }
  }
}

// ---- source analysis ------------------------------------------------------

type VanillaManifest = {
  manifest_version: number;
  name?: string;
  description?: string;
  version?: string;
  permissions?: string[];
  host_permissions?: string[];
  optional_host_permissions?: string[];
  action?: { default_popup?: string; default_icon?: Record<string, string> };
  options_page?: string;
  side_panel?: { default_path?: string };
  background?: { service_worker?: string };
  content_scripts?: Array<{
    matches?: string[];
    js?: string[];
    css?: string[];
    run_at?: string;
    all_frames?: boolean;
  }>;
  icons?: Record<string, string>;
  commands?: Record<string, unknown>;
  web_accessible_resources?: unknown[];
  minimum_chrome_version?: string;
  // Warn-and-stub fields (pass through into wxt.config.ts manifest):
  externally_connectable?: unknown;
  chrome_url_overrides?: unknown;
  devtools_page?: string;
  omnibox?: unknown;
  declarative_net_request?: unknown;
  content_security_policy?: unknown;
};

function loadManifest(source: string): VanillaManifest {
  const p = join(source, 'manifest.json');
  if (!existsSync(p)) emitError(2, `No manifest.json at ${p}.`);
  let mf: VanillaManifest;
  try {
    mf = readJson<VanillaManifest>(p);
  } catch (e) {
    emitError(2, `Failed to parse ${p}: ${(e as Error).message}`);
  }
  if (mf.manifest_version !== 3) {
    emitError(1, `manifest_version is ${mf.manifest_version}; only MV3 is supported. Lift to MV3 first: https://developer.chrome.com/docs/extensions/develop/migrate`);
  }
  return mf;
}

function detectProfile(source: string, mf: VanillaManifest): ProfilePart[] {
  const parts: ProfilePart[] = [];
  if (mf.action?.default_popup) parts.push('popup');
  if (mf.options_page) parts.push('options');
  if (mf.side_panel?.default_path) parts.push('sidepanel');
  if (mf.background?.service_worker) parts.push('background');
  if (mf.content_scripts && mf.content_scripts.length > 0) parts.push('content');
  // Welcome is heuristic — look for welcome.html at source root.
  if (existsSync(join(source, 'welcome.html'))) parts.push('welcome');
  return parts;
}

const CSP_INLINE_HANDLER = /\bon(?:click|load|submit|change|input|focus|blur|keydown|keyup|mouseover|mouseout|error)\s*=\s*["']/i;
const CSP_INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i;
const TAILWIND_MARKER = /@tailwind\b|@apply\b/;
const REACT_IMPORT = /from\s+['"]react(?:-dom)?['"]|require\(['"]react(?:-dom)?['"]\)/;
const BROAD_HOST = /^(?:<all_urls>|\*:\/\/\*\/\*|https:\/\/\*\/\*|http:\/\/\*\/\*|\*:\/\/\*)$/;

function scanWarnings(source: string, mf: VanillaManifest): Warning[] {
  const out: Warning[] = [];
  const files = walk(source, new Set(['node_modules', '.git', '.output', '.wxt']));
  for (const full of files) {
    const rel = relative(source, full);
    const ext = full.slice(full.lastIndexOf('.')).toLowerCase();
    if (ext !== '.html' && ext !== '.htm') continue;
    const lines = readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (CSP_INLINE_HANDLER.test(line)) {
        out.push({ file: rel, line: i + 1, rule: 'csp-inline-handler', text: line.trim().slice(0, 120) });
      }
    });
    // Inline <script> (no src= attr)
    const full_html = lines.join('\n');
    if (CSP_INLINE_SCRIPT.test(full_html)) {
      out.push({ file: rel, rule: 'csp-inline-script', text: 'Inline <script> block detected (no src=)' });
    }
  }
  for (const p of mf.host_permissions ?? []) {
    if (BROAD_HOST.test(p)) {
      out.push({ file: 'manifest.json', rule: 'broad-host-permission', text: `host_permissions: "${p}" — consider moving to optional_host_permissions` });
    }
  }
  const stubFields: Array<keyof VanillaManifest> = [
    'externally_connectable', 'chrome_url_overrides', 'devtools_page',
    'omnibox', 'declarative_net_request', 'content_security_policy',
  ];
  for (const f of stubFields) {
    if (mf[f] != null) {
      out.push({ file: 'manifest.json', rule: 'unsupported-field-stub', text: `"${String(f)}" copied literally to wxt.config.ts; may need hand-wiring` });
    }
  }
  return out;
}

function detectStack(source: string): { react: boolean; tailwind: boolean } {
  let react = false;
  let tailwind = false;
  const files = walk(source, new Set(['node_modules', '.git', '.output', '.wxt']));
  for (const full of files) {
    const ext = full.slice(full.lastIndexOf('.')).toLowerCase();
    if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
      const src = readFileSync(full, 'utf8');
      if (REACT_IMPORT.test(src)) react = true;
    }
    if (ext === '.css' || ext === '.scss') {
      const src = readFileSync(full, 'utf8');
      if (TAILWIND_MARKER.test(src)) tailwind = true;
    }
    if (react && tailwind) break;
  }
  return { react, tailwind };
}

// ---- plan builders --------------------------------------------------------

const ENTRYPOINT_EXCLUDES = new Set([
  'node_modules', '.git', '.output', '.wxt', '.cce-init-done',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
]);

const DEV_ARTIFACT_RE = /\.(zip|tar|tar\.gz|tgz|map|log)$/i;

function buildMoves(source: string, mf: VanillaManifest, profile: ProfilePart[]): {
  moves: Move[];
  skipped: string[];
  iconMode: 'svg' | 'png-fallback';
  sharedCssHoist: string[];
} {
  const moves: Move[] = [];
  const skipped: string[] = [];

  const mapHtml = (kind: ProfilePart, htmlRel: string): void => {
    moves.push({ from: htmlRel, to: `entrypoints/${kind}/index.html` });
    // Derive sibling JS + CSS from HTML via <script src=...> / <link href=...>
    const htmlPath = join(source, htmlRel);
    if (!existsSync(htmlPath)) return;
    const html = readFileSync(htmlPath, 'utf8');
    const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
    const cssHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/g)].map((m) => m[1]);
    scriptSrcs.forEach((src, idx) => {
      if (src.startsWith('http')) return;
      const clean = src.replace(/^\.\//, '');
      const targetName = idx === 0 ? 'main.js' : `${basename(clean, '.js')}.js`;
      moves.push({ from: clean, to: `entrypoints/${kind}/${targetName}` });
    });
    cssHrefs.forEach((href, idx) => {
      if (href.startsWith('http')) return;
      const clean = href.replace(/^\.\//, '');
      const targetName = idx === 0 ? 'style.css' : basename(clean);
      moves.push({ from: clean, to: `entrypoints/${kind}/${targetName}` });
    });
  };

  if (profile.includes('popup') && mf.action?.default_popup) mapHtml('popup', mf.action.default_popup);
  if (profile.includes('options') && mf.options_page) mapHtml('options', mf.options_page);
  if (profile.includes('sidepanel') && mf.side_panel?.default_path) mapHtml('sidepanel', mf.side_panel.default_path);
  if (profile.includes('welcome')) mapHtml('welcome', 'welcome.html');

  if (profile.includes('background') && mf.background?.service_worker) {
    moves.push({ from: mf.background.service_worker, to: 'entrypoints/background.ts' });
  }

  if (profile.includes('content') && mf.content_scripts) {
    mf.content_scripts.forEach((cs, i) => {
      for (const js of cs.js ?? []) {
        const name = mf.content_scripts!.length === 1 ? 'content.ts' : `content-${i + 1}.ts`;
        moves.push({ from: js, to: `entrypoints/${name}` });
      }
      for (const css of cs.css ?? []) {
        moves.push({ from: css, to: `public/${basename(css)}` });
      }
    });
  }

  // Icons — prefer SVG
  let iconMode: 'svg' | 'png-fallback' = 'png-fallback';
  const svgCandidates = ['icons/icon.svg', 'icon.svg', 'assets/icon.svg'];
  const svgFound = svgCandidates.find((c) => existsSync(join(source, c)));
  if (svgFound) {
    moves.push({ from: svgFound, to: 'assets/icon.svg' });
    iconMode = 'svg';
  } else if (mf.icons) {
    for (const [, rel] of Object.entries(mf.icons)) {
      moves.push({ from: rel, to: `public/${rel}` });
    }
  }

  // Detect CSS files referenced by >1 HTML entrypoint (hoist to public/)
  const cssHoistCandidates = new Map<string, number>();
  for (const m of moves) {
    if (m.to.startsWith('entrypoints/') && m.to.endsWith('.css')) {
      const k = m.from;
      cssHoistCandidates.set(k, (cssHoistCandidates.get(k) ?? 0) + 1);
    }
  }
  const sharedCssHoist = [...cssHoistCandidates.entries()]
    .filter(([, n]) => n > 1)
    .map(([k]) => k);

  // Skip dev artifacts from root
  for (const name of readdirSync(source)) {
    if (DEV_ARTIFACT_RE.test(name)) skipped.push(name);
  }

  return { moves, skipped, iconMode, sharedCssHoist };
}

function buildManifestTranslations(mf: VanillaManifest): ManifestTranslation[] {
  const out: ManifestTranslation[] = [];
  const copy = (field: keyof VanillaManifest) => {
    if (mf[field] != null) out.push({ field: String(field), target: `wxt.config.ts > manifest.${String(field)}` });
  };
  copy('name');
  copy('description');
  copy('permissions');
  copy('host_permissions');
  copy('optional_host_permissions');
  copy('commands');
  copy('web_accessible_resources');
  copy('minimum_chrome_version');
  copy('externally_connectable');
  copy('chrome_url_overrides');
  copy('devtools_page');
  copy('omnibox');
  copy('declarative_net_request');
  copy('content_security_policy');
  if (mf.version) out.push({ field: 'version', target: 'package.json > version' });
  return out;
}

// ---- writers --------------------------------------------------------------

function writeWxtConfig(targetDir: string, mf: VanillaManifest, react: boolean, tailwind: boolean, iconMode: 'svg' | 'png-fallback'): void {
  const modules: string[] = [];
  if (react) modules.push("'@wxt-dev/module-react'");
  if (iconMode === 'svg') modules.push("'@wxt-dev/auto-icons'");

  const manifestEntries: string[] = [];
  const j = (v: unknown) => JSON.stringify(v, null, 4).replace(/\n/g, '\n    ');

  if (mf.name) manifestEntries.push(`    name: '${escapeStr(mf.name)}'`);
  if (mf.description) manifestEntries.push(`    description: '${escapeStr(mf.description)}'`);
  if (mf.permissions) manifestEntries.push(`    permissions: ${j(mf.permissions)}`);
  if (mf.host_permissions) manifestEntries.push(`    host_permissions: ${j(mf.host_permissions)}`);
  if (mf.optional_host_permissions) manifestEntries.push(`    optional_host_permissions: ${j(mf.optional_host_permissions)}`);
  if (mf.commands) manifestEntries.push(`    commands: ${j(mf.commands)}`);
  if (mf.web_accessible_resources) manifestEntries.push(`    web_accessible_resources: ${j(mf.web_accessible_resources)}`);
  if (mf.minimum_chrome_version) manifestEntries.push(`    minimum_chrome_version: '${escapeStr(mf.minimum_chrome_version)}'`);
  if (iconMode === 'png-fallback' && mf.icons) manifestEntries.push(`    icons: ${j(mf.icons)}`);
  // Pass-through stub fields
  for (const f of ['externally_connectable', 'chrome_url_overrides', 'devtools_page', 'omnibox', 'declarative_net_request', 'content_security_policy'] as const) {
    if (mf[f] != null) manifestEntries.push(`    ${f}: ${j(mf[f])}`);
  }

  const viteBlock = tailwind
    ? `  vite: () => ({\n    plugins: [tailwindcss()],\n  }),\n`
    : '';
  const tailwindImport = tailwind ? `import tailwindcss from '@tailwindcss/vite';\n` : '';
  const autoIcons = iconMode === 'svg' ? `  autoIcons: {\n    baseIconPath: 'assets/icon.svg',\n  },\n` : '';

  const src = `import { defineConfig } from 'wxt';
${tailwindImport}
// Generated by scripts/import-vanilla.ts — review and tweak freely.
export default defineConfig({
  modules: [${modules.join(', ')}],
  manifest: {
${manifestEntries.join(',\n')}
  },
${autoIcons}${viteBlock}});
`;
  writeFileSync(join(targetDir, 'wxt.config.ts'), src);
}

function updatePackageJson(targetDir: string, mf: VanillaManifest, react: boolean, tailwind: boolean): void {
  const p = join(targetDir, 'package.json');
  const pkg = readJson<Record<string, any>>(p);
  if (mf.version) pkg.version = mf.version;
  if (!react) {
    for (const k of ['react', 'react-dom']) delete pkg.dependencies?.[k];
    for (const k of ['@types/react', '@types/react-dom', '@wxt-dev/module-react']) delete pkg.devDependencies?.[k];
  }
  if (!tailwind) {
    for (const k of ['@tailwindcss/vite', 'tailwindcss']) delete pkg.devDependencies?.[k];
  }
  writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
}

function wrapBackgroundScript(targetDir: string, bgRel: string): void {
  const p = join(targetDir, bgRel);
  if (!existsSync(p)) return;
  const body = readFileSync(p, 'utf8');
  const wrapped = `// Wrapped from vanilla background.js by import-vanilla.ts
// Original top-level code runs inside defineBackground's main callback,
// preserving service-worker semantics.
export default defineBackground(() => {
${body.split('\n').map((l) => l.length ? '  ' + l : l).join('\n')}
});
`;
  writeFileSync(p, wrapped);
}

function wrapContentScript(targetDir: string, csRel: string, matches: string[], runAt?: string, allFrames?: boolean): void {
  const p = join(targetDir, csRel);
  if (!existsSync(p)) return;
  const body = readFileSync(p, 'utf8');
  const opts: string[] = [`  matches: ${JSON.stringify(matches)}`];
  if (runAt) opts.push(`  runAt: '${runAt}'`);
  if (allFrames) opts.push(`  allFrames: true`);
  opts.push(`  main() {\n${body.split('\n').map((l) => l.length ? '    ' + l : l).join('\n')}\n  }`);
  const wrapped = `// Wrapped from vanilla content script by import-vanilla.ts
export default defineContentScript({
${opts.join(',\n')},
});
`;
  writeFileSync(p, wrapped);
}

function rewriteHtmlPaths(targetDir: string, htmlRel: string, scriptRemaps: Map<string, string>, cssRemaps: Map<string, string>): void {
  const p = join(targetDir, htmlRel);
  if (!existsSync(p)) return;
  let html = readFileSync(p, 'utf8');
  // Script src remap
  html = html.replace(/<script([^>]+)src=["']([^"']+)["']/g, (_, attrs, src) => {
    const clean = src.replace(/^\.\//, '');
    const mapped = scriptRemaps.get(clean);
    if (!mapped) return `<script${attrs}src="${src}"`;
    return `<script${attrs}src="./${mapped}"`;
  });
  // Link href remap (CSS)
  html = html.replace(/<link([^>]+)href=["']([^"']+)["']/g, (_, attrs, href) => {
    if (!href.endsWith('.css')) return `<link${attrs}href="${href}"`;
    const clean = href.replace(/^\.\//, '');
    const mapped = cssRemaps.get(clean);
    if (!mapped) return `<link${attrs}href="${href}"`;
    // hoisted CSS → absolute path from extension root
    const abs = mapped.startsWith('public/') ? '/' + mapped.replace(/^public\//, '') : './' + mapped.split('/').pop();
    return `<link${attrs}href="${abs}"`;
  });
  writeFileSync(p, html);
}

function writeWelcomeConfigStub(targetDir: string, mf: VanillaManifest): void {
  const p = join(targetDir, 'entrypoints', 'welcome', 'config.ts');
  if (!existsSync(join(targetDir, 'entrypoints', 'welcome'))) return;
  const stub = `// Stub populated by scripts/import-vanilla.ts.
// Run \`/cws-content\` to replace these placeholders with real copy
// (the skill writes here and to wxt.config.ts > manifest).

export const welcomeConfig = {
  valueProp: ${JSON.stringify(mf.description ?? 'A brief one-sentence description')},
  activationSurfaces: ['your-activation-surface-here'],
  steps: [
    {
      id: 'placeholder',
      label: 'Placeholder — replace with real permission step',
      justification: 'Why this permission is needed.',
      permissions: [],
      cta: 'Grant',
    },
  ],
  links: {
    repo: 'https://github.com/your-org/your-extension',
    issues: 'https://github.com/your-org/your-extension/issues',
    privacy: 'https://your-org.github.io/your-extension/privacy/',
  },
};
`;
  writeFileSync(p, stub);
}

function hoistSharedCss(targetDir: string, sharedCssHoist: string[], moves: Move[]): void {
  for (const css of sharedCssHoist) {
    const destPublic = join(targetDir, 'public', basename(css));
    mkdirSync(dirname(destPublic), { recursive: true });
    // Find any occurrence of this CSS in moves, copy from source to public
    const entry = moves.find((m) => m.from === css);
    if (!entry) continue;
    // Primary entrypoint location (already copied there); also copy to public
    const primaryTargetPath = join(targetDir, entry.to);
    if (existsSync(primaryTargetPath)) {
      copyFileSync(primaryTargetPath, destPublic);
    }
  }
}

// ---- main -----------------------------------------------------------------

const source = resolve(process.cwd(), SOURCE_ARG!);
if (!existsSync(source) || !statSync(source).isDirectory()) {
  emitError(1, `Source is not a directory: ${source}`);
}

const mf = loadManifest(source);
const profile = detectProfile(source, mf);
const detected = detectStack(source);
const warnings = scanWarnings(source, mf);

// Resolve stack choice
const react = REACT_ON ? true : REACT_OFF ? false : detected.react;
const tailwind = TW_ON ? true : TW_OFF ? false : detected.tailwind;

// Resolve target
let target: string;
if (IN_PLACE) {
  target = source;
  if (!FORCE && isGitDirty(source)) {
    emitError(1, `In-place refuses: ${source} has uncommitted changes. Commit/stash or pass --force.`);
  }
  if (existsSync(join(source, '.output'))) {
    emitError(1, `In-place refuses: ${source} already has a .output/ dir. Not a clean vanilla source.`);
  }
} else if (OUT_ARG) {
  target = resolve(process.cwd(), OUT_ARG);
} else {
  target = resolve(source + '-wxt');
}

if (!IN_PLACE && existsSync(target) && !DRY) {
  emitError(1, `Target already exists: ${target}. Delete it or pick another --out.`);
}

// Warnings gate
const blockingWarnings = warnings.filter((w) =>
  w.rule === 'csp-inline-handler' || w.rule === 'csp-inline-script'
);
if (blockingWarnings.length > 0 && !FORCE && !DRY) {
  emitError(1, `${blockingWarnings.length} CSP warning(s) — MV3 will reject inline handlers. Fix them, run --dry-run to preview, or pass --force.`, {
    warnings: blockingWarnings,
  });
}

// Build plan
const { moves, skipped, iconMode, sharedCssHoist } = buildMoves(source, mf, profile);
const translations = buildManifestTranslations(mf);

const envelope: Envelope = {
  schemaVersion: 1,
  kind: 'import-vanilla',
  dryRun: DRY,
  source,
  target,
  manifestVersion: mf.manifest_version,
  detectedProfile: profile,
  stackChoice: { react, tailwind, detected },
  plannedMoves: moves,
  manifestTranslations: translations,
  warnings,
  skipped,
  nextSteps: [],
};

if (DRY) {
  finishAndEmit(envelope);
}

// ---- apply ----------------------------------------------------------------

// 1. Copy factory skeleton → target
const FACTORY_EXCLUDE = new Set([
  'node_modules', '.git', '.output', '.wxt', '.cce-init-done',
  'package-lock.json',
]);
if (!IN_PLACE) {
  copyTree(ROOT, target, FACTORY_EXCLUDE);
}

// 2. Strip unused entrypoints
const ALL_ENTRYPOINTS: Array<{ kind: ProfilePart; path: string }> = [
  { kind: 'popup', path: 'entrypoints/popup' },
  { kind: 'options', path: 'entrypoints/options' },
  { kind: 'sidepanel', path: 'entrypoints/sidepanel' },
  { kind: 'welcome', path: 'entrypoints/welcome' },
  { kind: 'background', path: 'entrypoints/background.ts' },
  { kind: 'content', path: 'entrypoints/content.ts' },
];
for (const ep of ALL_ENTRYPOINTS) {
  if (profile.includes(ep.kind)) continue;
  const p = join(target, ep.path);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

// 3. For kept entrypoints, strip the React/Tailwind scaffolding that the
//    factory ships inside them (main.tsx, App.tsx, style.css). The vanilla
//    files are about to land on top.
for (const ep of ALL_ENTRYPOINTS) {
  if (!profile.includes(ep.kind)) continue;
  if (!ep.path.startsWith('entrypoints/') || ep.path.endsWith('.ts')) continue;
  const dir = join(target, ep.path);
  if (!existsSync(dir)) continue;
  for (const f of ['main.tsx', 'App.tsx', 'style.css', 'index.html']) {
    const p = join(dir, f);
    if (existsSync(p)) rmSync(p, { force: true });
  }
}

// 4. Apply vanilla files per plan
for (const m of moves) {
  const src = join(source, m.from);
  const dst = join(target, m.to);
  if (!existsSync(src)) continue;
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
}

// 5. Per-entrypoint HTML path rewrites
const kinds: ProfilePart[] = ['popup', 'options', 'sidepanel', 'welcome'];
for (const kind of kinds) {
  if (!profile.includes(kind)) continue;
  const htmlTarget = `entrypoints/${kind}/index.html`;
  // Build remap tables from the moves list
  const scriptRemap = new Map<string, string>();
  const cssRemap = new Map<string, string>();
  for (const m of moves) {
    if (!m.to.startsWith(`entrypoints/${kind}/`)) continue;
    const basenameTo = basename(m.to);
    if (basenameTo.endsWith('.js')) scriptRemap.set(m.from, basenameTo);
    if (basenameTo.endsWith('.css')) cssRemap.set(m.from, sharedCssHoist.includes(m.from) ? `public/${basename(m.from)}` : basenameTo);
  }
  rewriteHtmlPaths(target, htmlTarget, scriptRemap, cssRemap);
}

// 6. Wrap background + content scripts
if (profile.includes('background') && mf.background?.service_worker) {
  wrapBackgroundScript(target, 'entrypoints/background.ts');
}
if (profile.includes('content') && mf.content_scripts) {
  mf.content_scripts.forEach((cs, i) => {
    const name = mf.content_scripts!.length === 1 ? 'content.ts' : `content-${i + 1}.ts`;
    wrapContentScript(target, `entrypoints/${name}`, cs.matches ?? [], cs.run_at, cs.all_frames);
  });
}

// 7. Hoist shared CSS to public/
hoistSharedCss(target, sharedCssHoist, moves);

// 8. Write wxt.config.ts + update package.json
writeWxtConfig(target, mf, react, tailwind, iconMode);
updatePackageJson(target, mf, react, tailwind);

// 9. Welcome config stub
if (profile.includes('welcome')) writeWelcomeConfigStub(target, mf);

// ---- post-scaffold --------------------------------------------------------

const post: NonNullable<Envelope['postScaffold']> = {
  install: { ran: false, ok: false },
  prepare: { ran: false, ok: false },
  checkCws: { ran: false, ok: false },
};

if (!SKIP_INSTALL) {
  if (!JSON_MODE) console.log('\nRunning npm install (this may take a minute)…');
  const r = spawnSync('npm', ['install'], { cwd: target, encoding: 'utf8', stdio: JSON_MODE ? 'pipe' : 'inherit' });
  post.install = { ran: true, ok: r.status === 0, summary: r.status === 0 ? 'ok' : `exit ${r.status}` };

  if (post.install.ok) {
    if (!JSON_MODE) console.log('\nRunning wxt prepare…');
    const r2 = spawnSync('npx', ['wxt', 'prepare'], { cwd: target, encoding: 'utf8', stdio: JSON_MODE ? 'pipe' : 'inherit' });
    post.prepare = { ran: true, ok: r2.status === 0, summary: r2.status === 0 ? 'ok' : `exit ${r2.status}` };

    if (post.prepare.ok) {
      if (!JSON_MODE) console.log('\nRunning npm run check:cws…');
      const r3 = spawnSync('npm', ['run', 'check:cws'], { cwd: target, encoding: 'utf8', stdio: JSON_MODE ? 'pipe' : 'inherit' });
      post.checkCws = { ran: true, ok: r3.status === 0, summary: r3.status === 0 ? 'structural green' : `exit ${r3.status}` };
    }
  }
}

envelope.postScaffold = post;
envelope.nextSteps = [
  ...(SKIP_INSTALL ? [`cd "${target}" && npm install`, 'npx wxt prepare', 'npm run check:cws'] : []),
  '/cws-content  # fill welcome config + polish listing name/description',
  '/cws-screens  # if you want the screenshot pipeline',
  'npm run dev   # load the imported extension in Chrome',
];

const postFailed = !SKIP_INSTALL && (!post.install.ok || (post.install.ok && !post.prepare.ok) || (post.prepare.ok && !post.checkCws.ok));
finishAndEmit(envelope, postFailed ? 3 : 0);

// ---- finisher -------------------------------------------------------------

function finishAndEmit(env: Envelope, exitCode: 0 | 3 = 0): never {
  if (JSON_MODE) {
    process.stdout.write(JSON.stringify(env, null, 2) + '\n');
    process.exit(exitCode);
  }

  const pre = env.dryRun ? '[dry-run] ' : '';
  console.log(`\n${pre}Import: ${env.source}  →  ${env.target}`);
  console.log(`${pre}Profile: [${env.detectedProfile.join(', ')}]`);
  console.log(`${pre}Stack:   react=${env.stackChoice.react} tailwind=${env.stackChoice.tailwind} (detected: react=${env.stackChoice.detected.react} tailwind=${env.stackChoice.detected.tailwind})`);
  console.log(`${pre}Moves:   ${env.plannedMoves.length} files`);
  if (env.plannedMoves.length > 0 && env.dryRun) {
    for (const m of env.plannedMoves.slice(0, 20)) console.log(`  ${m.from}  →  ${m.to}`);
    if (env.plannedMoves.length > 20) console.log(`  … +${env.plannedMoves.length - 20} more`);
  }
  console.log(`${pre}Manifest translations: ${env.manifestTranslations.length} fields`);
  if (env.skipped.length > 0) console.log(`${pre}Skipped (dev artifacts): ${env.skipped.join(', ')}`);

  if (env.warnings.length > 0) {
    console.log(`\nWarnings (${env.warnings.length}):`);
    for (const w of env.warnings) {
      const loc = w.line ? ` L${w.line}` : '';
      console.log(`  [${w.rule}] ${w.file}${loc}: ${w.text}`);
    }
  }

  if (env.postScaffold) {
    console.log(`\nPost-scaffold:`);
    console.log(`  npm install:   ${env.postScaffold.install.ran ? (env.postScaffold.install.ok ? '✓' : '✗') : '·'} ${env.postScaffold.install.summary ?? ''}`);
    console.log(`  wxt prepare:   ${env.postScaffold.prepare.ran ? (env.postScaffold.prepare.ok ? '✓' : '✗') : '·'} ${env.postScaffold.prepare.summary ?? ''}`);
    console.log(`  check:cws:     ${env.postScaffold.checkCws.ran ? (env.postScaffold.checkCws.ok ? '✓' : '✗') : '·'} ${env.postScaffold.checkCws.summary ?? ''}`);
  }

  if (env.nextSteps.length > 0) {
    console.log(`\nNext:`);
    for (const step of env.nextSteps) console.log(`  ${step}`);
  }
  process.exit(exitCode);
}
