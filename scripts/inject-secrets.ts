/**
 * Build-time secret injection.
 * Replaces __PLACEHOLDER__ patterns in built files with values from .secrets.local.json.
 *
 * Usage: npx tsx scripts/inject-secrets.ts [output-dir]
 *   output-dir defaults to .output/chrome-mv3
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const OUTPUT_DIR = process.argv[2] || join(ROOT, '.output', 'chrome-mv3');
const SECRETS_FILE = join(ROOT, '.secrets.local.json');
const PLACEHOLDER_PATTERN = /__([A-Z][A-Z0-9_]+)__/g;

function loadSecrets(): Record<string, string> {
  try {
    return JSON.parse(readFileSync(SECRETS_FILE, 'utf8'));
  } catch {
    console.error(`ERROR: Missing or invalid ${SECRETS_FILE}`);
    console.error('Create it from .secrets.local.json.example');
    process.exit(1);
  }
}

function walkFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walkFiles(full));
    } else if (/\.(js|html|json)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const secrets = loadSecrets();
const files = walkFiles(OUTPUT_DIR);
let totalReplacements = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  let modified = false;

  content = content.replace(PLACEHOLDER_PATTERN, (match, key) => {
    if (key in secrets) {
      modified = true;
      totalReplacements++;
      return secrets[key];
    }
    return match;
  });

  if (modified) {
    writeFileSync(file, content);
    console.log(`  Injected secrets into ${file.replace(ROOT, '.')}`);
  }
}

// Verify no placeholders remain
let remaining = 0;
for (const file of walkFiles(OUTPUT_DIR)) {
  const content = readFileSync(file, 'utf8');
  const matches = content.match(PLACEHOLDER_PATTERN);
  if (matches) {
    remaining += matches.length;
    console.error(`  WARNING: Unreplaced placeholders in ${file}: ${matches.join(', ')}`);
  }
}

if (remaining > 0) {
  console.error(`\nERROR: ${remaining} unreplaced placeholder(s) found. Check .secrets.local.json.`);
  process.exit(1);
}

console.log(`\nDone — ${totalReplacements} replacement(s) across ${files.length} file(s).`);
