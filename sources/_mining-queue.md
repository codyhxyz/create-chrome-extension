# Mining Queue — start here

**This is the TODO list for the knowledge pipeline.** When you come back to this project and want to grow the `sources/` tree, work the queue top-to-bottom. Each batch is sized to fit in one session.

Discovery artifacts that fed this queue:
- [`_discovery/2026-04-16_forum-ranking.md`](_discovery/2026-04-16_forum-ranking.md) — forums, Q&A, issue trackers
- [`_discovery/2026-04-16_blog-ranking.md`](_discovery/2026-04-16_blog-ranking.md) — community blogs

## How to work this queue

- Each checkbox is one capture. Mark `[x]` when the file lands under `sources/`.
- Capture-method annotations:
  - **(auto)** — `npm run capture:source -- <url> --type=<t>` Just Works.
  - **(browser-save)** — JS-rendered or blocked; in your browser do File → Save As → Webpage HTML only → run `--from-file=<path>` in the capture command.
  - **(manual)** — paywall / anti-bot / Cloudflare; open in browser, copy-paste into a template from `_templates/`.
- After each batch: `npm run index:sources` to regenerate `_index/`.
- When the queue empties, run a fresh discovery pass (see "Next discovery passes" at the bottom).

---

## Batch 1 — Load-bearing backfills (do first)

Captures `docs/09-cws-best-practices.md` already depends on. Finishing these unblocks retrofitting inline URLs in `docs/09` to `sources/` references.

- [ ] **Backfill Google Group `S1_uqpDFVzY`** — replace the stub at `sources/forums/2026-04-16_google-group_content-scripts-matches-review.md` with full thread content. **(browser-save)**
  URL: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/S1_uqpDFVzY
- [ ] **Alex MacArthur — "Avoiding a Host Permission Review Delay"** — the single most cross-cited community post on the activeTab pattern. **(auto)**
  URL: https://macarthur.me/posts/chrome-extension-host-permission/

## Batch 2 — Tier-S forum: chromium-extensions Google Group

The hub. Every other venue cross-links here. All require **(browser-save)** because Google Groups is JS-rendered.

- [ ] **`k5upFLVnPqE`** — SW keepalive + alarms, Oliver Dunk's canonical answer on registering event listeners at top-level.
  URL: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/k5upFLVnPqE
- [ ] **`BrwVKyIvCMs`** — review times + deferred publishing, Deco (Chrome team) answer.
  URL: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/BrwVKyIvCMs
- [ ] **`POU6sW-I39M`** — auto-update SW race condition, 80+ posts over 4 years, Chrome team engaged.
  URL: https://groups.google.com/a/chromium.org/g/chromium-extensions/c/POU6sW-I39M
- [ ] **Rejection-code sweep** — for each code below, Google `site:groups.google.com/a/chromium.org/g/chromium-extensions "<code>"` and capture the top 1–2 hits. Codes: Blue Argon, Blue Nickel, Blue Potassium, Purple Lithium, Purple Nickel, Purple Magnesium, Purple Copper, Red Titanium, Red Zinc, Red Nickel, Red Potassium, Red Silicon, Yellow Zinc, Yellow Argon, Yellow Lithium, Yellow Nickel, Yellow Potassium, Grey Titanium.
- [ ] **Oliver Dunk recent responses** — if the Group search supports filtering by poster, capture top 5 recent. Otherwise grep from the first few rejection-code captures for his replies and follow the thread IDs.

## Batch 3 — Tier-S blog: Wladimir Palant (Almost Secure)

**Gap in `docs/09`.** Palant is the most credible extension-security researcher on the internet — adblock dev since 2003, actively publishing MV3 circumvention teardowns in 2024–2025. His work inverts the rejection-code story: what extensions *actually* do to bypass policy.

- [ ] **"Chrome Web Store is a mess"** (Jan 2025) — navigate from https://palant.info/ index. **(auto)**
- [ ] **"Malicious extensions circumvent Google's remote code ban"** (2024). **(auto)**
- [ ] **His extension-tag post index** — capture as a reference page to surface follow-up posts.

## Batch 4 — Tier-S blog: Matt Frisbie

Author of the only up-to-date book on browser extensions (2nd ed. Sept 2025). Prompt API + User Scripts + Offscreen coverage.

- [ ] **Frisbie Substack — 3-part malicious extension series.** Capture all three. **(browser-save — Substack gates archive to fetch; the `/archive` endpoint did work in discovery, try that first)**
- [ ] **Frisbie — "Tracking Browser Extension Ownership"** — names an attack vector (acquired-extension auto-update) `docs/09` misses entirely. **(browser-save)**
- [ ] **`buildingbrowserextensions.com`** — if a blog exists at the book's site, capture the extension-specific posts.

## Batch 5 — Tier-S blog: Coditude (Hrishikesh Kale)

Only systematic public mapping of CWS rejection-code *families* (Blue / Purple / Red / Grey / Yellow series) with Dec 2025–Jan 2026 posts. Primary source for the color-code legend in `docs/09`.

- [ ] **All Coditude rejection-code family posts** — capture the series. **(auto — verify on first)**

## Batch 6 — Tier-S blog: Vlas Bashynskyi (bashvlas.com)

Agency owner, 40+ extension posts, strong 2024–2025 cadence.

