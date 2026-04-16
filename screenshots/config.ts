/**
 * Chrome Web Store screenshot configuration.
 *
 * This is the form you fill out per-extension. The screenshot renderer and
 * capture pipeline read from this array; there is no other place to configure
 * which screenshots get produced.
 *
 * Principles encoded in the type:
 *
 * - Every screenshot is 1280×800 (Chrome Web Store's recommended size).
 * - `surface` picks the extension context being framed (popup, sidepanel,
 *   options, welcome, or a content-script-in-page shot). The `BrowserFrame`
 *   component adjusts its chrome to match (narrow popup vs. full tab).
 * - `headline` + `subhead` are the copy overlay. Keep them short — this is
 *   not app-store-scale typography, it's a desktop 1280px frame.
 * - `theme` is light or dark. Each shot picks one; don't try to do both per
 *   entry. Add a second config entry if you want a dark variant.
 * - `browserUrl` is the URL shown in the frame's address bar. For popup /
 *   sidepanel / welcome shots, pick something representative of where the
 *   user would actually see them. Factory defaults are obvious placeholders.
 *
 * The factory ships 5 placeholder entries with deliberately-bad copy
 * ("Your killer feature here", URLs at "your-target-site.com"). The validator
 * rule `ship-ready-screenshots` fails ship mode until these placeholders are
 * gone, forcing real customization before submission.
 *
 * To generate PNGs: from the repo root, `npm run screenshots`.
 * To strip the screenshot pipeline entirely: delete the `screenshots/` folder.
 * The `ship-ready-screenshots` validator rule no-ops when the folder is gone.
 */

export type ScreenshotSurface =
  | 'popup'
  | 'sidepanel'
  | 'options'
  | 'welcome'
  | 'content-in-page';

export type ScreenshotTheme = 'light' | 'dark';

export interface ScreenshotConfig {
  /** Stable id. Used as filename (`<id>.png`) and in URL routes. */
  id: string;
  /** Which extension surface this screenshot frames. */
  surface: ScreenshotSurface;
  /** Light or dark browser frame + overlay palette. */
  theme: ScreenshotTheme;
  /**
   * Overlay headline. One short line — keep under 60 chars.
   * Shipping example: "Never miss a PR review again."
   */
  headline: string;
  /**
   * Overlay subhead. One clarifying sentence — keep under 120 chars.
   * Shipping example: "Highlights reviewers you've missed across every repo."
   */
  subhead: string;
  /**
   * URL shown in the fake address bar. Should be representative of where
   * the user would see this surface in practice. For popup/sidepanel shots,
   * pick the active tab's URL, not the extension URL.
   */
  browserUrl?: string;
}

/**
 * Factory-default placeholders. Change all of these before shipping.
 * The validator rule `ship-ready-screenshots` greps for these exact strings
 * and blocks `npm run check:cws:ship` until they are gone.
 */
export const screenshots: ScreenshotConfig[] = [
  {
    id: 'hero-popup',
    surface: 'popup',
    theme: 'light',
    headline: 'Your killer feature here',
    subhead: 'One sentence that sells the click. Replace this copy before shipping.',
    browserUrl: 'https://your-target-site.com',
  },
  {
    id: 'sidepanel-focus',
    surface: 'sidepanel',
    theme: 'light',
    headline: 'Your killer feature here — sidepanel',
    subhead: 'Describe what the sidepanel shows and why users keep it open.',
    browserUrl: 'https://your-target-site.com/dashboard',
  },
  {
    id: 'options-settings',
    surface: 'options',
    theme: 'light',
    headline: 'Tune it to fit your workflow',
    subhead: 'Show off the settings that matter. Replace this copy before shipping.',
    browserUrl: 'chrome-extension://your-target-site.com/options.html',
  },
  {
    id: 'welcome-onboarding',
    surface: 'welcome',
    theme: 'light',
    headline: 'First-run walkthrough',
    subhead: 'The welcome page that greets users after install. Customize the copy.',
    browserUrl: 'chrome-extension://your-target-site.com/welcome.html',
  },
  {
    id: 'in-page-action',
    surface: 'content-in-page',
    theme: 'dark',
    headline: 'Works where your users already are',
    subhead: 'Content script overlay on a real page. Replace this copy before shipping.',
    browserUrl: 'https://your-target-site.com/article/42',
  },
];
