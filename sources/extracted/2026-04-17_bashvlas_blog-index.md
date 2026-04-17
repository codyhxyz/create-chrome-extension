---
extracts:
  - sources/blogs/2026-04-17_bashvlas_blog-index.md
extracted_at: 2026-04-17
title: "Bashvlas blog index: directory listing (capture-candidate triage)"
author: Vlas Bashynskyi
url: https://bashvlas.com/blog
evidence_class: c
topics:
  - index
  - capture-candidates
feeds_docs: []
---

# Bashvlas blog index — directory page; top capture candidates triaged for next discovery pass

## TL;DR

This capture is a blog index/directory page, not a substantive post. It lists ~20 posts by Vlas Bashynskyi, a working Chrome extension developer, mixing technical deep-dives with extension product showcases. The useful output of this extraction is a triaged shortlist of which individual posts are worth capturing in the next discovery pass — prioritized by titles that name specific MV3/CWS/extension-architecture topics rather than product showcases.

## Signal

The index's structural split:
- **Technical posts worth capturing** — named topics on extension internals, API behavior, distribution mechanics.
- **Product showcases** — "Amachete," "eversign," "Sponge," "WeVPN," "Wein-Plus," etc. — individual extension profiles, mostly promotional, low factory value.

**Top capture candidates** (ranked by title-level specificity to MV3/CWS/extension-development topics):

1. **"How to Make a Chrome Extension - The Ultimate Guide"** (`/blog/how-to-make-a-chrome-extension`, April 12, 2023) — self-described as "all the best practices learned and tested over several years." High priority; likely has broad coverage overlapping multiple `docs/09` sections.

2. **"How to share access to a chrome extension?"** (`/blog/chrome-extension-share-access`, April 12, 2023) — covers adding collaborators and letting others publish on your behalf. Directly relevant to `docs/`-adjacent submission/ownership topics and thin public coverage elsewhere.

3. **"Can Chrome Extensions Open Popups Without User Interaction?"** (`/blog/can-chrome-extensions-open-popups`, June 11, 2024) — MV3-era UX/permission-gesture question with a non-obvious answer (per the teaser, "depends on how you define 'popup'"). Useful for content-script UI patterns.

4. **"Make Your Chrome Extension Lightning Fast"** (`/blog/make-your-chrome-extension-lightning-fast`, April 12, 2023) — on using MutationObserver for DOM-reactive content scripts. Directly relevant to `utils/observer.ts` patterns in the factory.

5. **"7 Reasons To Use Iframes in Chrome Extensions"** (`/blog/reasons-to-use-iframes-in-chrome-extensions`, April 12, 2023) — advocates iframes over Shadow DOM / custom elements for isolation. Contrarian to the factory's current `utils/dom.ts` Shadow DOM approach; worth capturing to evaluate the tradeoff.

Also of potential interest (lower priority):
- **"Third Party Cookies Blocked - Explained"** (Nov 6, 2023) — covers a user-facing warning, borderline relevance.
- **"Chrome Extension for Twitter"** — video on reading like-data; niche but may surface a content-script pattern.

The **product-showcase posts** (Amachete, eversign, Sponge, SIFT, GrowFlare, Snowplow Analytics Debugger, Annotate Meet, Pomodoro, Robots Exclusion Checker, Wein-Plus, WeVPN, Sumthing, Vimeo Record critique, Google Meet Full Screen) are not capture candidates for the factory's extraction pipeline — they're promotional writeups for specific extensions.

## Key quotes

> "In this blog you can find a collection of articles by experienced chrome extension developers. Here you can find out about best practices, common mistakes and pitfalls discovered in real world."
> — Vlas Bashynskyi (blog index intro)

## Implications for the factory

- **Not applicable directly** — this is an index page. The output of this extraction is the triaged capture-candidate list above, which should be folded into `sources/_mining-queue.md` during the next discovery pass (not done in this extraction pass per task constraints).

## Provenance

- **Raw capture:** [`../blogs/2026-04-17_bashvlas_blog-index.md`](../blogs/2026-04-17_bashvlas_blog-index.md)
- **Original URL:** https://bashvlas.com/blog
- **Wayback:** https://web.archive.org/web/20260417002149/https://bashvlas.com/blog
- **Already captured from this author:** `sources/blogs/2026-04-17_bashvlas_main-content-script-james-bond.md`, `sources/blogs/2026-04-17_bashvlas_update-without-review.md` (both already in the capture set; confirm no overlap with the candidates above during the next mining pass).