- [ ] **"MAIN content script is like James Bond"** — directly maps to `content-script-main-world` validator rule in `docs/09`. **(auto)**
- [ ] **"Update without review"** — maps to the re-review trigger rules. **(auto)**
- [ ] **`bashvlas.com/blog` index** — capture as a directory page, triage for 5–10 more priority posts.

## Batch 7 — Tier-A blogs: known cited, promote to captures

Already inline-cited in `docs/09`; elevate to full `sources/blogs/` captures so they survive link rot.

- [ ] **Nearform — "Extension Reviews" guide** — https://nearform.com/digital-community/extension-reviews/ (canonical URL; not the `commerce.nearform.com` duplicate). **(auto)**
- [ ] **Snapfont — "Avoiding Lengthy Review Times"** — https://getsnapfont.com/posts/avoiding-lengthy-review-times-for-chrome-webstore-submissions **(auto)**
- [ ] **Stefan VD — "How to get a Chrome Extension featured"** (2024) — navigate from https://www.stefanvd.net/blog/ index, don't guess the slug (deep URLs 404). **(auto)**
- [ ] **AverageDevs — "Monetize Chrome Extensions 2025"** — 403s on WebFetch, **(manual)** copy-paste.
- [ ] **ExtensionRanker — "How to get featured"** — https://extensionranker.com/growth-faq/how-to-get-featured-in-chrome-web-store **(auto)**

## Batch 8 — Tier-S Q&A: Stack Overflow MV3 tag

Pairs with the Google Group: SO gives runnable code, Group gives the "why."

- [ ] **Top 10 highest-voted answers on `[chrome-extension-manifest-v3]`** — https://stackoverflow.com/questions/tagged/chrome-extension-manifest-v3?tab=Votes **(browser-save — SO blocks WebFetch)**
- [ ] **Top 5 answers on `[google-chrome-extension]` published since 2023.**

## Batch 9 — Tier-A: WXT framework (factory-specific)

This repo uses WXT; its Discussions are load-bearing for toolchain decisions. Not for broader CWS knowledge, but for "how does our stack handle Chrome quirks."

- [ ] **WXT Discussions — top 5 substantive threads** — https://github.com/wxt-dev/wxt/discussions — focus on threads where WXT's auto-manifest or entry-point resolution papers over a Chrome quirk. **(auto — GitHub Discussions works with fetch)**
- [ ] **Aaron Klinker's writing** — check https://wxt.dev/blog (if it exists) and any personal site for framework rationale posts. **(auto)**
- [ ] **WXT Discord invite** — confirm whether there's an official Discord. If yes, note the URL here for awareness (not capture — Discord isn't scrapable).

## Batch 10 — Chromium issue tracker (atomic citation unit)

Bug numbers pin knowledge to stable Chrome team identifiers. Requires a logged-in browser.

- [ ] **#40805401** — referenced from Group + SO. **(browser-save)**
- [ ] **#1271154** **(browser-save)**
- [ ] **#1316588** **(browser-save)**
- [ ] **Ongoing:** when a capture references a bug number, log it here instead of chasing it mid-flow.

---

## Scraping gotchas — consult when hitting resistance

| Venue | Problem | Workaround |
|---|---|---|
| Google Groups | JS-rendered; fetch returns skeleton | browser Save As → `--from-file` |
| Stack Overflow | WebFetch blocked | browser-save |
| Reddit | WebFetch blocked; site:reddit.com returns empty | browser-save, or try `/r/chrome_extensions/top.json?t=year` public endpoint (untested) |
| Chromium issue tracker | Login wall on list views | direct issue URLs in logged-in browser; `--from-file` |
| X / Twitter | 402 to WebFetch | skip as scraping target; use Mastodon mirror (`@oliverdunk@mastodon.social`) when available |
| averagedevs.com | 403 (Cloudflare) | manual copy-paste |
| secureannex.com/blog | WAF stub | logged-in browser |
| extensionpay.com/blog | intermittent 500s | retry, or manual |
| stefanvd.net | deep URLs 404 on guessed slugs | always navigate from the blog index |
| Substack archives | subscribe-gate stub to fetch | try `/archive` endpoint first, then browser-save |

**Known non-targets (don't chase):**
- No official Chrome extensions Discord exists. The Google Group IS the chat.
- `r/chromeextensions` (no underscore) is not a real subreddit — use `r/chrome_extensions` with underscore.
- Oliver Dunk's personal blog (`oliverdunk.com`) — only 2 extension posts (Nov 2022). He pivoted to developer.chrome.com/blog and the Google Group.

---

## Next discovery passes (when this queue empties)

- **Extension-framework comparative evaluation** — Plasmo, CRXJS, extension.js. Docs + Discussions for toolchain trade-offs beyond WXT-specific knowledge.
- **Big-shop MV2 → MV3 migration writeups** — Grammarly, Honey, LastPass, uBlock engineering blogs. Often have the most concrete MV3 pitfalls at scale.
- **Academic / security-research papers** — USENIX Security, IEEE S&P, CCS. Probably Tier B but one pass to confirm.
- **Google policy-update feeds** — Chrome for Developers blog RSS + Chrome policy blog. Treat as a subscription, not a one-time capture.
- **Oliver Dunk's Mastodon** — policy change announcements often land here before blog posts.
