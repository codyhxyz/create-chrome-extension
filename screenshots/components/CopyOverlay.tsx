import type { ScreenshotTheme } from '../config';

/**
 * Headline + subhead overlay for CWS screenshots.
 *
 * Desktop typography — not App Store scale. The copy sits above or alongside
 * the browser frame, never inside it. Font sizes are tuned for 1280px width
 * at 1:1 pixel mapping (no retina upscale).
 *
 * We render the overlay pinned to the bottom-left of the stage with a soft
 * gradient wash so text stays readable regardless of what's in the frame.
 * Dark theme gets a white-text-on-dark-gradient treatment; light theme gets
 * dark-text-on-light-gradient. Keep both restrained — the screenshot itself
 * is the hero, this is the caption.
 */

export interface CopyOverlayProps {
  theme: ScreenshotTheme;
  headline: string;
  subhead: string;
}

export function CopyOverlay({ theme, headline, subhead }: CopyOverlayProps) {
  const isDark = theme === 'dark';
  return (
    <div
      className="absolute left-0 right-0 bottom-0 pointer-events-none"
      style={{
        background: isDark
          ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0) 100%)'
          : 'linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,0) 100%)',
        paddingTop: 72,
        paddingBottom: 28,
        paddingLeft: 56,
        paddingRight: 56,
      }}
    >
      <h1
        style={{
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          margin: 0,
          color: isDark ? '#ffffff' : '#0f172a',
          maxWidth: 920,
        }}
      >
        {headline}
      </h1>
      <p
        style={{
          fontSize: 17,
          fontWeight: 400,
          lineHeight: 1.45,
          margin: '10px 0 0 0',
          color: isDark ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,42,0.72)',
          maxWidth: 820,
        }}
      >
        {subhead}
      </p>
    </div>
  );
}
