import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState<'active' | 'checking'>('checking');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('active'), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight">
          {browser.runtime.getManifest().name}
        </h1>
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            status === 'active'
              ? 'bg-emerald-500'
              : 'bg-neutral-400 animate-pulse'
          }`}
          title={status === 'active' ? 'Active' : 'Checking...'}
        />
      </header>

      <div className="px-4 py-4 space-y-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {browser.runtime.getManifest().description}
        </p>

        <button
          onClick={() => browser.runtime.openOptionsPage()}
          className="w-full rounded-md bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Settings
        </button>
      </div>

      <footer className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-2">
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
          v{browser.runtime.getManifest().version}
        </p>
      </footer>
    </div>
  );
}

export default App;
