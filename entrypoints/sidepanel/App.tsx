import { useState } from 'react';

/*
 * Side panel state management:
 * Unlike popups, the side panel persists across page navigations within the
 * same browser session. Component state survives as long as the panel stays
 * open — use useState/useReducer for transient UI state and browser.storage
 * for anything that should survive panel close/reopen.
 */

function App() {
  const [activeTab, setActiveTab] = useState<'main' | 'history'>('main');

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Header */}
      <header className="shrink-0 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <h1 className="text-sm font-semibold tracking-tight">
          {browser.runtime.getManifest().name}
        </h1>
        <nav className="mt-2 flex gap-1">
          {(['main', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'main' ? (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              This panel stays open as you browse. Add your extension's primary
              interface here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Activity log or history view. Panel state persists across page
              navigations.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="shrink-0 border-t border-neutral-200 dark:border-neutral-700 px-4 py-2">
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
          v{browser.runtime.getManifest().version}
        </p>
      </footer>
    </div>
  );
}

export default App;
