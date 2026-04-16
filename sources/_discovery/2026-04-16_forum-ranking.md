# Forum Ranking for Chrome Extension Factory — 2026-04-16

## Methodology

Triaged 14 candidate venues by opening the recent-threads view (or, where JS-rendered/blocked, by running indirect Google queries and sampling what Google has indexed) and reading the text of 3–5 representative threads per promising venue. Evaluated each on: (1) presence of Chrome DevRel respondents, (2) volume and recency of substantive threads in 2024–2026, (3) whether specific rejection codes / error strings / version numbers appear (vs. vague hand-waving), and (4) whether the venue is cited from other venues (signal that it's the "canonical" place for a class of problem).

Blocked from direct fetch: Reddit, Stack Overflow, Chromium issue tracker (login wall), Oliver Dunk's X profile (402 paywall). For these, used WebSearch for indirect evidence; findings are tagged accordingly.

---

## Tier S — systematically mine these

### chromium-extensions Google Group
- **URL:** https://groups.google.com/a/chromium.org/g/chromium-extensions
- **Why S-tier:** This is the canonical DevRel-participated forum. Oliver Dunk (current Chrome DevRel) and Simeon Vincent (former, now Web AI) post authoritatively on service-worker lifecycle, review delays, featured-badge decisions, and policy changes. Essentially every other venue cross-links here when a rejection-code question comes up. Named rejection codes ("Blue Argon", etc.) show up as thread titles.
- **Evidence:**
  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/k5upFLVnPqE — "MV3, (inactive) service workers, and alarms". 11 posts. Oliver Dunk provides the canonical "register `chrome.alarms.onAlarm.addListener` at top level synchronously" answer that's already load-bearing in docs/09. Clean signal, dated, authoritative.
  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/POU6sW-I39M — "MV3 service worker broken after auto-update". 80+ posts over 4+ years (2021–2025). Both Simeon Vincent and Oliver Dunk respond; issue-tracker bugs #1271154 and #40805401 referenced. Unresolved race condition — exactly the kind of "official docs say it's fine but in practice it breaks" gem the factory wants.
  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/LriMvpipKPk — "Extension Rejected - Blue Argon (external code)". Community-diagnosed (no DevRel reply on this one). Shows what actually triggers Blue Argon in practice (function-constructor eval of downloaded scripts) beyond what docs/troubleshooting page says.
  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/BrwVKyIvCMs — "Extension review time. How to improve it?" Deco (Chrome team) answers. Already cited in docs/09.
  - https://groups.google.com/a/chromium.org/g/chromium-extensions/c/tfW1ninm2a8 — "What is Chrome actually reviewing during the 'Pending Review' process?" Developer self-help with concrete tips.
  - Recent thread list (last 2 weeks, as of capture) covers: review delays, featured-badge removals on updates, publisher transfers, CWS analytics, MV3 migration timeframes, dark-mode support. Oliver Dunk and Patrick Kettner visibly active.
- **Volume:** Eyeballed ~20–40 new threads/week. DevRel response rate on technical questions appears high (visible on half the threads sampled).
- **Named experts:** Oliver Dunk (@oliverdunk_, Chrome DevRel, currently active), Simeon Vincent (historical but many still-relevant posts), Deco (Chrome team), Patrick Kettner (Chrome), Stefan Van Damme (community expert — also writes stefanvd.net which is already cited). Recurring community posters worth watching: Kyle Edwards, Roberto Oneto, BoD.
- **Capture priority:** (1) Every thread whose title names a rejection code, (2) every thread where Oliver Dunk or Simeon Vincent contradicts or extends developer.chrome.com, (3) long-running service-worker bug threads (they're where workarounds get published before Chrome fixes them), (4) any "PSA:" thread from Chrome team (these are policy announcements that pre-date docs updates).

### Stack Overflow `[google-chrome-extension]` + `[chrome-extension-manifest-v3]` tags
- **URL:** https://stackoverflow.com/questions/tagged/google-chrome-extension + https://stackoverflow.com/questions/tagged/chrome-extension-manifest-v3
- **Why S-tier:** Even though direct fetch is blocked, Google search surfaces Stack Overflow answers as the top hit for virtually every specific "how do I X in MV3" query, and the answers contain exact code and Chrome version numbers. The `chrome-extension-manifest-v3` tag is the more concentrated one; `google-chrome-extension` is noisier but larger. SO is the primary venue for "official docs say X but the code pattern that actually works is Y."
- **Evidence (via indirect search since direct fetch blocked):**
  - "Manifest V3 service worker listener" consistently surfaces SO answers citing "register listeners at top-level synchronously" with runnable examples, parallel to the chromium-extensions group thread above.
  - SO cross-references chromium-extensions threads extensively — the pattern is "SO answer links to Oliver Dunk's reply in the Google Group as ground truth, then gives the concrete workaround."
  - The `wOxO`-style canonical answers (highly upvoted, often by user `wOxxOm` historically) are where the MV2→MV3 porting tricks live.
- **Volume:** Historically the single highest-volume chrome-extension forum on the internet. Dozens of new questions/week on the MV3 tag.
- **Named experts:** `wOxxOm` (legendary SO contributor on chrome-extension tag — check if still active in 2025–2026), `Rob W` (historically top), `Kaiido`. Worth confirming whether top posters have changed post-MV3.
- **Capture priority:** (1) Highest-voted answers on `chrome-extension-manifest-v3` tag (these are the distilled community solutions), (2) answers that explicitly cite "as of Chrome N" or reference issue-tracker bug numbers. **Skip** low-vote question-only threads and SO's "How do I install Chrome?"-tier dupes.
- **Gotcha:** WebFetch is blocked on stackoverflow.com. Either (a) save pages manually in browser and capture via `--from-file`, or (b) use Google search with `site:stackoverflow.com` to enumerate, but the search itself also fails from this environment — so **manual browser capture is the practical path**.

### Chromium issue tracker (issues.chromium.org)
- **URL:** https://issues.chromium.org (Extensions component)
- **Why S-tier:** The issue tracker is where Chrome team acknowledges bugs *before* they fix them — meaning it's the earliest public source on "known-broken behaviors you need to work around." Issue numbers (e.g., #40805401, #1271154, #1316588) are the lingua franca that the Google Group and SO refer back to. For the factory's "folklore that bites" knowledge, this is primary source.
- **Evidence:**
  - #40805401 — MV3 service worker broken after auto-update (referenced across multiple Google Group threads over 4 years).
  - #1271154 — earlier duplicate/companion of the same service-worker race condition.
  - #1316588 — MV3 worker stops receiving events and remains stuck.
  - Pattern: these are open, long-running, and the comments thread on each is where Chrome engineers give timelines and workarounds.
- **Volume:** Hard to estimate without login; the referenced issues span 2021–2025+ with steady activity.
- **Named experts:** Issue tracker comments typically have Chrome engineers (not just DevRel). Names surface case-by-case.
- **Capture priority:** (1) Open issues referenced by name in chromium-extensions threads, (2) issues tagged with the Extensions component that have >20 comments, (3) "Fixed in Chrome N" milestones (these give us exact version numbers for docs).
- **Gotcha:** The issue tracker renders a sign-in page to WebFetch. Must use a logged-in browser; direct issue URLs (e.g., `/issues/40805401`) are publicly viewable in-browser but not scrapable by WebFetch. Manual capture via `--from-file` required, or search by issue number on Google to get the public description.

---

## Tier A — cherry-pick threads

### Reddit r/chrome_extensions
- **URL:** https://www.reddit.com/r/chrome_extensions
- **Why A-tier:** Active developer subreddit; has the "reviewer speed rant" and "rejected for X, what now" confessional threads that the Google Group tends not to carry. Complements the Google Group by covering the emotional/process side of CWS review — "my review has been pending 18 days, what do I do" — which surfaces real timing data.
- **Evidence:** Direct fetch is blocked (Reddit 403s from WebFetch, and `site:reddit.com` searches returned no hits from this environment — indicating Google is either not indexing or the search is filtered). However the sub is known active; needs in-browser review during capture.
- **Volume:** Anecdotally 10–30 posts/week based on general knowledge; needs in-browser confirmation.
- **Named experts:** Unknown until browsed. No confirmed Chrome DevRel presence here.
- **Capture priority:** (1) Top posts (all-time and year) for review-timing anecdotes, (2) threads with >30 comments that discuss specific rejection codes, (3) monthly "show your extension" threads if they exist — often contain code/pattern advice in comments.
- **Gotcha:** WebFetch blocked on all Reddit domains (reddit.com, old.reddit.com tested). Manual in-browser capture required. Reddit also rate-limits scripted access aggressively. Tier-A, not S, because the signal-to-noise ratio is untested from this session — bump up if browsing confirms DevRel or repeat experts.

### Chrome for Developers blog — https://developer.chrome.com/blog
- **URL:** https://developer.chrome.com/blog
- **Why A-tier:** Publish-only (no comments). Announces API shipping, deprecations, and policy changes. Oliver Dunk and team post here. Not a forum, but the "what's new" feed is how you find out about things before they propagate into reference docs — and the companion Google Group often has the PSA: thread mirror.
- **Evidence:**
  - "Resuming the transition to Manifest V3" post (Nov 2023) — coordinated with PSA thread in the Group.
  - "GSoC 2025 Extensions" — acknowledges Oliver Dunk's reviews; incidentally confirms Oliver is still active.
  - Offscreen docs feature post (Jan 2023) — the Blog-then-Group propagation pattern.
- **Volume:** ~1–3 extension-related posts/month.
- **Named experts:** Oliver Dunk is the most frequent extension author. Other Chrome team authors rotate.
- **Capture priority:** (1) Any post with "Manifest V3", "web store", "review", or "policy" in the title, (2) posts announcing new APIs (offscreen, side panel, user scripts, etc.) — these define what's newly available without hitting rejection.
- **Note:** Treat as a signal source, not a discussion source. Pair each capture with the corresponding Group PSA thread.

### Twitter/X — @oliverdunk_ and adjacent Chrome DevRel accounts
- **URL:** https://x.com/oliverdunk_, plus Mastodon mirror https://mastodon.social/@oliverdunk
- **Why A-tier:** Oliver posts policy heads-ups and links to new docs/blog posts. Sometimes notes under-documented gotchas in threads before they land in docs.
- **Evidence:** Past example: "the 'offscreen documents' feature for accessing DOM APIs now has a blog post and some docs" (Jan 2023, flagged the feature to the community days before the docs refreshed). Also runs syntax.fm episode (May 2024) discussing MV3 politics and ad-blocker policy.
- **Volume:** Not scraped in this session (WebFetch returned 402 on x.com — X is gating access). Assume low-volume, high-density.
- **Named experts:** Oliver Dunk primary. Check @ChromiumDev team account. Simeon Vincent no longer on extensions.
- **Capture priority:** (1) Policy announcements, (2) links to Group PSA threads (use those as the canonical capture, not the tweet), (3) threads where Oliver replies to developer complaints with specifics.
- **Gotcha:** X gates to logged-in only; WebFetch returns 402. Must capture via browser or rely on Mastodon mirror if he cross-posts.

### WXT GitHub Discussions
- **URL:** https://github.com/wxt-dev/wxt/discussions
- **Why A-tier for this factory specifically:** This is the framework the factory uses. Discussions (200+ threads) cover real integration pain (bundler choices, asset handling, dev-mode HMR). Not a source for CWS review knowledge, but an essential source for "how does the toolchain the factory depends on handle this." Tier A because it's load-bearing for the repo's specific stack, not for the broader Chrome extension knowledge layer.
- **Evidence:** Recent threads on Puppeteer integration, Solid + Supabase auth, SW not showing in devtools. Moderate activity.
- **Volume:** ~5–10 new discussions/week.
- **Named experts:** Aaron Klinker (WXT maintainer) is the authority. Worth confirming whether there's a WXT Discord too — community reports "active Discord" but I didn't confirm the invite link in this session.
- **Capture priority:** (1) Threads where WXT's auto-manifest or config papers over a Chrome quirk the user didn't realize, (2) reports of Chrome-specific bugs that WXT surfaces.

---

## Tier B — occasional gems, don't invest heavily

### Hacker News
- **URL:** https://news.ycombinator.com + search
- **Why B-tier:** Very occasionally carries substantive extension threads — usually on policy shifts (Manifest V3 deprecation, ad-blocker impact) rather than implementation details. Comments can be high-quality but are often political rather than technical.
- **Capture priority:** Only threads with 100+ comments that lead with a technical post (not a news article). Otherwise skip.

### Plasmo GitHub Discussions — https://github.com/PlasmoHQ/plasmo/discussions
- **Why B-tier:** Active but Plasmo-specific (competing framework). Useful as a contrast for "how does Plasmo solve X that WXT punts on" and sometimes surfaces Chrome gotchas too. Multi-page discussions exist; many unanswered.
- **Capture priority:** Only cross-framework issues (service worker, MV3 CSP) that apply regardless of framework.

### CRXJS GitHub Discussions — https://github.com/crxjs/chrome-extension-tools/discussions
- **Why B-tier:** Smaller than WXT/Plasmo but has a body of discussions back to 2020. Good for edge cases in MV3 build pipelines (web_accessible_resources compilation, service worker registration, HMR). Many unanswered.
- **Capture priority:** Issues referencing specific Chrome version numbers or manifest behaviors.

### dev.to / Medium blog-post aggregators
- **Why B-tier:** Blog posts, not forums. The "Chrome Web Store Rejection Codes" post on dev.to by `bdilip48` is a useful third-party enumeration; the Medium post by the same author duplicates it. Ecostack has a solid Firebase + Blue Argon writeup. But these are not discussion venues — already covered by capturing specific URLs in `sources/blogs/` when individual posts carry signal.

---

## Tier C / Skip — noise or dead

- **r/chromeextensions (no underscore):** Could not confirm exists as an active subreddit; searches returned nothing. Skip — use `r/chrome_extensions` with the underscore.
- **Official Chrome Developers Discord:** Does not exist. The "Discord for live discussions about Extensions (300 members)" thread (https://groups.google.com/a/chromium.org/g/chromium-extensions/c/z-FKdoKjSEU) was a community initiative by "Charlie Mike" in Oct 2023; invite reported dead within weeks, no DevRel participation. Skip.
- **Chrome for Developers blog comments:** No comment section. The blog is a publish-only source — already covered in Tier A as a one-way signal, not a discussion venue.
- **Google Chrome Help Community (support.google.com/chrome):** End-user support only. Skip for developer knowledge — confirmed by the one relevant-looking thread ("This extension violates the Chrome Web Store policy") which offered no technical resolution beyond "contact support."
- **Softonic, Beebom, Make Tech Easier, AddictiveTips:** Ranking/SEO content farms. Skip entirely.

---

## Cross-references noticed

- **The chromium-extensions Google Group is the hub.** SO answers link into it; blog posts (MacArthur, Nearform, Snapfont, Ecostack) quote it; the Chrome for Developers blog mirrors its PSA threads. The Group is where canonical statements are *first made*; everything else is downstream of it.
- **SO + Google Group form a tight pair.** SO gives runnable code; the Group gives the authoritative "why." Capturing one without the other tends to leave either the "what to do" or the "why it's actually right" missing.
- **Chromium issue-tracker numbers are the atomic citation unit.** Both Group and SO reference bug numbers like `#40805401`. A knowledge-layer entry that pins to a bug number survives longer than one that pins to a Group thread because bug numbers are stable Chrome team identifiers.
- **Alex MacArthur's "Avoiding a Host Permission Review Delay" post** is linked from both Nearform's guide and multiple Group threads — it's the single most-cited community writeup of the activeTab pattern. Already captured via inline citation in `docs/09`; elevate to a full `sources/blogs/` capture.
- **Rejection codes (Blue Argon, Purple Lithium, etc.) surface only on the Group and in community enumerations (dev.to, Coditude, Medium).** The developer.chrome.com troubleshooting page lists codes but not concrete cause→code mappings — those mappings exist only in the Group and community posts.

---

## Recommended next step

**Mine the chromium-extensions Google Group first.** Concretely:

1. Capture the three threads that already came up in this triage as named references from the distilled docs: `k5upFLVnPqE` (SW + alarms, Oliver Dunk answer), `BrwVKyIvCMs` (review time, Deco answer, already partly cited), `S1_uqpDFVzY` (content-script matches, already a stub in `sources/forums/`). These are load-bearing and the stub needs backfilling.
2. Next, enumerate threads whose title contains a rejection-code name (Blue Argon, Yellow Zinc, Purple Lithium, Red Titanium, etc.) via Google site: queries — capture the first 10–15 hits. That maps the folklore layer of `docs/09` onto primary evidence.
3. Third, enumerate threads where Oliver Dunk is a respondent (filter by poster if the Group search allows). Each one is candidate signal.

**Scraping gotchas for the capture step:**
- Google Groups is JS-rendered; `fetch` returns a skeleton. Use browser "Save As" → `capture:source --from-file` per the existing `sources/README.md` workflow. Already solved — reuse it.
- Stack Overflow is blocked from WebFetch in this environment. Manual browser capture required. Rate limit is generous if you're logged out; don't loop a scraper.
- Reddit is blocked from WebFetch *and* `site:reddit.com` searches return empty from this environment. Either capture manually in-browser or use the public `.json` endpoint (`https://www.reddit.com/r/chrome_extensions/top.json?t=year`) — which may or may not work from the capture script; worth a one-shot test.
- Chromium issue tracker requires a logged-in browser; WebFetch hits a sign-in wall. Manual capture via `--from-file` is the only path.
- X gates all profile views behind login and returns 402 to WebFetch. Skip X as a scraping target; capture specific tweets only when linked from other venues, and rely on Mastodon mirror where available.
