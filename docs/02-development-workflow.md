# Development Workflow

## Dev Server

```bash
npm run dev
```

Opens a fresh Chrome instance with the extension pre-loaded. No need to manually load unpacked -- WXT handles it.

## Hot Module Replacement (HMR)

| Context | Behavior |
|---|---|
| Popup, Options, Sidepanel | Instant HMR -- changes appear without closing the UI |
| Content scripts | Full page reload on the target page |
| Background service worker | Full extension reload |

**Known quirk:** When background or content script files change, the popup closes (because the extension reloads). This is normal -- just reopen it.

## Debugging

**Content scripts:**
1. Navigate to a page matching your `matches` pattern
2. Open DevTools on that page (F12 / Cmd+Opt+I)
3. Your content script logs appear in the Console
4. Source files are under the "Content scripts" section in the Sources tab

**Background service worker:**
1. Go to `chrome://extensions`
2. Find your extension
3. Click "Inspect views: service worker"
4. A dedicated DevTools window opens for the background context

**Popup:**
1. Click the extension icon to open the popup
2. Right-click inside the popup > "Inspect"
3. DevTools opens for the popup context

**Sidepanel:**
1. Open the sidepanel
2. Right-click inside it > "Inspect"
3. DevTools opens for the sidepanel context

**Options page:**
1. Right-click extension icon > "Options" (or navigate to the options URL)
2. Standard page DevTools (F12)

## Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with HMR, opens Chrome |
| `npm run dev:firefox` | Same but for Firefox |
| `npm run build` | Production build to `.output/chrome-mv3/` |
| `npm run build:firefox` | Production build for Firefox |
| `npm run zip` | Build + zip for Chrome Web Store upload |
| `npm run zip:firefox` | Build + zip for Firefox |
| `npm run compile` | TypeScript check only (no build output) |

## Testing Against a Specific Site

Edit the `matches` array in `entrypoints/content.ts`:

```ts
export default defineContentScript({
  // Single site
  matches: ['*://*.github.com/*'],

  // Multiple sites
  matches: ['*://*.github.com/*', '*://*.gitlab.com/*'],

  // All sites (use sparingly -- CWS reviewers scrutinize this)
  matches: ['<all_urls>'],
});
```

Pattern format: `scheme://host/path` where `*` is a wildcard. See [Chrome match patterns docs](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

## Loading a Production Build Manually

If you need to test the production build without submitting to CWS:

1. `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3/` directory
