# Blog Ranking for Chrome Extension Factory — 2026-04-16

## Methodology

Triaged ~25 candidate blogs by opening the post index (or, where blocked, using targeted Google searches against the domain to enumerate indexed posts), then reading 2–3 representative posts from each promising venue. Evaluated each on: (1) freshness of extension-relevant posts in 2023–2026, (2) author's track record (shipped extensions, framework authorship, DevRel role, security research), (3) specificity — do posts name rejection codes, Chrome version numbers, bug IDs, runnable code? — and (4) cross-citation from other blogs / the Google Group / docs/09. Blocked from direct fetch: `averagedevs.com` (403 on root + `/blog`), `secureannex.com` (WAF stub page only), `extensionpay.com/blog` (500). For these, reconstructed the post list via Google `site:` queries.

---

## Tier S — systematically mine these

### Almost Secure — Wladimir Palant
- **URL:** https://palant.info/articles/
- **Author:** Wladimir Palant. Co-founder of eyeo (Adblock Plus), extension developer since 2003, the single most prolific and credible Chrome-extension security researcher on the open internet. Actively publishing in 2024–2026.
- **Why S-tier:** This is the security/policy *truth layer*. Palant writes teardowns that name specific extensions, specific CSP bypass techniques, and specific enforcement failures by Google. His 2025 post "Malicious extensions circumvent Google's remote code ban" is the canonical write-up of *how* MV3's remote-code rules are being bypassed in production — directly load-bearing for anything the factory's validator wants to catch. His "Chrome Web Store is a mess" (Jan 2025) is cited by The Register and is the reason developers are getting unpredictable rejections — read it before writing any doc about CWS review.
- **Evidence:**
  - https://palant.info/2025/01/20/malicious-extensions-circumvent-googles-remote-code-ban/ — names the precise patterns that *do* get through Blue Argon review, inverting the rejection-code story.
  - https://palant.info/2025/01/13/chrome-web-stores-is-a-mess/ — the reviewer-inconsistency post; tells you why two identical submissions can get opposite outcomes.
  - https://palant.info/2025/01/08/how-extensions-trick-cws-search/ — keyword-stuffing patterns that map exactly onto Yellow Argon.
  - https://palant.info/2025/02/03/analysis-of-an-advanced-malicious-chrome-extension/ — concrete code of what a determined evader does.
  - https://palant.info/2023/06/02/how-malicious-extensions-hide-running-arbitrary-code/ — foundational; the patterns here are what reviewers *should* be catching, so they're what honest devs should avoid accidentally resembling.
- **Recent activity:** Feb 2025 most recent extension post; consistent monthly cadence 2023–2025.
- **Capture priority:** (1) All 2024–2025 posts with "Chrome Web Store" or "extensions" in the title, (2) the 2023 "malicious extension" cluster (May–June 2023 has 5 posts in a row), (3) any post Palant publishes after a reported supply-chain attack — he's usually the first forensic writeup.

### Matt Frisbie — `!important` Substack + buildingbrowserextensions.com
- **URL:** https://mattfrisbie.substack.com/archive, companion book site https://www.buildingbrowserextensions.com/
- **Author:** Matt Frisbie, ex-Google (AdSense, AMP), first engineer at DoorDash, author of *Building Browser Extensions* (Apress, 2nd ed. Sept 2025). The book is the only comprehensive published reference covering MV3 + Side Panel + Offscreen + User Scripts + Prompt API. The Substack is the book's overflow.
- **Why S-tier:** Uniquely covers three angles the factory needs: (a) the ugly monetization reality, (b) extension ownership transfer / supply-chain attack patterns, (c) the malicious-extension threat model from a developer's perspective (not just a security researcher's). "Tracking Browser Extension Ownership" (Mar 2024) is the atomic reference for why a clean-looking extension suddenly turns malicious on auto-update — this is a *publisher-facing* concern docs/09 barely touches. The 2nd-edition book's Chapter 13 ("Publishing and the review process") covers rejection-code categories from a developer's seat.
- **Evidence:**
  - https://mattfrisbie.substack.com/p/tracking-browser-extension-ownership (Mar 2024) — the ownership-transfer vector.
  - https://mattfrisbie.substack.com/p/lets-talk-about-malicious-browser — 3-part series Oct 2024 / Feb 2025 / Mar 2025 covering threat model, enterprise mitigation, detection.
  - https://mattfrisbie.substack.com/p/the-ugly-business-of-monetizing-browser — real numbers on monetization and what the sketchy actors do.
  - https://mattfrisbie.substack.com/p/announcing-the-2nd-edition-of-building (Sept 2025) — lists what's new in MV3 land (Prompt API, User Scripts, refreshed Offscreen coverage).
  - https://www.buildingbrowserextensions.com/chrome-extension-manifest-v2-to-v3 — public chapter excerpt on V2→V3.
