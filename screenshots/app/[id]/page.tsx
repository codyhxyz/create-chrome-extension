import { notFound } from 'next/navigation';
import { BrowserFrame } from '../../components/BrowserFrame';
import { CopyOverlay } from '../../components/CopyOverlay';
import { SurfaceMock } from '../../components/SurfaceMock';
import { screenshots } from '../../config';

/**
 * Dedicated route per screenshot. The capture script visits
 *   http://localhost:3535/<id>
 * and screenshots the viewport at 1280×800. Everything the PNG should
 * contain must render inside `.screenshot-stage`.
 */

export function generateStaticParams() {
  return screenshots.map((s) => ({ id: s.id }));
}

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function ScreenshotPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const shot = screenshots.find((s) => s.id === resolved.id);
  if (!shot) notFound();

  return (
    <div style={{ width: 1280, height: 800 }}>
      <div style={{ position: 'relative', width: 1280, height: 800 }}>
        <BrowserFrame
          theme={shot.theme}
          surface={shot.surface}
          browserUrl={shot.browserUrl}
        >
          <SurfaceMock surface={shot.surface} theme={shot.theme} />
        </BrowserFrame>
        <CopyOverlay
          theme={shot.theme}
          headline={shot.headline}
          subhead={shot.subhead}
        />
      </div>
    </div>
  );
}
