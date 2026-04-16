---
url: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/S1_uqpDFVzY
captured_at: '2026-04-16'
capture_method: manual
source_type: forum
source_id: google-group
title_at_capture: "Questions about the Chrome Web Store review process — chromium-extensions"
author: null
evidence_class: b
topics:
  - permissions
  - cws-review
  - content-scripts
wayback_url: null
thread_url: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/S1_uqpDFVzY
post_count: null
accepted_answer: null
related_docs:
  - docs/09-cws-best-practices.md
notes: |
  Partial reconstruction. Google Groups threads are JS-rendered; this capture
  contains only the Simeon Vincent (Chrome DevRel) quote previously cited in
  docs/09-cws-best-practices.md. Full thread capture requires manually saving
  the browser-rendered HTML and re-running capture.ts with --from-file. The
  signal from this thread was load-bearing enough to warrant a stub capture
  now; full content can be backfilled later without breaking downstream docs
  citations because the URL is stable.
---

# Questions about the Chrome Web Store review process

## Signal extracted

> "your 'content_scripts' can also affect reviews. Specifically, the 'matches' field."
> — Simeon Vincent (Chrome DevRel), chromium-extensions Google Group

**Implication:** broad `content_scripts.matches` patterns (`*://*/*`, `<all_urls>`) count as host permissions for the purposes of Chrome Web Store review — not just the `host_permissions` manifest key. An extension with a clean `host_permissions: []` but broad content-script `matches` will still trip the in-depth review queue.

**Practical consequence for this factory:** the review-speed recipe (`optional_host_permissions` + runtime `chrome.permissions.request()`) only works if `content_scripts.matches` is also tightly scoped. Use `chrome.scripting.executeScript` with `activeTab` for user-invoked injection instead of declaring broad `content_scripts` in the manifest.

This quote is the direct statement of a rule that is **not** written on `developer.chrome.com` — the [review-process page](https://developer.chrome.com/docs/webstore/review-process) mentions broad host permissions but never spells out that content-script matches are evaluated the same way. The advice only exists in DevRel forum replies and community writeups.

## Raw content

<!--
JS-rendered Google Group thread. This file currently contains only the load-bearing
quote (surfaced above). To backfill the full thread:

1. Open the thread URL in a browser.
2. Wait for posts to render.
3. File → Save Page As → Webpage, HTML only → thread.html
4. Run: npm run capture:source -- --url <thread_url> --type=forum --from-file ./thread.html
5. Re-run: npm run index:sources

The backfilled capture should replace this file; keep the file path stable so
docs/ citations don't break.
-->

## Post — Simeon Vincent (Chrome DevRel) — date unknown

<!-- Post anchor within the thread; exact post URL unknown until thread is fully captured. -->

> your 'content_scripts' can also affect reviews. Specifically, the 'matches' field.

_Quoted verbatim as cited in docs/09-cws-best-practices.md. Surrounding context and reply chain pending full thread capture._