- **Recent activity:** Oct 2025 most recent post.
- **Capture priority:** (1) The 3-part malicious extension series, (2) ownership-tracking post, (3) the monetization post (complements the averagedevs 2025 guide), (4) the public chapter excerpts on buildingbrowserextensions.com.

### Alex MacArthur — macarthur.me
- **URL:** https://macarthur.me/posts/
- **Author:** Alex MacArthur, independent web developer, builds TypeIt, PicPerf, JamComments. One published Chrome extension post but it's already load-bearing in docs/09.
- **Why S-tier:** The single most-cited third-party writeup of the `activeTab` + runtime-host-permission pattern. Nearform cites it. Stack Overflow answers cite it. Multiple Google Group threads cite it. Low volume but high density — this is the canonical community post that assembles what developer.chrome.com splits across five pages.
- **Evidence:**
  - https://macarthur.me/posts/chrome-extension-host-permission/ (Nov 20 2024) — the one post; already referenced 3+ times in docs/09.
- **Recent activity:** Nov 2024 for extension content; author otherwise writing on perf / CSS / TS monthly.
- **Capture priority:** The single post, captured as a full `sources/blogs/` entry rather than an inline citation. **Note:** this is already flagged in the forum ranking as "elevate to full capture." Do it.

---

## Tier A — cherry-pick posts

### Coditude Insights — Hrishikesh Kale
- **URL:** https://www.coditude.com/insights/ (filter by Chrome extension category)
- **Author:** Hrishikesh Kale, posting as "Coditude" (a development consultancy). 4+ posts late 2025 through Jan 2026 systematically enumerating rejection-code families.
- **Why A-tier:** This is the single most systematic public mapping of rejection codes to causes and fixes. Coditude publishes one post per color-family (Blue, Purple, Red, Grey, Yellow, etc.) with concrete remediation steps. Named in the forum ranking as "rejection-code enumerator" — confirmed. Weakness: consultancy content-marketing tone, not battle-scarred-engineer voice. But the enumeration is real.
- **Evidence:**
  - https://www.coditude.com/insights/chrome-web-store-rejection-codes/ (Sep 30 2025) — the index post.
  - https://www.coditude.com/insights/yellow-zinc-fixing-metadata-and-listing-issues-in-chrome-extensions/
  - https://www.coditude.com/insights/understanding-purple-family-rejection-codes-resolving-user-data-privacy-issues/ (Dec 17 2025)
  - https://www.coditude.com/insights/grey-silicon-cryptomining-violations-in-chrome-extensions/ (Dec 30 2025)
  - https://www.coditude.com/insights/decoding-red-family-single-purpose-policy/ (Dec 2 2025)
  - https://www.coditude.com/insights/blue-series-prohibited-products-chrome-web-store/ (Jan 30 2026)
- **Recent activity:** Jan 30 2026 — very fresh.
- **Capture priority:** All six rejection-code posts as a single mining batch. They're sibling articles; capture them together.

### Stefan VD — stefanvd.net/blog
- **URL:** https://www.stefanvd.net/blog/
- **Author:** Stefan Van Damme. Creator of "Turn Off the Lights" (millions of users across Chrome/Firefox/Safari/Edge/Opera). Belgian dev, posts on chromium-extensions Google Group under his own name, has been featured on Google/YouTube/Mozilla blogs. One of the few authors who has actually gotten the Featured badge and writes about it.
- **Why A-tier:** First-hand publisher experience at scale. "How to get a Chrome extension featured" (April 2024) is already cited in docs/09. April 2 2026 post on 3 common rejection reasons is fresh. Weakness: SEO-optimized listicle style, not engineering-post specificity; he rarely cites Chrome version numbers or bug IDs. But the voice-of-a-publisher-who-ships signal is real.
- **Evidence:**
  - https://www.stefanvd.net/blog/2024/04/17/how-to-get-a-chrome-extension-featured/ — already cited in docs/09.
  - https://www.stefanvd.net/blog/2024/03/31/monetizing-your-chrome-extension/ (12 monetization ways)
  - https://www.stefanvd.net/blog/2024/08/12/future-of-chrome-extensions/ (AI + extensions forecast)
  - April 2 2026 post: "3 Common Browser Extension Store Mistakes That Cause Rejection + Fix" — fetch blocked (404 on slug guess), needs manual browser grab.
