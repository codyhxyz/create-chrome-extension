import type { ScreenshotSurface } from '../config';

/**
 * Rung 1 of the screenshot fallback ladder (docs/07-fallback-ladders.md).
 *
 * Loads the *built* extension surface from `.output/chrome-mv3/<surface>.html`
 * via iframe. The capture script serves that directory on a sibling port and
 * passes the URL in via the `?iframeSrc=` query param. This is the only
 * ship-acceptable rung — the screenshot shows real extension UI.
 *
 * Dimensions are determined by the SurfaceHost slot in BrowserFrame, so we
 * just fill it. `sandbox` is left wide-open intentionally: this iframe
 * runs against a local static server in a controlled capture context, not
 * against arbitrary content.
 */

export interface RealBuildIframeProps {
  surface: ScreenshotSurface;
  src: string;
}

export function RealBuildIframe({ surface, src }: RealBuildIframeProps) {
  return (
    <iframe
      src={src}
      title={`Built ${surface} surface`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
      }}
    />
  );
}
