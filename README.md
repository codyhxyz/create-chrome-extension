# Chrome Extension Template

Factory template for shipping Chrome extensions fast. Built on [WXT](https://wxt.dev) + React + Tailwind CSS + TypeScript.

## Quick Start

```bash
# Clone this template
git clone <this-repo> my-extension
cd my-extension

# Install dependencies
npm install

# Start dev server (opens Chrome with extension loaded)
npm run dev
```

## What's Included

**Entry points** — all common extension surfaces, strip what you don't need:
- `entrypoints/background.ts` — service worker with messaging + alarms
- `entrypoints/content.ts` — content script with shadow DOM utilities
- `entrypoints/popup/` — React popup with Tailwind
- `entrypoints/options/` — React settings page
- `entrypoints/sidepanel/` — React side panel

**Utilities** — battle-tested patterns from production extensions:
- Shadow DOM traversal (`queryAllDeep`, `closestComposed`)
- Scoped style injection (`ensureScopedStyles`)
- MutationObserver with suppression (`createSuppressableObserver`)
- Typed cross-context messaging (`sendMessage`, `onMessage`)

**Playbook** — docs for the full extension lifecycle:
- [Getting Started](docs/00-getting-started.md)
- [Extension Type Profiles](docs/01-extension-type-profiles.md) — strip-down checklists
- [Development Workflow](docs/02-development-workflow.md)
- [Chrome Web Store Submission](docs/03-chrome-web-store-submission.md)
- [Staleness Prevention](docs/04-staleness-prevention.md)
- [Launch Materials](docs/05-launch-materials.md)
- [Security](docs/06-security.md)
- [Useful Patterns](docs/07-useful-patterns.md)
- Templates: [Privacy Policy](docs/templates/privacy-policy.md) · [Store Listing](docs/templates/store-listing.md) · [QA Checklist](docs/templates/qa-checklist.md)

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR (opens Chrome) |
| `npm run build` | Production build to `.output/chrome-mv3/` |
| `npm run zip` | Build + zip for CWS upload |
| `npm run compile` | TypeScript type check |
| `npm run dev:firefox` | Dev server for Firefox |

## Stack

- [WXT](https://wxt.dev) v0.20 — extension framework
- [React](https://react.dev) 19 — UI
- [Tailwind CSS](https://tailwindcss.com) v4 — styling
- [TypeScript](https://www.typescriptlang.org) 5.9 — types
- [@webext-core/messaging](https://webext-core.aklinker1.io/guide/messaging/) — typed messaging
- [@wxt-dev/auto-icons](https://github.com/wxt-dev/wxt) — icon generation from SVG