- **Recent activity:** April 2 2026 — very fresh.
- **Capture priority:** The 2024 featured-badge post (re-capture with current citations), the 2026 rejection-mistakes post once located, the monetization listicle.

### Ecostack — Sebastian Scheibe
- **URL:** https://ecostack.dev/posts/
- **Author:** Sebastian Scheibe (GitHub: Ecostack). Firebase/Go infrastructure engineer; extensions are an occasional topic, but the one extension post is gold.
- **Why A-tier:** The "Firebase Auth + Blue Argon" post (Dec 22 2024) is the single best concrete walk-through of a Blue Argon root cause (Firebase SDK's dynamic `createElement('script')`) with a working remediation (REST API wrapper, published as `firebase-auth-sdk` on NPM). This exact problem recurs in the chromium-extensions Google Group every 2–3 months. Single post, infinite reference value.
- **Evidence:**
  - https://ecostack.dev/posts/firebase-auth-chrome-extension-blue-argon/ (Dec 22 2024) — load-bearing.
  - The rest of the blog is Firebase / Go / NGINX infra; not extension content.
- **Recent activity:** The extension post is Dec 2024; blog otherwise active monthly through June 2025.
- **Capture priority:** The single post. High priority — it's the kind of post where "this is the unique thing" and you want to preserve it before link rot.

### AverageDevs — anonymous
- **URL:** https://www.averagedevs.com/blog/ (fetch-blocked; index via Google)
- **Author:** Not publicly named. Blog voice is confident first-person dev. Already cited in docs/09 for the "Licensing API can't transact new purchases" claim.
- **Why A-tier:** The 2025 monetization guide (https://www.averagedevs.com/blog/monetize-chrome-extensions-2025) is the most current full-stack monetization reference: subscriptions, SaaS backends, entitlements with offline grace period, concrete Stripe/Paddle integration patterns. Published Nov 28 2025.
- **Evidence:**
  - https://www.averagedevs.com/blog/monetize-chrome-extensions-2025 — confirmed via Google excerpt; fetch returns 403 from this environment, manual capture needed.
- **Capture priority:** Just the monetization post for now. Re-evaluate the rest of the blog on in-browser review — the fetch block makes the catalog opaque.
- **Scraping gotcha:** 403 on both root and `/blog` from WebFetch. Cloudflare or similar gate. Manual browser "Save As" is the path.

### Secure Annex blog — John Tuckner
- **URL:** https://secureannex.com/blog (fetch returns WAF stub; index via Google)
- **Author:** John Tuckner, founder of Secure Annex. Uncovered the Cyberhaven supply-chain attack of Dec 2024, the "Fire Shield" 58-extension network (6M installs), and multiple other campaigns. Works directly with Sekoia and LimaCharlie on incident response.
- **Why A-tier:** The post-mortem layer for the malicious-extension flip side. When a big extension campaign gets caught, Tuckner's blog is typically where the IOC list and extension-ID enumeration lives. Less frequent than Palant and more "enterprise defender" framed, but primary-source on several 2024–2025 incidents.
- **Evidence:** Cited by BleepingComputer, SecurityWeek, PCWorld, Hacker News. Direct posts fetch-blocked; specific URLs not enumerable from this environment without a logged-in browser.
- **Capture priority:** (1) Cyberhaven supply-chain writeup (Dec 2024), (2) Fire Shield / 58-extension network writeup, (3) any 2024–2025 post that names concrete extension IDs. These complement Palant: Palant covers consumer-side detection, Tuckner covers enterprise incident response.
- **Scraping gotcha:** Root and `/blog` return a stub page to WebFetch — the real content is behind JS rendering or a WAF. Manual browser capture required.

### ExtensionPay articles — Andrew Mummery + contributors
- **URL:** https://extensionpay.com/articles (fetch returns 500 / 403 intermittently)
- **Author:** Andrew Mummery (creator) + guest contributors. Primary maintainer of the de facto extension-payments library.
- **Why A-tier:** Specific, tactical, and the service is the most-cited third-party payments option for extensions. The "8 Chrome Extensions with Impressive Revenue" post is the only public teardown of real extension revenue numbers I've found — a useful counterweight to Stefan VD's "monetization is easy" voice.
- **Evidence:**
  - https://extensionpay.com/articles/browser-extensions-make-money
  - https://extensionpay.com/articles/extensionpay-is-the-chrome-web-store-payments-replacement
  - https://extensionpay.com/articles/add-stripe-payments-to-chrome-extensions
  - https://extensionpay.com/articles/add-paid-licenses-to-chrome-extensions
- **Capture priority:** The revenue-teardown post + one technical integration post (Stripe or license).
- **Scraping gotcha:** Endpoints intermittent; retry or manual capture.

### ExtensionRanker blog — Joseph Hu
- **URL:** https://extensionranker.com/blog
- **Author:** Joseph Hu. Former PM over multiple Chrome extensions, independent growth consultant. Already cited in docs/09 for featured-badge criteria.
- **Why A-tier:** Growth / visibility perspective, not engineering. All posts authored by one person with a consistent track record. Monthly cadence since Apr 2025. Signal is "how to get found in CWS search," which is adjacent to "how not to get rejected" but not the same.
- **Evidence:**
  - https://extensionranker.com/growth-faq/how-to-get-featured-in-chrome-web-store — already cited in docs/09.
  - "How Chrome Web Store Metrics Really Work" (Apr 25 2025) — concrete metric definitions.
  - "Chrome AI Challenge 2025: What It Means for Extension Developers" (Sep 18 2025).
  - "Why You Should Care About Chrome Web Store Ranking" (Oct 19 2025).
- **Capture priority:** Featured-badge post (re-capture), metrics post, AI Challenge post.

### Oliver Dunk — oliverdunk.com
- **URL:** https://www.oliverdunk.com/posts
- **Author:** Oliver Dunk, current Chrome DevRel engineer for Extensions. Also posts on Chrome for Developers blog and chromium-extensions Google Group (where he's the most-cited DevRel voice per the forum ranking).
- **Why A-tier, not S:** His personal blog is mostly stale — two WebExtension posts from Nov 2022, and then he pivoted most extension writing to developer.chrome.com/blog and the "What's happening in Chrome Extensions" series (monthly through 2024–2025, covered in the forum ranking under Chrome for Developers blog, Tier A). The personal blog is low-volume and not the primary venue anymore; capture the two 2022 posts for completeness but don't expect new gems.
- **Evidence:**
  - https://www.oliverdunk.com/posts/2022/11/13/testing-webextension-popup-puppeteer/
  - https://www.oliverdunk.com/posts/2022/11/13/new-action-openpopup/
- **Capture priority:** Both posts, one-time, then deprioritize.

### Vlas Bashynskyi — bashvlas.com + chromane.com
- **URL:** https://bashvlas.com/blog/
- **Author:** Vlas Bashynskyi. Experienced extension dev, runs Chromane (a paid extension development agency). 40+ posts dating back to 2023 covering real-world patterns.
- **Why A-tier:** "Update Your Chrome Extensions Without Review" (June 19 2025) and "Skip Chrome Web Store Review With Remote Config" (June 19 2024) describe the runtime-config pattern that *almost* violates Blue Argon but doesn't — useful for understanding where the edge is. "MAIN Content Script in Chrome Extensions is like James Bond" (July 2 2024) is a vivid write-up of why `world: "MAIN"` is a footgun — directly relevant to the factory's `content-script-main-world` validator. Voice is "agency owner who's shipped dozens," different signal class than both Palant (security) and Frisbie (author).
- **Evidence:**
  - https://bashvlas.com/blog/update-your-chrome-extensions-without-review/ (June 19 2025)
  - https://bashvlas.com/blog/skip-chrome-web-store-review-with-remote-config/ (June 19 2024)
  - https://bashvlas.com/blog/main-content-script-in-chrome-extensions-is-like-james-bond/ (July 2 2024)
  - https://bashvlas.com/blog/can-chrome-extensions-open-popups-without-user-interaction/ (June 11 2024)
- **Recent activity:** June 2025 most recent.
- **Capture priority:** The 4 posts above. The "update without review" one is a first-capture priority because it names a pattern that most docs don't discuss but ships in every real extension.

### Plasmo blog — Stefan Aleksic, Louis Vilgo
- **URL:** https://www.plasmo.com/blog
- **Author:** Stefan Aleksic (14 posts 2022–2023) and Louis Vilgo (3 posts 2022). Plasmo-framework team.
- **Why A-tier despite being dormant:** Plasmo is a WXT competitor, and the blog was prolific 2022–Feb 2023 before going silent. The posts from that window are still accurate on cross-framework issues: "Chromium Deep Dive: Fixing CRX_REQUIRED_PROOF_MISSING" (Apr 7 2022), "Firebase Cloud Messaging in a Chrome Extension with MV3" (June 7 2022), "Firebase Authentication with React in an MV3 Chrome Extension" (May 20 2022). These are MV3-specific pitfalls documented by the framework team that hit every extension, not just Plasmo extensions.
- **Evidence:**
  - https://www.plasmo.com/blog/post/fixing-crx-required-proof-missing
  - https://www.plasmo.com/blog/post/firebase-auth-chrome-extension
  - https://www.plasmo.com/blog/post/firebase-cloud-messaging
- **Recent activity:** Feb 9 2023 — dormant but not useless.
- **Capture priority:** The three listed posts. Do NOT mine for current MV3 state — they pre-date too many changes.

---

## Tier B — one-off captures only

### Snapfont — Shash
- **URL:** https://getsnapfont.com/posts/avoiding-lengthy-review-times-for-chrome-webstore-submissions
- **Why B-tier:** One load-bearing post (already cited in docs/09 for the "separate manifest/permission updates from listing-only updates" claim). Rest of the blog is fonts/Directus/WordPress. No ongoing extension coverage expected.
- **Capture priority:** That single post.

### Nearform — Andy Richardson
- **URL:** https://nearform.com/digital-community/extension-reviews/ (also mirrored at https://commerce.nearform.com/blog/2020/extension-reviews/)
- **Why B-tier:** The one post. Published Jun 16 2020 — MV2-era in date but the review-timing advice is still quoted. Nearform's digital-community section has been checked; no follow-ups on extensions. Already cited twice in docs/09.
- **Capture priority:** That single post. Do not expect a series.

### Marmelab — Anthony Rimet
- **URL:** https://marmelab.com/blog/2025/04/15/browser-extension-form-ai-wxt.html
- **Why B-tier:** One post, April 15 2025. "Building AI-Powered Browser Extensions With WXT" — useful specifically because it documents the first-hit pain points of WXT for a new user (manifest differences, browser-API divergence, DOM access via `scripting` API). The factory uses WXT, so this post is a solid "what goes wrong on Day 1 with this toolchain" reference. Marmelab otherwise writes about admin frameworks, not extensions.
- **Capture priority:** The single post.

### Cezar Augusto — cezaraugusto.com
- **URL:** https://cezaraugusto.com/
- **Why B-tier:** Creator of Extension.js and current Brave Software engineer. Blog is low-volume; the one Chrome-extension post, "What changes in Chrome Extension Manifest V3," is from March 2020 and predates most of what actually shipped. His current work is on extension.js.org (the framework itself). Check `/blog` on extension.js.org periodically but don't invest in a retro capture.
- **Capture priority:** Nothing from the personal blog. Track extension.js.org/blog going forward.

### Jack Steam / CRXJS — dev.to/jacksteamdev
- **URL:** https://dev.to/jacksteamdev
- **Why B-tier:** 4 posts total, all 2021–2022. Builder of CRXJS. Posts are Vite/HMR tutorials; conceptually useful for understanding how a competing toolchain solves the same problems WXT does, but MV3 has moved on since April 2022. The CRXJS GitHub Discussions (already Tier B in forum ranking) is the live venue; the dev.to posts are historical context.
- **Capture priority:** Skip. Prefer the CRXJS Discussions and docs site.

### ExtensionFast blog — Michael McGarvey
- **URL:** https://www.extensionfast.com/blog
- **Why B-tier:** Very active (60+ posts, April 2026 current), but the voice is heavily content-marketing-for-SaaS — ExtensionFast sells a build-your-extension-with-AI service. Some posts have useful specifics ("Pass the Chrome Web Store Review First Try," Mar 28 2026; "Chrome Extension Permissions," Apr 14 2026). Risk: content quality varies post-to-post; high freshness but uneven signal density.
- **Capture priority:** Spot-capture 1–2 posts max ("Pass Review First Try" and "Permissions"). Don't mine systematically.

### Extension Radar blog
- **URL:** https://www.extensionradar.com/blog
- **Why B-tier:** Same general profile as ExtensionFast. Growth/analytics SaaS content. "Why Chrome Extensions Get Rejected" (Dec 29 2025) and "Manifest V3 Migration: The Ultimate Survival Guide" (Jan 24 2026) are the candidates.
- **Capture priority:** The two posts above. Otherwise skip.

### AppBooster blog
- **URL:** https://appbooster.net/blog/
- **Why B-tier:** Another SaaS content blog, but it's the most current catalog of the new Chrome AI APIs (Prompt, Summarizer, Translator, Language Detection) as of April 2026, and it has a March 2026 "Pre-Submission Checklist." Voice is promotional, but the Chrome AI API coverage is under-covered elsewhere.
- **Capture priority:** The AI API posts (Apr 8–14 2026) for factory's AI extensions profile, and the pre-submission checklist. Skip the generic monetization/growth pieces.

### WXT blog — aklinker1
- **URL:** https://wxt.dev/blog
- **Why B-tier:** Only one post as of Dec 2024: "Introducing `#imports`" by Aaron Klinker. Low volume, but Aaron IS the WXT maintainer, so anything he publishes here is load-bearing for the factory's toolchain. Attempts to find a personal blog (aklinker1.github.io, aaronklinker.com) returned 404 / ECONNREFUSED.
- **Capture priority:** The one `#imports` post; re-check `/blog` quarterly for new posts.

### Extension.js blog — Cezar Augusto
- **URL:** https://extension.js.org/blog (exists per nav, content not verified)
- **Why B-tier:** Cezar Augusto is an active maintainer; the blog is mentioned but not yet catalogued from this session. Low confidence on whether posts exist; verify in a logged-in browser.
- **Capture priority:** Check for content; if present, capture framework-author MV3 perspective.

---

## Tier C / Skip

- **Chrome for Developers blog (developer.chrome.com/blog):** Not a community blog — already covered as Tier A in the forum ranking. Don't re-rank here.
- **Binaryfolks, Evinced, Creole Studios, other agency SEO pages:** Each domain contributed exactly one MV3 migration post, all content-marketing. No unique signal. Skip.
- **Dodo Payments / LinkedIn Pulse monetization posts:** Payment processor SEO; recycle ExtensionPay's content without adding signal. Skip.
- **Medium / dev.to rehashes:** `bdilip48`'s rejection-code enumeration on Medium and dev.to exists (already noted in forum ranking Tier B); Coditude covers the same ground more systematically. Prefer Coditude, skip the Medium/dev.to duplicates unless Coditude misses a color.
- **Duo Security / CRXcavator:** CRXcavator is retired. Historical only. Skip for current work.
- **Spin.ai blog:** Enterprise-security vendor content. John Tuckner (Secure Annex) is the primary source for this angle; Spin.ai is downstream. Skip unless a specific IOC post needs mirroring.
- **Hunters.security / Sekoia / BleepingComputer writeups of the Cyberhaven attack:** Good news-site coverage, but Palant and Tuckner are primary sources. Capture primaries, skip the news layer.

---

## Cross-references noticed

- **Palant is the security-side hub.** The Register, Hacker News, and BleepingComputer all cite him when something goes wrong with CWS moderation. He's also cited in docs/09's "folklore that bites" rationale even though no specific doc:09 claim directly attributes to him yet — that's a gap worth closing.
- **MacArthur is the engineer-side hub.** Nearform cites him, SO answers link to him, Google Group threads link to him. Already in docs/09 three times.
- **Frisbie sits between developer and security layers.** His malicious-extension 3-part series links to both Palant's posts and to specific chromium-extensions Google Group threads. Capturing Frisbie's series will pull in both forum threads and Palant posts as dependencies.
- **Coditude and Stefan VD cross-cite each other on rejection codes,** but neither cites Palant, and Palant doesn't cite either — there's a publisher/defender split in the ecosystem worth noting in synthesis.
- **Rejection-code folklore lives in three places and only three.** (1) The chromium-extensions Google Group (primary, per forum ranking), (2) Palant (adversarial perspective), (3) Coditude + Stefan VD + Ecostack (publisher perspective). The developer.chrome.com troubleshooting page lists codes but not cause→code chains; the community is doing the chain work.

## Overlap with forum ranking

- **Matt Frisbie's `!important` Substack has no native comments section,** but his 3-part malicious extensions series is mirrored back into the chromium-extensions Google Group (he cross-posts summaries). Capture the Substack post as primary, the Group thread as forum echo.
- **Palant's posts spawn Hacker News threads** (e.g., "Chrome Web Store is a mess" hit the HN front page Jan 2025). HN is Tier B in the forum ranking; capture Palant's post as primary, pick HN comment thread as secondary only if it has 100+ comments with substantive technical replies.
- **ExtensionPay articles** have no comments but the original 2021 "Doing the impossible, monetising Chrome Extensions" announcement hit Hacker News (https://news.ycombinator.com/item?id=26305789). Historical — capture the ExtensionPay article as primary.
- **Bashvlas's "MAIN content script" post** would be right at home on the chromium-extensions Google Group but isn't cross-posted there. Capture as blog-only, no forum pair.
- **Nearform** post was cross-posted as `commerce.nearform.com/blog/2020/extension-reviews/` (historical subdomain). Same content, pick the newer canonical URL.

---

## Specific posts to prioritize for the mining queue

Flat list — feeds into `sources/_mining-queue.md`:

1. https://palant.info/2025/01/20/malicious-extensions-circumvent-googles-remote-code-ban/ — how actual malicious actors beat Blue Argon; inverts the rejection-code story for our validator.
2. https://palant.info/2025/01/13/chrome-web-stores-is-a-mess/ — why two identical extensions get opposite review outcomes.
3. https://palant.info/2025/01/08/how-extensions-trick-cws-search/ — Yellow Argon in the wild.
4. https://palant.info/2023/06/02/how-malicious-extensions-hide-running-arbitrary-code/ — foundational pattern library for remote-code evasion.
5. https://mattfrisbie.substack.com/p/tracking-browser-extension-ownership — ownership-transfer attack vector, missing from docs/09.
6. https://mattfrisbie.substack.com/p/lets-talk-about-malicious-browser — part 1 of 3-part series (capture all three).
7. https://macarthur.me/posts/chrome-extension-host-permission/ — already load-bearing in docs/09; elevate to full capture.
8. https://ecostack.dev/posts/firebase-auth-chrome-extension-blue-argon/ — concrete Blue Argon cause+fix with working code.
9. https://www.coditude.com/insights/chrome-web-store-rejection-codes/ — rejection-code index.
10. https://www.coditude.com/insights/understanding-purple-family-rejection-codes-resolving-user-data-privacy-issues/ — Purple family deep-dive.
11. https://www.coditude.com/insights/decoding-red-family-single-purpose-policy/ — Red family deep-dive.
12. https://www.coditude.com/insights/blue-series-prohibited-products-chrome-web-store/ — most recent, Jan 2026.
13. https://www.stefanvd.net/blog/2024/04/17/how-to-get-a-chrome-extension-featured/ — re-capture with full citations (currently inline-cited only).
14. https://www.stefanvd.net/blog/2026/04/02/3-common-browser-extension-store-mistakes-that-cause-rejection-fix/ — fresh April 2026, manual capture needed.
15. https://bashvlas.com/blog/update-your-chrome-extensions-without-review/ — runtime-config pattern that rides the Blue Argon edge.
16. https://bashvlas.com/blog/main-content-script-in-chrome-extensions-is-like-james-bond/ — complements the `content-script-main-world` validator.
17. https://getsnapfont.com/posts/avoiding-lengthy-review-times-for-chrome-webstore-submissions — already cited; elevate to full capture.
18. https://nearform.com/digital-community/extension-reviews/ — already cited twice; elevate to full capture.
19. https://www.averagedevs.com/blog/monetize-chrome-extensions-2025 — most current monetization reference, manual capture (403 on WebFetch).
20. https://marmelab.com/blog/2025/04/15/browser-extension-form-ai-wxt.html — WXT-specific pain-point log; factory uses WXT.
