---
url: https://bashvlas.com/blog/update-chrome-extension-without-review
captured_at: '2026-04-17'
capture_method: script
source_type: blog
source_id: bashvlas
title_at_capture: Update Your Chrome Extensions Without Review
author: Vlas Bashynskyi
evidence_class: c
topics:
  - cws-review
  - remote-config
wayback_url: https://web.archive.org/web/20260417002120/https://bashvlas.com/blog/update-chrome-extension-without-review
related_docs: []
notes: Fill in during curation.
---

# Update Your Chrome Extensions Without Review

## Signal extracted

<!-- Fill in during curation. The one insight this post has that's hard to get elsewhere. -->

---

## Example of using remote configuration via an admin panel

For example, let’s say that the purpose of our chrome extension is to extract text from images. And one of the supported websites is instagram. And our extension adds an icon like this to each image. And when we click the extension - we use Google Vision API to convert this image into text.

Now, if we wanted to support another website - like Google, for example. Instead of hardcoding image selectors and the list of supported websites into the package of the chrome extension. We can implement a page like this, where an admin user can go in and add a new site like this. Now, when we reload the page - the extension will support this website.

This method is called “remote configuration” and this is something Google actually recommends you use in your extensions.

## References

-   [https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#configuration-drive](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security#configuration-drive)

## Curator notes

<!-- Empty at capture time. -->
