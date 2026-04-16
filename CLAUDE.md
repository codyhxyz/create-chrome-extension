# Chrome Extension Factory

## What this is
A factory for building Chrome extensions at high velocity. Ships every common extension piece (content script, background worker, popup, options, side panel) so you strip what you don't need per-project.

## Tech stack
- **WXT** — Chrome extension framework with file-based routing and auto-manifest
- **React 19** — popup, options, and side panel UIs
- **Tailwind CSS v4** — styling for React UIs
- **TypeScript** — strict mode throughout
- **@webext-core/messaging** — typed cross-context messaging
- **@wxt-dev/auto-icons** — generates all icon sizes from `assets/icon.svg`

## Project structure
- `entrypoints/` — all extension entry points (file name → manifest entry, auto-generated)
- `utils/` — shared utilities (auto-imported by WXT)
- `components/` — shared React components (auto-imported by WXT)
- `assets/` — icons, shared CSS
- `scripts/` — build-time tooling (secret injection, store zip)
- `docs/` — playbook documentation and templates

## Commands
- `npm run dev` — start WXT dev server (opens fresh Chrome with extension loaded)
- `npm run build` — production build to `.output/chrome-mv3/`
- `npm run zip` — build + package for Chrome Web Store upload
- `npm run compile` — TypeScript type check (no emit)
- `npm run dev:firefox` — dev server targeting Firefox
- `npm run build:firefox` — production build for Firefox

## Key files
- `wxt.config.ts` — WXT + manifest configuration
- `utils/dom.ts` — shadow DOM traversal (queryAllDeep, closestComposed, ensureScopedStyles)
- `utils/observer.ts` — MutationObserver with suppression pattern
- `utils/messaging.ts` — typed message protocol (add message types to ProtocolMap)
- `assets/styles/shared.css` — CSS custom properties for content script theming
- `scripts/inject-secrets.ts` — build-time secret replacement

## Extension type profiles
Strip down by deleting entry points you don't need:
- **Content-script-only**: delete `popup/`, `options/`, `sidepanel/`
- **Popup-based**: delete `content.ts`, `sidepanel/`
- **Sidepanel**: delete `popup/`, `content.ts`
- **Full hybrid**: keep everything (default)

See `docs/01-extension-type-profiles.md` for detailed checklists.

## Conventions
- Content scripts use vanilla TS (no React) — keep host page overhead minimal
- Popup/options/sidepanel use React + Tailwind
- Secrets use `__PLACEHOLDER__` pattern replaced at build time via `scripts/inject-secrets.ts`
- Never commit `.secrets.local.json`
- Use `docs/templates/` for CWS submission materials
