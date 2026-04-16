import { queryAllDeep } from '@/utils/dom';
import { createSuppressableObserver } from '@/utils/observer';

// Replace example.com with your target site
export default defineContentScript({
  matches: ['*://*.example.com/*'],

  main() {
    console.log('Content script loaded');

    const elements = queryAllDeep('a[href]');
    console.log(`Found ${elements.length} links (including shadow DOM)`);

    const observer = createSuppressableObserver({
      callback: (mutations) => {
        console.log(`${mutations.length} mutation batch observed`);
      },
    });

    observer.observe(document.body);
  },
});
