#!/usr/bin/env node
// Drive the Chrome Web Store developer dashboard in the user's own, signed-in
// Chrome. Covers what the CWS API cannot: the detailed description, homepage /
// support URLs, review status, cancelling a review, saving and submitting, and
// arbitrary dashboard JS (Privacy tab checkboxes, rejection text, ...).
//
// Why AppleScript: browser-automation extensions (Claude in Chrome included)
// are blocked from chrome.google.com/webstore by Chrome itself. Chrome's
// "Allow JavaScript from Apple Events" is not. macOS only.
//
// Usage (every command prints one JSON object):
//   node cws-dashboard.mjs doctor
//   node cws-dashboard.mjs status        <itemId>
//   node cws-dashboard.mjs get           <itemId>
//   node cws-dashboard.mjs set           <itemId> [--description-file f] [--homepage url] [--support url] [--cancel-review]
//   node cws-dashboard.mjs cancel-review <itemId>
//   node cws-dashboard.mjs save          <itemId>
//   node cws-dashboard.mjs submit        <itemId> [--no-auto-publish]
//   node cws-dashboard.mjs js            <itemId> <tab> <file|->     tab: edit | package | privacy | distribution
//
// `set` only fills the form. Follow it with `save`, then `submit` when the
// change should go live. Nothing here uploads a package; use the CWS API for that.
//
// Read-only: doctor, status, get. Mutating: set (with --cancel-review), save,
// submit, cancel-review, js (arbitrary code, assume it mutates). Add --dry-run
// (or CWS_DRY_RUN=1) to any mutating command to read the page and report what
// it would do (diff, button enabled?, blockers) without filling or clicking.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DEVCONSOLE = "https://chrome.google.com/webstore/devconsole";
const [, , cmd, itemId, ...argv] = process.argv;
const DRY_RUN = argv.includes("--dry-run") || /^(1|true|yes)$/i.test(process.env.CWS_DRY_RUN || "");
const rest = argv.filter((a) => a !== "--dry-run");

function out(obj, code = 0) {
  process.stdout.write(JSON.stringify(obj, null, 2) + "\n");
  process.exit(code);
}

function fail(error, hint) {
  out({ ok: false, error, ...(hint ? { hint } : {}) }, 1);
}

function flag(name) {
  const i = rest.indexOf(name);
  return i === -1 ? undefined : rest[i + 1];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── AppleScript plumbing ────────────────────────────────────────────────────

function osa(script, ...args) {
  try {
    return execFileSync("osascript", ["-", ...args], { input: script, encoding: "utf8", timeout: 60_000 }).trim();
  } catch (e) {
    const msg = String(e.stderr || e.message);
    if (/JavaScript.*(turned off|Apple Events)|-1723|not allowed/i.test(msg)) {
      fail("chrome-js-from-apple-events-off",
        "In Chrome: View > Developer > Allow JavaScript from Apple Events. Then re-run.");
    }
    if (/not authorized|-1743/i.test(msg)) {
      fail("automation-not-authorized",
        "macOS blocked this terminal from controlling Chrome. System Settings > Privacy & Security > Automation: allow it for Google Chrome.");
    }
    fail("osascript-failed", msg.slice(0, 400));
  }
}

// Find (or open) the dashboard tab for an item and section; returns nothing.
function openTab(url, match) {
  osa(`on run argv
  set u to item 1 of argv
  set m to item 2 of argv
  tell application "Google Chrome"
    if (count of windows) = 0 then make new window
    repeat with w in windows
      repeat with t in tabs of w
        if URL of t contains m then
          set URL of t to u
          return "reused"
        end if
      end repeat
    end repeat
    tell front window to make new tab at end of tabs with properties {URL:u}
    return "opened"
  end tell
end run`, url, match);
}

// Run synchronous JS in the first tab whose URL contains `match`.
function js(match, code) {
  const res = osa(`on run argv
  tell application "Google Chrome"
    repeat with w in windows
      repeat with t in tabs of w
        if URL of t contains (item 1 of argv) then return execute t javascript (item 2 of argv)
      end repeat
    end repeat
  end tell
  return "__NO_TAB__"
end run`, match, code);
  if (res === "__NO_TAB__") fail("dashboard-tab-missing");
  return res;
}

function jsJSON(match, code) {
  const raw = js(match, `JSON.stringify((function(){${code}})())`);
  try { return JSON.parse(raw); } catch { fail("bad-js-result", raw.slice(0, 300)); }
}

// ── Dashboard model ─────────────────────────────────────────────────────────

let publisher = null;

async function ensurePublisher() {
  if (publisher) return publisher;
  openTab(DEVCONSOLE, "/webstore/devconsole");
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const loc = js("/webstore/devconsole", "location.href");
    const m = loc.match(/\/devconsole\/([0-9a-f-]{36})/);
    if (m) return (publisher = m[1]);
  }
  const loc = osa(`tell application "Google Chrome" to return URL of active tab of front window`);
  if (/accounts\.google\.com/.test(loc)) fail("not-signed-in", "Sign in to the Chrome Web Store dashboard in Chrome, then re-run.");
  fail("publisher-not-found", loc);
}

