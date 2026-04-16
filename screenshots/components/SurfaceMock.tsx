import type { ScreenshotSurface, ScreenshotTheme } from '../config';

/**
 * Placeholder mockup of each extension surface, drawn generically so the
 * screenshot looks like an extension even before the user customizes the
 * config. Replaced in spirit once the user customizes config.ts — the
 * factory-default screenshots use these mockups + the "Your killer feature
 * here" copy to make it obvious the screenshots need real work.
 *
 * If you want to render your *actual* built extension surface here (loaded
 * from `.output/chrome-mv3/`), swap this out for an <iframe src="..."> or
 * a direct import of your popup/sidepanel/options React components. That's
 * a judgment call; the factory ships the generic mock so `npm run screenshots`
 * works end-to-end before the user has wired anything up.
 */

export interface SurfaceMockProps {
  surface: ScreenshotSurface;
  theme: ScreenshotTheme;
}

const SURFACE_PALETTE = {
  light: {
    bg: '#ffffff',
    bgMuted: '#f5f7fa',
    border: '#e3e7ec',
    text: '#0f172a',
    textMuted: '#64748b',
    accent: '#2563eb',
    accentText: '#ffffff',
  },
  dark: {
    bg: '#18191c',
    bgMuted: '#23252a',
    border: '#2d2e31',
    text: '#e8eaed',
    textMuted: '#a8acb1',
    accent: '#60a5fa',
    accentText: '#0b1220',
  },
} as const;

