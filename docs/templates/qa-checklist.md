# Pre-Publish QA Checklist

## Functional
- [ ] Core feature works as expected
- [ ] All entry points load (popup, options, sidepanel -- whichever apply)
- [ ] Background service worker starts without errors
- [ ] Content script injects on target pages
- [ ] Storage read/write works correctly
- [ ] Message passing between contexts works

## Visual
- [ ] Light theme looks correct
- [ ] Dark theme looks correct
- [ ] Popup dimensions are appropriate (not too large/small)
- [ ] No layout overflow or clipping

## Stability
- [ ] No errors in DevTools console
- [ ] No infinite loops or runaway observers
- [ ] Works after page navigation (SPA-aware if needed)
- [ ] Extension survives service worker restart

## Policy
- [ ] Privacy policy URL is public and reachable
- [ ] Support URL is public and reachable
- [ ] CWS privacy answers match actual behavior
- [ ] No remote hosted executable code
- [ ] All permissions are justified and used
