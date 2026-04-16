# Useful Patterns

Reference for the utilities included in this template.

---

## `queryAllDeep(selector, root)` -- `utils/dom.ts`

Query elements across shadow DOM boundaries.

**When:** Targeting elements inside shadow DOMs. Many modern sites use shadow DOM extensively (YouTube, GitHub, Salesforce, etc.). Standard `document.querySelectorAll` stops at shadow boundaries and returns nothing.

**Usage:**
```ts
import { queryAllDeep } from '@/utils/dom';

// Find all links, even those inside shadow roots
const links = queryAllDeep('a[href]');

// Scope to a specific subtree
const buttons = queryAllDeep('button', someContainer);
```

**How it works:** Uses a `TreeWalker` to recursively enter every `shadowRoot` it encounters, running `querySelectorAll` inside each one.

---

## `closestComposed(node, selector)` -- `utils/dom.ts`

Traverse up from a node, crossing shadow DOM boundaries.

**When:** You have an event target deep inside a shadow root and need to find a logical ancestor that lives in an outer shadow root or the main document. `Element.closest()` stops at the shadow boundary.

**Usage:**
```ts
import { closestComposed } from '@/utils/dom';

element.addEventListener('click', (e) => {
  const card = closestComposed(e.target as Node, '.card');
  // card might be in an outer shadow root -- closest() would have returned null
});
```

**How it works:** Walks `parentElement` normally, then jumps to `shadowRoot.host` when it hits a shadow boundary.

---

## `ensureScopedStyles(rootNode, styleId, css)` -- `utils/dom.ts`

Inject a `<style>` element into a document or shadow root. Idempotent -- won't duplicate if the style ID already exists.

**When:** Your content script needs CSS that works inside shadow DOMs. Styles in the main document do not penetrate shadow roots.

**Usage:**
```ts
import { ensureScopedStyles } from '@/utils/dom';

// Inject into main document
ensureScopedStyles(document, 'my-ext-styles', `
  .my-highlight { background: yellow; }
`);

// Inject into a shadow root
const shadowRoot = element.shadowRoot;
ensureScopedStyles(shadowRoot, 'my-ext-styles', `
  .my-highlight { background: yellow; }
`);
```

---

## `createSuppressableObserver(options)` -- `utils/observer.ts`

MutationObserver wrapper with timestamp-based suppression and debouncing.

**When:** Your extension watches DOM mutations but also modifies the DOM. Without suppression, your mutations trigger the observer, which triggers more mutations -- infinite loop.

**Usage:**
```ts
import { createSuppressableObserver } from '@/utils/observer';

const observer = createSuppressableObserver({
  callback: (mutations) => {
    // React to page changes
    updateUI(mutations);
  },
  debounceMs: 150, // default: 100
});

observer.observe(document.body);

// Before making DOM changes:
observer.suppress();       // suppress for 120ms (default)
observer.suppress(300);    // or specify duration
element.textContent = 'updated';
```

**Options:**
- `callback(mutations)` -- called with batched mutations after debounce window
- `config` -- `MutationObserverInit` (defaults to `{ childList: true, subtree: true }`)
- `debounceMs` -- debounce interval in ms (default: 100)

**Methods:**
- `observe(target)` -- start observing
- `disconnect()` -- stop observing, clear timers
- `suppress(ms?)` -- ignore mutations for the next `ms` milliseconds (default: 120)

---

## `sendMessage` / `onMessage` -- `utils/messaging.ts`

Type-safe message passing between extension contexts, built on `@webext-core/messaging`.

**When:** Content script needs data from background, popup needs to trigger a background action, or any cross-context communication.

**Why:** Typed messaging prevents the "message shape mismatch" class of bugs. The compiler enforces that every `sendMessage` call has the correct data shape and every handler returns the expected response type.

**Define your protocol** in `utils/messaging.ts`:
```ts
interface ProtocolMap {
  ping: { data: void; response: string };
  getSettings: { data: void; response: Settings };
  saveItem: { data: { id: string; value: string }; response: boolean };
}
```

**Handle in background:**
```ts
import { onMessage } from '@/utils/messaging';

onMessage('ping', () => 'pong');

onMessage('getSettings', async () => {
  const result = await chrome.storage.local.get('settings');
  return result.settings;
});

onMessage('saveItem', async ({ data }) => {
  // data is typed as { id: string; value: string }
  await chrome.storage.local.set({ [data.id]: data.value });
  return true;
});
```

**Send from content script or popup:**
```ts
import { sendMessage } from '@/utils/messaging';

const pong = await sendMessage('ping', undefined);  // typed as string
const settings = await sendMessage('getSettings', undefined);  // typed as Settings
const ok = await sendMessage('saveItem', { id: '1', value: 'hello' });  // typed as boolean
```

Add new message types to `ProtocolMap` -- both sides get compile-time type safety automatically.
