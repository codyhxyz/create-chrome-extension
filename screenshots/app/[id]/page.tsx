import { notFound } from 'next/navigation';
import { BrowserFrame } from '../../components/BrowserFrame';
import { CopyOverlay } from '../../components/CopyOverlay';
import { SurfaceMock } from '../../components/SurfaceMock';
import { RealBuildIframe } from '../../components/RealBuildIframe';
import { ConceptCard } from '../../components/ConceptCard';
import { StubWatermark } from '../../components/StubWatermark';
import { screenshots } from '../../config';

/**
 * Dedicated route per screenshot. The capture script visits
 *   http://localhost:3535/<id>?rung=<rung>&...
 * and screenshots the viewport at 1280×800. Everything the PNG should
 * contain must render inside `.screenshot-stage`.
 *
 * Rung selection (docs/07-fallback-ladders.md):
 *   - rung=real-build      → iframe loading the built extension surface
 *                            (capture script also passes iframeSrc).
 *                            Ship-acceptable.
 *   - rung=surface-mock    → legacy `SurfaceMock` mock (kept for opt-in
 *                            use, not produced by capture by default).
 *                            Stub-watermarked.
 *   - rung=concept-card    → typographic concept card with extension
 *                            name + tagline. Stub-watermarked.
 *                            Default if `rung` is omitted.
 *
 * The capture script is the authority on which rung this shot landed at;
 * the page is a dumb renderer of whatever rung query param it receives.
 */

type Rung = 'real-build' | 'surface-mock' | 'concept-card';

function parseRung(value: string | undefined): Rung {
  if (value === 'real-build' || value === 'surface-mock') return value;
  return 'concept-card';
}

export function generateStaticParams() {
  return screenshots.map((s) => ({ id: s.id }));
}

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function firstParam(
  v: string | string[] | undefined,
): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ScreenshotPage({
  params,
  searchParams,
}: PageProps) {
  const resolved = await Promise.resolve(params);
  const search = (await Promise.resolve(searchParams ?? {})) ?? {};
  const shot = screenshots.find((s) => s.id === resolved.id);
  if (!shot) notFound();

  const rung = parseRung(firstParam(search.rung));
  const iframeSrc = firstParam(search.iframeSrc);
  const extensionName = firstParam(search.name) ?? 'Your extension';
  const tagline =
    firstParam(search.tagline) ?? 'A short description of what it does.';
  const isStub = rung !== 'real-build';

  let content;
  if (rung === 'real-build' && iframeSrc) {
    content = <RealBuildIframe surface={shot.surface} src={iframeSrc} />;
  } else if (rung === 'surface-mock') {
    content = <SurfaceMock surface={shot.surface} theme={shot.theme} />;
  } else {
    content = (
      <ConceptCard
        surface={shot.surface}
        theme={shot.theme}
        extensionName={extensionName}
        tagline={tagline}
      />
    );
  }

  return (
    <div style={{ width: 1280, height: 800 }}>
      <div style={{ position: 'relative', width: 1280, height: 800 }}>
        <BrowserFrame
          theme={shot.theme}
          surface={shot.surface}
          browserUrl={shot.browserUrl}
        >
          {content}
        </BrowserFrame>
        <CopyOverlay
          theme={shot.theme}
          headline={shot.headline}
          subhead={shot.subhead}
        />
        {isStub && <StubWatermark />}
      </div>
    </div>
  );
}
