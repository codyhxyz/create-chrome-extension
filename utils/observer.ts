/**
 * MutationObserver wrapper with timestamp-based suppression.
 *
 * Use when your content script both reads and writes the DOM —
 * suppress() prevents your own mutations from re-triggering the callback.
 */

interface SuppressableObserver {
  observe: (target: Node) => void;
  disconnect: () => void;
  suppress: (ms?: number) => void;
}

interface ObserverOptions {
  /** Called with batched mutations after the debounce window. */
  callback: (mutations: MutationRecord[]) => void;
  /** MutationObserver config. Defaults to { childList: true, subtree: true }. */
  config?: MutationObserverInit;
  /** Debounce interval in ms. Defaults to 100. */
  debounceMs?: number;
}

/**
 * Creates a MutationObserver with timestamp-based suppression.
 *
 * Use suppress() before making DOM changes to prevent your own mutations
 * from triggering the observer callback (avoids infinite loops).
 *
 * @example
 * const obs = createSuppressableObserver({
 *   callback: (mutations) => updateUI(mutations),
 *   debounceMs: 150,
 * });
 * obs.observe(document.body);
 *
 * // Before writing to the DOM:
 * obs.suppress();
 * element.textContent = 'updated';
 */
export function createSuppressableObserver(options: ObserverOptions): SuppressableObserver {
  const { callback, config, debounceMs = 100 } = options;

  let suppressUntil = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver((mutations) => {
    if (performance.now() < suppressUntil) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      callback(mutations);
    }, debounceMs);
  });

  const defaultConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
    ...config,
  };

  return {
    observe(target: Node) {
      observer.observe(target, defaultConfig);
    },
    disconnect() {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    },
    /** Suppress callbacks for the next `ms` milliseconds (default 120). */
    suppress(ms = 120) {
      suppressUntil = Math.max(suppressUntil, performance.now() + ms);
    },
  };
}
