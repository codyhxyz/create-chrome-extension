/**
 * Headless-Chrome screenshot export.
 *
 * Reads `screenshots/config.ts`, boots the Next.js production server on a
 * local port, iterates each configured shot, and writes PNGs to
 * `.output/screenshots/<id>.png` at exactly 1280×800.
 *
 * Run via the root-level script:
 *   npm run screenshots
 *
 * Assumes `screenshots/` has already been built (`next build`). The root
 * script (`"screenshots"` in root package.json) handles both install + build
 * + running this file; you don't invoke this directly unless you've already
 * built.
 *
 * Why Playwright over Puppeteer: Playwright ships an idempotent browser
 * manager, exposes a first-class `page.screenshot({ clip })` that crops to
 * exact dimensions, and its TypeScript types are already a devDep here
 * (shared with `sources/_scripts/capture.ts`). Puppeteer would also work;
 * Playwright avoids adding a second heavy browser manager.
 */

import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { screenshots, type ScreenshotConfig } from './config';

// tsx transpiles this to CJS, where `import.meta.dirname` isn't populated on
// every Node version. `fileURLToPath(import.meta.url)` is stable across both.
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const SCREENSHOTS_DIR = resolve(HERE);
const OUT_DIR = join(REPO_ROOT, '.output', 'screenshots');
const PORT = 3535;
const HOST = `http://127.0.0.1:${PORT}`;

async function waitForServer(timeoutMs = 30_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(HOST);
      if (res.ok || res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Next.js server did not respond within ${timeoutMs}ms`);
}

function startServer(): ChildProcess {
  const proc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: SCREENSHOTS_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' },
  });
  proc.stdout?.on('data', (d) => process.stderr.write(`[next] ${d}`));
  proc.stderr?.on('data', (d) => process.stderr.write(`[next] ${d}`));
  return proc;
}

async function captureOne(page: Page, shot: ScreenshotConfig): Promise<string> {
  const url = `${HOST}/${shot.id}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  // Small settle to let fonts paint in case of any async font fallback.
  await page.waitForTimeout(150);
  const outPath = join(OUT_DIR, `${shot.id}.png`);
  await page.screenshot({
    path: outPath,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
    omitBackground: false,
  });
  return outPath;
}

async function main() {
  if (screenshots.length === 0) {
    console.log('No screenshots configured in screenshots/config.ts — nothing to do.');
    return;
  }

  if (existsSync(OUT_DIR)) {
    rmSync(OUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUT_DIR, { recursive: true });

  console.log(
    `Rendering ${screenshots.length} screenshot${screenshots.length === 1 ? '' : 's'} → ${OUT_DIR}`,
  );

  const server = startServer();
  let browser: Browser | undefined;
  try {
    await waitForServer();
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const shot of screenshots) {
      const file = await captureOne(page, shot);
      console.log(`  ✓ ${shot.id.padEnd(24)} → ${file.replace(REPO_ROOT + '/', '')}`);
    }
    await context.close();
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }

  console.log(
    `\nDone. ${screenshots.length} PNG${screenshots.length === 1 ? '' : 's'} written to .output/screenshots/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
