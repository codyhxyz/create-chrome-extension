import { useEffect, useState } from 'react';

interface Settings {
  enabled: boolean;
  apiEndpoint: string;
}

const DEFAULTS: Settings = {
  enabled: true,
  apiEndpoint: '',
};

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    browser.storage.local.get(Object.keys(DEFAULTS)).then((result) => {
      setSettings({ ...DEFAULTS, ...result } as Settings);
    });
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    browser.storage.local.set(settings).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-lg px-6 py-10">
        <h1 className="text-lg font-semibold tracking-tight mb-6">
          {browser.runtime.getManifest().name} Settings
        </h1>

        <div className="space-y-6">
          {/* Toggle */}
          <label className="flex items-center justify-between">
            <span className="text-sm">Enabled</span>
            <button
              role="switch"
              aria-checked={settings.enabled}
              onClick={() => update('enabled', !settings.enabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                settings.enabled
                  ? 'bg-emerald-500'
                  : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  settings.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          {/* Text input */}
          <label className="block space-y-1">
            <span className="text-sm">API Endpoint</span>
            <input
              type="url"
              value={settings.apiEndpoint}
              onChange={(e) => update('apiEndpoint', e.target.value)}
              placeholder="https://api.example.com"
              className="block w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </label>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              className="rounded-md bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              Save
            </button>
            {saved && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400">
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
