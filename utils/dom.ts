/**
 * Shadow DOM utilities for content scripts that interact with
 * web components or pages using shadow roots (e.g., YouTube, GitHub).
 *
 * Standard querySelectorAll and closest() stop at shadow boundaries —
 * these helpers cross them.
 */

/**
 * Query elements across shadow DOM boundaries.
 * Uses TreeWalker to traverse into shadow roots that querySelectorAll can't reach.
 *
 * Use when a target element lives inside a web component's shadow root
 * and you don't know (or don't want to hard-code) the exact nesting path.
 */
export function queryAllDeep(selector: string, root: ParentNode = document): Element[] {
  const results: Element[] = [];
  const seen = new Set<Element>();

  function walk(nodeRoot: ParentNode) {
    if (!nodeRoot?.querySelectorAll) return;

    nodeRoot.querySelectorAll(selector).forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        results.push(el);
      }
    });

    const walker = document.createTreeWalker(nodeRoot, NodeFilter.SHOW_ELEMENT);
    let node = walker.currentNode;
    while (node) {
      if ((node as Element).shadowRoot) {
        walk((node as Element).shadowRoot!);
      }
      node = walker.nextNode()!;
    }
  }

  walk(root);
  return results;
}

/**
 * Like Element.closest() but crosses shadow DOM boundaries.
 * Traverses up through shadow roots to find the nearest matching ancestor.
 *
 * Use when you have a deeply-nested element (e.g., from an event target)
 * and need to find a logical parent that may be in an outer shadow root.
 */
export function closestComposed(node: Node, selector: string): Element | null {
  let cur: Node | null = node;
  while (cur) {
    if ((cur as Element).matches?.(selector)) return cur as Element;
    if ((cur as Element).parentElement) {
      cur = (cur as Element).parentElement;
      continue;
    }
    const root = cur.getRootNode?.();
    cur = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
}

/**
 * Inject a <style> element into a document or shadow root.
 * Idempotent — won't duplicate if the style ID already exists.
 *
 * Use when your content script needs scoped CSS inside a shadow root,
 * or when injecting global styles that should only be added once.
 */
export function ensureScopedStyles(rootNode: Document | ShadowRoot, styleId: string, css: string): void {
  if (!rootNode) return;
  if (rootNode.getElementById?.(styleId)) return;
  if ((rootNode as ShadowRoot).querySelector?.(`#${styleId}`)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;

  if (rootNode instanceof ShadowRoot) {
    rootNode.appendChild(style);
  } else {
    const target = rootNode.head || rootNode.documentElement || rootNode.body;
    target?.appendChild(style);
  }
}
