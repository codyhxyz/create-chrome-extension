import type { ReactNode } from 'react';
import type { ScreenshotSurface, ScreenshotTheme } from '../config';

/**
 * Desktop Chrome window frame used as the chrome around every screenshot.
 *
 * Outer dimensions are always 1280×800. The content area (where the extension
 * surface gets rendered) is whatever remains after the title bar + tabs strip
 * + address bar. Callers place their surface content in `children` and the
 * frame handles everything else.
 *
 * Surface mode changes how the frame renders:
 *   - popup           → the surface floats as a small card near the toolbar
 *   - sidepanel       → the surface occupies the right column of the tab area
 *   - options         → the surface fills the full tab area
 *   - welcome         → same as options; pinned URL is a chrome-extension:// URL
 *   - content-in-page → the surface overlays on a simulated web page
 */

export interface BrowserFrameProps {
  theme: ScreenshotTheme;
  surface: ScreenshotSurface;
  browserUrl?: string;
  children: ReactNode;
}

const PALETTE = {
  light: {
    chrome: '#f0f2f5',
    chromeBorder: '#d0d5dc',
    tab: '#ffffff',
    tabInactive: '#e4e7eb',
    addressBar: '#ffffff',
    addressBarBorder: '#d0d5dc',
    tabText: '#202124',
    addressText: '#3c4043',
    page: '#ffffff',
    pageMuted: '#f5f7fa',
    pageText: '#202124',
    pageTextMuted: '#5f6368',
  },
  dark: {
    chrome: '#202124',
    chromeBorder: '#1a1a1b',
    tab: '#35363a',
    tabInactive: '#292a2d',
    addressBar: '#3c4043',
    addressBarBorder: '#2d2e31',
    tabText: '#e8eaed',
    addressText: '#c4c7ca',
    page: '#18191c',
    pageMuted: '#23252a',
    pageText: '#e8eaed',
    pageTextMuted: '#a8acb1',
  },
} as const;

