import type { ScreenshotSurface, ScreenshotTheme } from '../config';

/**
 * Rung 3 of the screenshot fallback ladder (docs/07-fallback-ladders.md).
 *
 * Used when no built HTML exists for the surface (or the surface is one we
 * fundamentally can't render — content-in-page). Renders a fixed typographic
 * card with the extension name + tagline + a small surface label, on a
 * branded background. Deliberately not model-generated: same template
 * always, so the factory's bet on determinism extends to this rung.
 *
 * The diagonal STUB watermark is applied separately at the page level — see
 * StubWatermark.tsx — so the validator/CI can also identify stub PNGs by
 * inspecting `.factory/ladder-status.json`.
 */

export interface ConceptCardProps {
  surface: ScreenshotSurface;
  theme: ScreenshotTheme;
  extensionName: string;
  tagline: string;
}

const CARD_PALETTE = {
  light: {
    bg: '#ffffff',
    panel: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#2563eb',
  },
  dark: {
    bg: '#0b0d12',
    panel: '#14181f',
    border: '#1f2630',
    text: '#f1f5f9',
    muted: '#94a3b8',
    accent: '#60a5fa',
  },
} as const;

export function ConceptCard({
  surface,
  theme,
  extensionName,
  tagline,
}: ConceptCardProps) {
  const p = CARD_PALETTE[theme];
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: p.bg, color: p.text }}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{
          maxWidth: 720,
          padding: '56px 64px',
          background: p.panel,
          border: `1px solid ${p.border}`,
          borderRadius: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: p.accent,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: p.muted,
            marginBottom: 12,
          }}
        >
          {surface}
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 14,
          }}
        >
          {extensionName}
        </div>
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.45,
            color: p.muted,
            maxWidth: 560,
          }}
        >
          {tagline}
        </div>
      </div>
    </div>
  );
}