const TABS = { edit: "edit", package: "edit/package", privacy: "edit/privacy", distribution: "edit/distribution" };

async function gotoItem(section = "edit") {
  if (!itemId || !/^[a-p]{32}$/.test(itemId)) fail("bad-item-id", "Pass the 32-letter extension ID.");
  const pub = await ensurePublisher();
  const path = TABS[section];
  if (!path) fail("bad-tab", Object.keys(TABS).join(" | "));
  openTab(`${DEVCONSOLE}/${pub}/${itemId}/${path}`, `${itemId}/edit`);
  // Wait for the item header (status line) and, on edit, the form.
  for (let i = 0; i < 40; i++) {
    await sleep(750);
    const ready = js(`${itemId}/edit`,
      `(document.body && /Status:/.test(document.body.innerText) && location.pathname.endsWith(${JSON.stringify(path)})) ? "1" : "0"`);
    if (ready === "1") return;
  }
  fail("dashboard-did-not-load");
}

const MATCH = () => `${itemId}/edit`;

// Shared in-page helpers, injected before each snippet.
const H = `
const $btn = (t) => [...document.querySelectorAll('button')].find(b => b.innerText.trim() === t);
const $field = (label) => [...document.querySelectorAll('input[type=text],input[type=url],textarea')].find(e => {
  let n = e; for (let k = 0; k < 7 && n; k++) { n = n.parentElement; const t = (n && n.innerText || '').trim();
    if (t && t.length < 300 && t.split('\\n')[0].trim().toLowerCase() === label.toLowerCase()) return true; }
  return false; });
const $set = (el, v) => { const p = Object.getPrototypeOf(el);
  Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v);
  for (const ev of ['input', 'change', 'blur']) el.dispatchEvent(new Event(ev, { bubbles: true })); };
const $status = () => ((document.body.innerText.match(/Status:\\s*([^\\n]+)/) || [])[1] || '').trim();
const $dialog = (needle) => [...document.querySelectorAll('[role=dialog],[role=alertdialog]')].find(d => d.innerText.includes(needle));
`;

function readListing() {
  return jsJSON(MATCH(), `${H}
    const ta = document.querySelector('textarea');
    const val = (l) => { const f = $field(l); return f ? f.value : null; };
    return {
      status: $status(),
      locked: ta ? ta.disabled : null,
      description: ta ? ta.value : null,
      homepage: val('Homepage URL'),
      support: val('Support URL'),
      promoVideo: val('Global promo video'),
      // Real errors only; field help text ("At least one is required") is always on the page.
      blockers: [...new Set(document.body.innerText.split('\\n').map(t => t.trim())
        .filter(t => t && t.length < 200 && /may not edit|unable to publish|is invalid|please (fix|provide|add)|must (be|have|add)/i.test(t)))].slice(0, 8),
    };`);
}

async function waitStatus(pred, ms = 20000) {
  for (let t = 0; t < ms; t += 1000) {
    await sleep(1000);
    const s = js(MATCH(), `${H} $status()`);
    if (pred(s)) return s;
  }
  return js(MATCH(), `${H} $status()`);
}

// ── Commands ────────────────────────────────────────────────────────────────