export function BrowserFrame({
  theme,
  surface,
  browserUrl = 'https://example.com',
  children,
}: BrowserFrameProps) {
  const palette = PALETTE[theme];

  return (
    <div
      className="screenshot-stage relative flex flex-col"
      style={{ background: palette.chrome, color: palette.pageText }}
    >
      {/* Title bar: traffic-light buttons + tabs */}
      <div
        className="flex items-center px-4"
        style={{
          height: 40,
          borderBottom: `1px solid ${palette.chromeBorder}`,
        }}
      >
        {/* macOS-style traffic lights */}
        <div className="flex items-center gap-2 mr-4">
          <span
            className="block rounded-full"
            style={{ width: 12, height: 12, background: '#ff5f57' }}
          />
          <span
            className="block rounded-full"
            style={{ width: 12, height: 12, background: '#febc2e' }}
          />
          <span
            className="block rounded-full"
            style={{ width: 12, height: 12, background: '#28c840' }}
          />
        </div>
        {/* Tab strip */}
        <div className="flex items-end gap-1 h-full pt-1">
          <FakeTab
            active
            palette={palette}
            title={deriveTabTitle(surface, browserUrl)}
          />
          <FakeTab palette={palette} title="Inbox (12)" />
          <FakeTab palette={palette} title="Docs" />
        </div>
      </div>

      {/* Address bar + nav */}
      <div
        className="flex items-center gap-3 px-4"
        style={{
          height: 44,
          borderBottom: `1px solid ${palette.chromeBorder}`,
          background: palette.chrome,
        }}
      >
        <NavButton palette={palette} glyph="‹" />
        <NavButton palette={palette} glyph="›" />
        <NavButton palette={palette} glyph="⟳" />
        <div
          className="flex-1 flex items-center h-7 px-3 rounded-full text-sm"
          style={{
            background: palette.addressBar,
            border: `1px solid ${palette.addressBarBorder}`,
            color: palette.addressText,
          }}
        >
          <span className="mr-2 opacity-60" aria-hidden>
            {/* lock glyph */}
            🔒
          </span>
          <span className="truncate">{browserUrl}</span>
        </div>
        {/* Extension puzzle-piece + profile circles (decorative) */}
        <div
          className="w-6 h-6 rounded"
          style={{ background: palette.tabInactive }}
          aria-hidden
        />
        <div
          className="w-7 h-7 rounded-full"
          style={{ background: palette.tabInactive }}
          aria-hidden
        />
      </div>

      {/* Tab content area: the remaining 716px of vertical space */}
      <div className="relative flex-1" style={{ background: palette.page }}>
        <SurfaceHost
          surface={surface}
          theme={theme}
          palette={palette}
          browserUrl={browserUrl}
        >
          {children}
        </SurfaceHost>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function FakeTab({
  active = false,
  palette,
  title,
}: {
  active?: boolean;
  palette: (typeof PALETTE)[ScreenshotTheme];
  title: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 rounded-t-lg text-xs font-medium"
      style={{
        height: 28,
        maxWidth: 200,
        minWidth: 120,
        background: active ? palette.tab : palette.tabInactive,
        color: palette.tabText,
      }}
    >
      <span
        className="block rounded-sm shrink-0"
        style={{ width: 14, height: 14, background: palette.tabInactive }}
        aria-hidden
      />
      <span className="truncate">{title}</span>
    </div>
  );
}

function NavButton({
  palette,
  glyph,
}: {
  palette: (typeof PALETTE)[ScreenshotTheme];
  glyph: string;
}) {
  return (
    <button
      className="w-7 h-7 rounded-full flex items-center justify-center text-base"
      style={{ color: palette.addressText }}
      aria-hidden
    >
      {glyph}
    </button>
  );
}

function deriveTabTitle(surface: ScreenshotSurface, url: string): string {
  if (surface === 'options' || surface === 'welcome') return 'Extension';
  if (surface === 'newtab') return 'New Tab';
  try {
    const host = new URL(url).host || 'tab';
    return host;
  } catch {
    return 'tab';
  }
}

/**
 * Places the caller's `children` in the right spot for the chosen surface.
 * For popup: overlays in the top-right corner (where a popup would anchor to
 * the toolbar). For sidepanel: right column, full height. For options /
 * welcome: fills the tab area. For content-in-page: renders a simulated web
 * page underneath and overlays the children mid-page.
 */
function SurfaceHost({
  surface,
  theme,
  palette,
  browserUrl,
  children,
}: {
  surface: ScreenshotSurface;
  theme: ScreenshotTheme;
  palette: (typeof PALETTE)[ScreenshotTheme];
  browserUrl: string;
  children: ReactNode;
}) {
  if (surface === 'popup') {
    return (
      <>
        <SimulatedPage palette={palette} browserUrl={browserUrl} />
        <div
          className="absolute shadow-2xl rounded-lg"
          style={{
            top: 12,
            right: 80,
            width: 380,
            maxHeight: 560,
            background: palette.page,
            border: `1px solid ${palette.chromeBorder}`,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </>
    );
  }

  if (surface === 'sidepanel') {
    return (
      <div className="flex h-full">
        <div className="flex-1 relative">
          <SimulatedPage palette={palette} browserUrl={browserUrl} />
        </div>
        <div
          className="shrink-0 h-full"
          style={{
            width: 400,
            background: palette.page,
            borderLeft: `1px solid ${palette.chromeBorder}`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (surface === 'content-in-page') {
    return (
      <>
        <SimulatedPage palette={palette} browserUrl={browserUrl} />
        <div
          className="absolute shadow-2xl rounded-lg"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 520,
            background: palette.page,
            border: `1px solid ${palette.chromeBorder}`,
            padding: 20,
          }}
        >
          {children}
        </div>
      </>
    );
  }

  // options / welcome — the surface fills the tab area
  return (
    <div className="w-full h-full overflow-hidden" style={{ background: palette.page }}>
      {children}
    </div>
  );
}

/**
 * Draws a generic web page behind popup / sidepanel / content-in-page shots.
 * Keeps the composition believable without referencing any specific site.
 */
function SimulatedPage({
  palette,
  browserUrl,
}: {
  palette: (typeof PALETTE)[ScreenshotTheme];
  browserUrl: string;
}) {
  const host = (() => {
    try {
      return new URL(browserUrl).host;
    } catch {
      return 'example.com';
    }
  })();

  return (
    <div
      className="absolute inset-0 px-16 py-10"
      style={{ background: palette.page }}
    >
      <div
        className="h-8 w-40 rounded mb-6"
        style={{ background: palette.pageMuted }}
      />
      <div
        className="h-10 w-3/4 rounded mb-3"
        style={{ background: palette.pageMuted }}
      />
      <div
        className="h-4 w-1/2 rounded mb-8"
        style={{ background: palette.pageMuted, opacity: 0.7 }}
      />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg"
            style={{ background: palette.pageMuted }}
          />
        ))}
      </div>
      <div
        className="h-3 w-full rounded mb-2"
        style={{ background: palette.pageMuted, opacity: 0.6 }}
      />
      <div
        className="h-3 w-11/12 rounded mb-2"
        style={{ background: palette.pageMuted, opacity: 0.6 }}
      />
      <div
        className="h-3 w-4/5 rounded mb-2"
        style={{ background: palette.pageMuted, opacity: 0.6 }}
      />
      <div
        className="absolute bottom-4 right-8 text-xs opacity-40"
        style={{ color: palette.pageTextMuted }}
      >
        {host}
      </div>
    </div>
  );
}
