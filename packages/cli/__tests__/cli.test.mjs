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
