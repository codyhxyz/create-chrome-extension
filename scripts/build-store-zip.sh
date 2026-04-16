#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/.output/chrome-mv3"
VERSION="$(node -e "const p=require('$ROOT_DIR/package.json'); process.stdout.write(p.version)")"
NAME="$(node -e "const p=require('$ROOT_DIR/package.json'); process.stdout.write(p.name)")"
OUT="$ROOT_DIR/$NAME-$VERSION-chrome.zip"

echo "Building $NAME v$VERSION..."

# Build
npm run build

# Inject secrets if .secrets.local.json exists
if [[ -f "$ROOT_DIR/.secrets.local.json" ]]; then
  echo "Injecting secrets..."
  npx tsx "$ROOT_DIR/scripts/inject-secrets.ts" "$OUTPUT_DIR"
fi

# Zip
rm -f "$OUT"
cd "$OUTPUT_DIR"
zip -r "$OUT" . -x "*.DS_Store"

echo ""
echo "Built: $OUT"
echo "Upload this file to the Chrome Web Store Developer Dashboard."
