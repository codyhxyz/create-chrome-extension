import Link from 'next/link';
import { screenshots } from '../config';

/**
 * Index page. Lists every configured screenshot with a link for manual
 * preview. The capture script does not use this page — it hits each
 * `/[id]` route directly.
 */
export default function Home() {
  return (
    <div className="min-h-screen p-10 text-white" style={{ background: '#111114' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Chrome Web Store screenshots</h1>
        <p className="text-sm opacity-70 mb-8">
          {screenshots.length} screenshot{screenshots.length === 1 ? '' : 's'} configured. Each
          route renders at exactly 1280×800 for capture.
        </p>
        <ul className="flex flex-col gap-3">
          {screenshots.map((s) => (
            <li key={s.id}>
              <Link
                href={`/${s.id}`}
                className="block rounded-md p-4 hover:opacity-100 transition-opacity"
                style={{ background: '#1d1e22', opacity: 0.9 }}
              >
                <div className="text-xs opacity-60 mb-1">
                  {s.surface} · {s.theme}
                </div>
                <div className="font-semibold">{s.headline}</div>
                <div className="text-sm opacity-70 mt-0.5">{s.subhead}</div>
                <div className="text-xs opacity-50 mt-2 font-mono">/{s.id}</div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-sm opacity-60">
          Generate all PNGs: <code className="px-1.5 py-0.5 rounded bg-black/40">npm run screenshots</code>{' '}
          from the repo root.
        </div>
      </div>
    </div>
  );
}
