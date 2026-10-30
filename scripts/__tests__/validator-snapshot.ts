/**
 * Validator snapshot test.
 *
 * Regression guard for scripts/validate-cws.ts. Runs the validator against
 * the current factory state (post-build) in both structural and ship modes,
 * and against the escape-hatch state (video/ removed), asserting:
 *
 *   - Structural: 17 rules, 0 errors.
 *   - Ship (default factory): 26 rules, 6 errors, specific error rule-id set,
 *     no listing-copy findings.
 *   - Ship (video/ removed): 5 errors, ship-ready-video absent.
 *   - listing-copy-*: fires on residue / test wording / other stores / roadmap
 *     wording with the right severities, skips lowercase "todo", and
 *     --strict counts warnings as blocking.
 *
 * Assumes `.output/chrome-mv3/` exists (run `npm run build` first — the npm
 * script `test:validator` handles that).
 *
 * If any of these drift, the test fails loudly. Update the expected values
 * here intentionally (not reflexively) when you add or remove a rule.
 */

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const ROOT = resolve(import.meta.dirname, '..', '..');
const VALIDATOR = `npx tsx ${resolve(ROOT, 'scripts/validate-cws.ts')}`;

function run(args: string): any {
  const out = execSync(`${VALIDATOR} ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(out);
}

function runExpectingError(args: string): any {
  try {
    return run(args);
  } catch (e: any) {
    // Non-zero exit is expected when errors exist; parse stdout anyway.
    return JSON.parse(e.stdout);
  }
}

// ----- Test 1: structural mode is green (no errors) -----

const structural = runExpectingError('--json');
assert.equal(
  structural.rulesRun,
  17,
  `structural rulesRun: expected 17, got ${structural.rulesRun}`,
);
assert.equal(
  structural.summary.errors,
  0,
  `structural errors: expected 0, got ${structural.summary.errors}`,
);
assert.equal(
  structural.mode,
  'structural',
  `structural mode: expected "structural", got "${structural.mode}"`,
);
console.log(`✓ structural: 17 rules, 0 errors`);

// ----- Test 2: ship mode (default factory) has expected 6 errors -----

const ship = runExpectingError('--ship --json');
assert.equal(
  ship.rulesRun,
  26,
  `ship rulesRun: expected 26, got ${ship.rulesRun}`,
);
assert.equal(
  ship.summary.errors,
  6,
  `ship errors: expected 6, got ${ship.summary.errors}`,
);

const EXPECTED_SHIP_RULES = [
  'listing-ready-description',
  'listing-ready-name',
  'ship-ready-optional-host',
  'ship-ready-screenshots',
  'ship-ready-video',
  'ship-ready-welcome-config',
];
// Errors only: warn-severity rules (ship-ready-promo-tiles) also fire on the
// factory by design and are not part of the blocking set.
const actualShipRules = ship.findings
  .filter((f: any) => f.severity === 'error')
  .map((f: any) => f.rule)
  .sort();
assert.deepEqual(
  actualShipRules,
  EXPECTED_SHIP_RULES,
  `ship rules mismatch:\n  expected ${JSON.stringify(EXPECTED_SHIP_RULES)}\n  got      ${JSON.stringify(actualShipRules)}`,
);
assert.equal(
  ship.findings.filter((f: any) => f.rule.startsWith('listing-copy-')).length,
  0,
  `listing-copy-* should not fire on the factory template copy`,
);
console.log(`✓ ship (default): 26 rules, 6 errors, rule-ids match`);

// ----- Test 3: ship mode with video/ removed (escape hatch) -----

const videoDir = resolve(ROOT, 'video');
const videoBackup = resolve(ROOT, '.output', '.video-backup-snapshot-test');

if (!existsSync(videoDir)) {
  throw new Error(
    `video/ directory missing before escape-hatch test — cannot run`,
  );
}

renameSync(videoDir, videoBackup);
try {
  const shipNoVideo = runExpectingError('--ship --json');
  assert.equal(
    shipNoVideo.summary.errors,
    5,
    `ship (no video) errors: expected 5, got ${shipNoVideo.summary.errors}`,
  );
  const hasVideoRule = shipNoVideo.findings.some(
    (f: any) => f.rule === 'ship-ready-video',
  );
  assert.equal(
    hasVideoRule,
    false,
    `ship-ready-video rule should not fire when video/ is absent (escape hatch)`,
  );
  console.log(
    `✓ ship (video/ removed): 5 errors, ship-ready-video silent (escape hatch works)`,
  );
} finally {
  // ALWAYS restore, even on assertion failure.
  renameSync(videoBackup, videoDir);
}

// ----- Test 4: --json schema shape is intact (additive-only contract) -----

assert.ok(
  'schemaVersion' in ship,
  `JSON envelope missing schemaVersion field`,
);
assert.equal(
  ship.schemaVersion,
  1,
  `schemaVersion: expected 1, got ${ship.schemaVersion}`,
);
assert.ok('mode' in ship, `JSON envelope missing mode field`);
assert.ok('rulesRun' in ship, `JSON envelope missing rulesRun field`);
assert.ok('summary' in ship, `JSON envelope missing summary field`);
assert.ok('findings' in ship, `JSON envelope missing findings field`);
assert.ok('docUrl' in ship, `JSON envelope missing docUrl field`);

for (const f of ship.findings) {
  assert.ok(typeof f.rule === 'string', `finding missing rule: ${JSON.stringify(f)}`);
  assert.ok(
    f.severity === 'error' || f.severity === 'warn' || f.severity === 'info',
    `finding has invalid severity: ${JSON.stringify(f)}`,
  );
  assert.ok(typeof f.message === 'string', `finding missing message: ${JSON.stringify(f)}`);
  assert.ok(typeof f.why === 'string', `finding missing why: ${JSON.stringify(f)}`);
  assert.ok(typeof f.fix === 'string', `finding missing fix: ${JSON.stringify(f)}`);
}
console.log(`✓ --json envelope shape: schemaVersion=1, all required fields present`);

// ----- Test 5: proxy-host-in-install-perms fires on a proxy host -----

// Positive-fire check: this rule is the MSB regression guard. Patch the built
// manifest to include a workers.dev host in `host_permissions`, confirm the
// rule fires as an error, and that it does NOT double-report as a generic
// `optional-host-suggestion` warn on the same host.
const manifestPath = resolve(ROOT, '.output', 'chrome-mv3', 'manifest.json');
const originalManifest = readFileSync(manifestPath, 'utf8');
const patched = JSON.parse(originalManifest);
patched.host_permissions = [
  ...(patched.host_permissions ?? []),
  'https://msb-proxy.example.workers.dev/*',
];
writeFileSync(manifestPath, JSON.stringify(patched, null, 2));

try {
  const patchedRun = runExpectingError('--json');
  const proxyFinding = patchedRun.findings.find(
    (f: any) => f.rule === 'proxy-host-in-install-perms',
  );
  assert.ok(
    proxyFinding,
    `proxy-host-in-install-perms should fire when workers.dev is in host_permissions`,
  );
  assert.equal(
    proxyFinding.severity,
    'error',
    `proxy-host-in-install-perms should be severity=error, got ${proxyFinding.severity}`,
  );
  const doubleReport = patchedRun.findings.find(
    (f: any) =>
      f.rule === 'optional-host-suggestion' &&
      f.message.includes('workers.dev'),
  );
  assert.equal(
    doubleReport,
    undefined,
    `proxy host should not also appear in optional-host-suggestion (double-report)`,
  );
  console.log(
    `✓ proxy-host-in-install-perms: fires on workers.dev, no double-report`,
  );
} finally {
  writeFileSync(manifestPath, originalManifest);
}

// ----- Test 6: listing-copy lint (manifest + detailed description) -----

const storeDir = resolve(ROOT, 'store');
const detailedPath = resolve(storeDir, 'listing-description.txt');
const storeDirExisted = existsSync(storeDir);
const originalDetailed = existsSync(detailedPath) ? readFileSync(detailedPath, 'utf8') : null;
const copyPatched = JSON.parse(originalManifest);
copyPatched.description =
  'Lorem Ipsum for your tabs. TODO: tagline. A todo list with TODOs. Coming soon to Firefox Add-ons.';
writeFileSync(manifestPath, JSON.stringify(copyPatched, null, 2));
mkdirSync(storeDir, { recursive: true });
writeFileSync(detailedPath, 'A real first line.\nFor testing purposes only. FIXME\nWorks with alphabet soup and beta waves.\n');

try {
  const copyRun = runExpectingError('--ship --json');
  const copy = copyRun.findings.filter((f: any) => f.rule.startsWith('listing-copy-'));
  const has = (rule: string, severity: string, needle: string) =>
    copy.find((f: any) => f.rule === rule && f.severity === severity && f.message.includes(needle));

  assert.ok(has('listing-copy-placeholder', 'warn', '"Lorem Ipsum"'), 'Lorem ipsum (any case) should warn');
  assert.ok(has('listing-copy-placeholder', 'warn', 'manifest.description: template residue "TODO"'), 'uppercase TODO should warn');
  assert.ok(!copy.some((f: any) => /"todo"|"TODOs"/.test(f.message)), 'lowercase todo / TODOs must not match');
  assert.ok(has('listing-copy-other-store', 'warn', '"Firefox Add-ons"'), 'other-store mention should warn');
  assert.ok(has('listing-copy-unfinished', 'info', '"Coming soon"'), 'coming soon should be info');
  assert.ok(!copy.some((f: any) => /beta/i.test(f.message)), 'bare "beta" must not match');
  const fixme = has('listing-copy-placeholder', 'warn', 'detailed description: template residue "FIXME"');
  assert.deepEqual(fixme?.locations, ['store/listing-description.txt:2'], 'detailed-description findings carry file:line');
  assert.ok(has('listing-copy-test-wording', 'warn', '"For testing purposes"'), 'test wording should warn');
  assert.equal(copyRun.summary.info, copyRun.findings.filter((f: any) => f.severity === 'info').length);
  assert.equal(copyRun.strict, false);
  assert.equal(copyRun.summary.blocking, copyRun.summary.errors, 'without --strict only errors block');

  const strictRun = runExpectingError('--ship --strict --json');
  assert.equal(strictRun.strict, true);
  assert.equal(
    strictRun.summary.blocking,
    strictRun.summary.errors + strictRun.summary.warnings,
    '--strict: warnings block, info does not',
  );
  console.log(`✓ listing-copy: ${copy.length} findings with expected severities; --strict blocks warnings`);
} finally {
  writeFileSync(manifestPath, originalManifest);
  if (originalDetailed !== null) writeFileSync(detailedPath, originalDetailed);
  else if (storeDirExisted) rmSync(detailedPath, { force: true });
  else rmSync(storeDir, { recursive: true, force: true });
}

console.log(`\nAll snapshot assertions passed.`);
