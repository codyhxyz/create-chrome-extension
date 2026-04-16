# Getting Started

## Quick Start

```bash
# Clone the template
git clone <this-repo-url> my-extension
cd my-extension

# Install dependencies
npm install

# Start development (opens Chrome with extension pre-loaded)
npm run dev
```

## Project Structure

```
entrypoints/          # Every file/folder here becomes a manifest entry automatically
  background.ts       # Service worker (runs in background, no DOM access)
  content.ts          # Injected into web pages matching `matches` pattern
  popup/              # Browser action popup (React app)
  options/            # Extension options page (React app)
  sidepanel/          # Chrome side panel (React app)
utils/
  dom.ts              # Shadow DOM traversal helpers (queryAllDeep, closestComposed, etc.)
  observer.ts         # MutationObserver with suppression (prevents infinite loops)
  messaging.ts        # Typed messaging between contexts (content <-> background <-> popup)
public/
  icon/               # Extension icons (16, 32, 48, 96, 128px PNGs)
assets/               # Static assets processed by Vite (images, fonts, etc.)
wxt.config.ts         # WXT + manifest configuration
```

## How WXT File-Based Routing Works

WXT auto-generates manifest entries from the `entrypoints/` directory:

| File/Folder | Manifest Entry |
|---|---|
| `entrypoints/background.ts` | `background.service_worker` |
| `entrypoints/content.ts` | `content_scripts[]` |
| `entrypoints/popup/index.html` | `action.default_popup` |
| `entrypoints/options/index.html` | `options_ui.page` |
| `entrypoints/sidepanel/index.html` | `side_panel.default_path` |

Drop a new file in `entrypoints/` and WXT handles the manifest wiring. Delete a file and its manifest entry disappears.

## What's Included

- **WXT** -- build system, dev server, manifest generation
- **React 19** -- UI framework for popup, options, sidepanel
- **Tailwind CSS v4** -- utility-first styling
- **@wxt-dev/auto-icons** -- generates all icon sizes from source
- **@webext-core/messaging** -- type-safe message passing
- **TypeScript** -- strict typing across all contexts

## Next Step

See [01-extension-type-profiles.md](./01-extension-type-profiles.md) to strip the template down to your extension type in under 2 minutes.