async function main() {
  if (process.platform !== "darwin") fail("macos-only", "Hand dashboard steps to the user on this platform.");

  switch (cmd) {
    case "doctor": {
      const running = osa(`tell application "System Events" to (name of processes) contains "Google Chrome"`);
      if (running !== "true") fail("chrome-not-running", "Open Google Chrome and sign in to the CWS dashboard.");
      const pub = await ensurePublisher();
      out({ ok: true, publisher: pub, note: "Chrome accepts JavaScript from Apple Events and the dashboard is signed in." });
    }

    case "status": {
      await gotoItem("edit");
      const l = readListing();
      await gotoItem("package");
      const versions = jsJSON(MATCH(), `${H}
        return [...document.body.innerText.matchAll(/Version\\s+(\\d+(?:\\.\\d+){0,3})/g)].map(m => m[1]);`);
      out({ ok: true, itemId, status: l.status, locked: l.locked, versions, blockers: l.blockers });
    }

    case "get": {
      await gotoItem("edit");
      out({ ok: true, itemId, ...readListing() });
    }

    case "set": {
      const descFile = flag("--description-file");
      const homepage = flag("--homepage");
      const support = flag("--support");
      if (!descFile && !homepage && !support) fail("nothing-to-set", "--description-file, --homepage or --support");
      const description = descFile ? readFileSync(descFile, "utf8").replace(/\s+$/, "") : null;
      if (description && description.length > 16000) fail("description-too-long", `${description.length} > 16000`);

      await gotoItem("edit");
      let l = readListing();
      if (DRY_RUN) {
        if (l.locked && !rest.includes("--cancel-review")) {
          fail("listing-locked", `Status "${l.status}": a real run would stop here. Add --cancel-review to cancel the review first.`);
        }
        const change = (from, to) => (to === null || to === undefined ? undefined : { from, to, changes: from !== to });
        out({
          ok: true, dryRun: true, itemId, status: l.status,
          wouldCancelReview: !!l.locked,
          changes: {
            description: description === null ? undefined
              : { fromLength: (l.description || "").length, toLength: description.length, changes: (l.description || "") !== description },
            homepage: change(l.homepage, homepage),
            support: change(l.support, support),
          },
          note: "Nothing was filled or clicked.",
        });
      }
      if (l.locked) {
        if (!rest.includes("--cancel-review")) {
          fail("listing-locked", `Status "${l.status}": the listing can't be edited while in review. Re-run with --cancel-review (the uploaded package stays in the draft), then save and submit again.`);
        }
        await cancelReview();
        await gotoItem("edit");
        l = readListing();
        if (l.locked) fail("still-locked", l.status);
      }
      const res = jsJSON(MATCH(), `${H}
        const r = {};
        const d = ${JSON.stringify(description)}, h = ${JSON.stringify(homepage ?? null)}, s = ${JSON.stringify(support ?? null)};
        if (d !== null) { const ta = document.querySelector('textarea'); $set(ta, d); r.description = ta.value.length; }
        if (h !== null) { const f = $field('Homepage URL'); if (!f) return { error: 'no Homepage URL field' }; $set(f, h); r.homepage = f.value; }
        if (s !== null) { const f = $field('Support URL'); if (!f) return { error: 'no Support URL field' }; $set(f, s); r.support = f.value; }
        const b = $btn('Save draft'); r.saveEnabled = !!b && !b.disabled;
        return r;`);
      if (res.error) fail(res.error);
      out({ ok: true, itemId, filled: res, next: "Run `save`, then `submit` to send it for review." });
    }

    case "cancel-review": {
      await gotoItem("edit");
      if (DRY_RUN) {
        const l = readListing();
        out({ ok: true, dryRun: true, itemId, status: l.status, inReview: !!l.locked,
          would: l.locked ? "cancel the review (the uploaded package stays in the draft)" : "nothing: the item is not in review" });
      }
      out({ ok: true, itemId, status: await cancelReview() });
    }

    case "save": {
      await gotoItem("edit");
      if (DRY_RUN) {
        const s = jsJSON(MATCH(), `${H}
          const b = $btn('Save draft'); return { status: $status(), saveEnabled: !!b && !b.disabled };`);
        out({ ok: true, dryRun: true, itemId, ...s,
          would: s.saveEnabled ? "click Save draft" : "fail: Save draft is disabled (nothing changed, or the item is in review)" });
      }
      const r = jsJSON(MATCH(), `${H}
        const b = $btn('Save draft'); if (!b) return { error: 'no Save draft button' };
        if (b.disabled) return { error: 'Save draft is disabled (nothing changed, or the item is in review)' };
        b.click(); return { clicked: true };`);
      if (r.error) fail(r.error);
      await sleep(4000);
      // Reload and read back, so "saved" means the server has it.
      await gotoItem("edit");
      const l = readListing();
      out({ ok: true, itemId, status: l.status, descriptionLength: (l.description || "").length, homepage: l.homepage, support: l.support });
    }

    case "submit": {
      await gotoItem("edit");
      const auto = !rest.includes("--no-auto-publish");
      if (DRY_RUN) {
        const s = jsJSON(MATCH(), `${H}
          const b = $btn('Submit for review');
          return { status: $status(), submitEnabled: !!b && !b.disabled,
            blockers: b && b.disabled ? [...document.body.innerText.matchAll(/[^\\n]*(?:required|must|missing|may not)[^\\n]*/gi)].map(m=>m[0]).slice(0,6) : [] };`);
        out({ ok: s.submitEnabled, dryRun: true, itemId, autoPublish: auto, ...s,
          would: s.submitEnabled ? "click Submit for review and confirm the dialog" : "fail: Submit for review is disabled" }, s.submitEnabled ? 0 : 1);
      }
      const r = jsJSON(MATCH(), `${H}
        const b = $btn('Submit for review'); if (!b) return { error: 'no Submit for review button' };
        if (b.disabled) return { error: 'Submit for review is disabled', blockers: [...document.body.innerText.matchAll(/[^\\n]*(?:required|must|missing|may not)[^\\n]*/gi)].map(m=>m[0]).slice(0,6) };
        b.click(); return { clicked: true };`);
      if (r.error) fail(r.error, r.blockers);
      await sleep(2500);
      const c = jsJSON(MATCH(), `${H}
        const d = $dialog('for review?'); if (!d) return { error: 'no confirmation dialog' };
        const cb = d.querySelector('input[type=checkbox]');
        if (cb && cb.checked !== ${auto}) cb.click();
        const go = [...d.querySelectorAll('button')].find(b => /^submit for review$/i.test(b.innerText.trim()));
        if (!go) return { error: 'no confirm button' };
        go.click(); return { autoPublish: cb ? cb.checked : null };`);
      if (c.error) fail(c.error);
      const status = await waitStatus((s) => /pending/i.test(s));
      out({ ok: /pending/i.test(status), itemId, status, autoPublish: c.autoPublish });
    }

    case "js": {
      const [section, file] = rest;
      if (!section || !file) fail("usage", "js <itemId> <edit|package|privacy|distribution> <file|->");
      if (DRY_RUN) {
        out({ ok: true, dryRun: true, itemId, would: `run ${file === "-" ? "stdin" : file} on the ${section} tab`,
          note: "js runs arbitrary code, so --dry-run does not execute it, not even reads." });
      }
      await gotoItem(section);
      const code = readFileSync(file === "-" ? 0 : file, "utf8");
      out({ ok: true, itemId, result: js(MATCH(), `${H}\n(function(){${code}\n})()`) });
    }

    default:
      fail("usage", "doctor | status | get | set | cancel-review | save | submit | js   (see header of this file)");
  }
}

async function cancelReview() {
  const r = jsJSON(MATCH(), `${H}
    const more = $btn('more_vert'); if (!more) return { error: 'no item menu' };
    more.click();
    const item = [...document.querySelectorAll('[role=menuitem],button,li,span')].find(e => (e.innerText || '').trim() === 'Cancel review');
    if (!item) return { error: 'no Cancel review in the menu (not in review?)' };
    item.click(); return { opened: true };`);
  if (r.error) fail(r.error);
  await sleep(1500);
  const c = jsJSON(MATCH(), `${H}
    const d = $dialog('cancel the review'); if (!d) return { error: 'no confirmation dialog' };
    [...d.querySelectorAll('button')].find(b => b.innerText.trim() === 'Cancel review').click(); return { confirmed: true };`);
  if (c.error) fail(c.error);
  return waitStatus((s) => !/pending/i.test(s));
}

main().catch((e) => fail("unexpected", String(e && e.stack || e)));