export function SurfaceMock({ surface, theme }: SurfaceMockProps) {
  const p = SURFACE_PALETTE[theme];

  if (surface === 'popup') {
    return (
      <div
        className="flex flex-col h-full"
        style={{ background: p.bg, color: p.text }}
      >
        <div
          className="px-4 py-3 flex items-center gap-2 border-b"
          style={{ borderColor: p.border }}
        >
          <div
            className="w-6 h-6 rounded"
            style={{ background: p.accent }}
          />
          <div className="font-semibold text-sm">Your extension</div>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div
            className="rounded-md p-3"
            style={{ background: p.bgMuted }}
          >
            <div className="text-xs font-medium mb-1">Status</div>
            <div className="text-lg font-semibold">Active</div>
          </div>
          <div className="flex flex-col gap-2">
            <MockRow label="Today" value="4 items" palette={p} />
            <MockRow label="This week" value="17 items" palette={p} />
            <MockRow label="Pinned" value="2" palette={p} />
          </div>
          <button
            className="rounded-md py-2 text-sm font-medium mt-2"
            style={{ background: p.accent, color: p.accentText }}
          >
            Open dashboard
          </button>
        </div>
      </div>
    );
  }

  if (surface === 'sidepanel') {
    return (
      <div
        className="flex flex-col h-full"
        style={{ background: p.bg, color: p.text }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: p.border }}
        >
          <div className="text-xs font-medium" style={{ color: p.textMuted }}>
            SIDEPANEL
          </div>
          <div className="text-lg font-semibold mt-1">Your extension</div>
        </div>
        <div className="p-5 flex flex-col gap-3 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-md p-3"
              style={{ background: p.bgMuted }}
            >
              <div
                className="text-xs mb-1 font-medium"
                style={{ color: p.textMuted }}
              >
                Item {i + 1}
              </div>
              <div className="text-sm">Placeholder row — your data here</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (surface === 'options') {
    return (
      <div
        className="flex h-full"
        style={{ background: p.bg, color: p.text }}
      >
        <aside
          className="w-56 shrink-0 p-5 border-r"
          style={{ borderColor: p.border, background: p.bgMuted }}
        >
          <div className="text-xs font-medium mb-4" style={{ color: p.textMuted }}>
            SETTINGS
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <div
              className="px-3 py-2 rounded font-medium"
              style={{ background: p.accent, color: p.accentText }}
            >
              General
            </div>
            <div className="px-3 py-2">Permissions</div>
            <div className="px-3 py-2">Appearance</div>
            <div className="px-3 py-2">Advanced</div>
          </div>
        </aside>
        <div className="flex-1 p-8 overflow-hidden">
          <div className="text-2xl font-semibold mb-6">General</div>
          <MockSetting
            title="Enable on new tabs"
            body="Run automatically when you open a new tab."
            palette={p}
            on
          />
          <MockSetting
            title="Show notifications"
            body="Desktop notifications for important events."
            palette={p}
            on
          />
          <MockSetting
            title="Sync across devices"
            body="Back up your settings to your Google account."
            palette={p}
          />
          <MockSetting
            title="Analytics"
            body="Anonymous usage data helps us improve."
            palette={p}
          />
        </div>
      </div>
    );
  }

  if (surface === 'welcome') {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-12 text-center"
        style={{ background: p.bg, color: p.text }}
      >
        <div
          className="w-16 h-16 rounded-2xl mb-5"
          style={{ background: p.accent }}
        />
        <div className="text-3xl font-bold mb-2">Welcome to your extension</div>
        <div
          className="text-base mb-6 max-w-lg"
          style={{ color: p.textMuted }}
        >
          One sentence about what it does and why the user should care.
        </div>
        <div className="flex flex-col gap-3 w-full max-w-md">
          <MockStep title="Grant access to your target site" palette={p} />
          <MockStep title="Pin the extension to your toolbar" palette={p} />
          <MockStep title="Try it on a real page" palette={p} />
        </div>
      </div>
    );
  }

  // content-in-page: a small banner-style overlay that looks like a content
  // script injection (the browser frame's SurfaceHost will position this card)
  return (
    <div
      className="flex items-start gap-3"
      style={{ color: p.text }}
    >
      <div
        className="w-9 h-9 rounded-lg shrink-0"
        style={{ background: p.accent }}
      />
      <div>
        <div className="font-semibold text-base mb-1">Your extension spotted something</div>
        <div
          className="text-sm mb-3"
          style={{ color: p.textMuted }}
        >
          A concrete, situation-specific callout — "3 reviewers forgot to approve this PR",
          "Pricing updated since your last visit", etc.
        </div>
        <div className="flex gap-2">
          <button
            className="text-xs font-medium px-3 py-1.5 rounded"
            style={{ background: p.accent, color: p.accentText }}
          >
            Take action
          </button>
          <button
            className="text-xs font-medium px-3 py-1.5 rounded"
            style={{ background: p.bgMuted, color: p.text }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function MockRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: (typeof SURFACE_PALETTE)[ScreenshotTheme];
}) {
  return (
    <div
      className="flex items-center justify-between py-1.5 text-sm"
      style={{ borderBottom: `1px solid ${palette.border}` }}
    >
      <span style={{ color: palette.textMuted }}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function MockSetting({
  title,
  body,
  palette,
  on = false,
}: {
  title: string;
  body: string;
  palette: (typeof SURFACE_PALETTE)[ScreenshotTheme];
  on?: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-6 py-4"
      style={{ borderBottom: `1px solid ${palette.border}` }}
    >
      <div>
        <div className="font-medium text-sm mb-0.5">{title}</div>
        <div className="text-xs" style={{ color: palette.textMuted }}>
          {body}
        </div>
      </div>
      <div
        className="shrink-0 rounded-full p-0.5"
        style={{
          width: 36,
          height: 20,
          background: on ? palette.accent : palette.bgMuted,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 16,
            height: 16,
            background: '#fff',
            marginLeft: on ? 16 : 0,
            transition: 'margin-left 150ms',
          }}
        />
      </div>
    </div>
  );
}

function MockStep({
  title,
  palette,
}: {
  title: string;
  palette: (typeof SURFACE_PALETTE)[ScreenshotTheme];
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-md p-3 text-left"
      style={{ background: palette.bgMuted }}
    >
      <div
        className="w-5 h-5 rounded-full shrink-0"
        style={{ border: `2px solid ${palette.accent}` }}
      />
      <div className="text-sm">{title}</div>
    </div>
  );
}
