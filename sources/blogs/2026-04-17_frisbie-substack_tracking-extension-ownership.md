---
url: https://mattfrisbie.substack.com/p/tracking-browser-extension-ownership
captured_at: '2026-04-17'
capture_method: script-rendered
source_type: blog
source_id: frisbie-substack
title_at_capture: Tracking Browser Extension Ownership - by Matt Frisbie
author: Matt Frisbie
evidence_class: c
topics:
  - security
  - ownership-changes
wayback_url: https://web.archive.org/web/20260417001634/https://mattfrisbie.substack.com/p/tracking-browser-extension-ownership
related_docs: []
notes: Fill in during curation.
---

# Tracking Browser Extension Ownership - by Matt Frisbie

## Signal extracted

<!-- Fill in during curation. The one insight this post has that's hard to get elsewhere. -->

---

[

![A scene depicting a shadowy exchange between two hands in a dimly lit environment, reminiscent of an underground deal. The focus of the image is a digital, transparent box, representing a Google Chrome extension, being passed from one hand to another. This box glows faintly, illuminating parts of the hands and adding a mysterious aura to the exchange. The atmosphere should be tense and secretive, with minimal lighting to highlight the transaction's dubious nature. Surrounding elements should be vague and indistinct, emphasizing the focus on the Chrome extension transfer, and suggesting a tech noir theme.](https://substackcdn.com/image/fetch/$s_!7JIp!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F12ae53b0-e678-495e-ab51-3fe0db97cfb7_1024x1024.webp "A scene depicting a shadowy exchange between two hands in a dimly lit environment, reminiscent of an underground deal. The focus of the image is a digital, transparent box, representing a Google Chrome extension, being passed from one hand to another. This box glows faintly, illuminating parts of the hands and adding a mysterious aura to the exchange. The atmosphere should be tense and secretive, with minimal lighting to highlight the transaction's dubious nature. Surrounding elements should be vague and indistinct, emphasizing the focus on the Chrome extension transfer, and suggesting a tech noir theme.")

](https://substackcdn.com/image/fetch/$s_!7JIp!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F12ae53b0-e678-495e-ab51-3fe0db97cfb7_1024x1024.webp)

Browser extensions are often dismissed as gimmicks or frills because the ecosystem is highly diverse: [UBlock Origin](https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm) can be installed alongside [Music of Minecraft](https://chromewebstore.google.com/detail/music-of-minecraft/piidlenoacbeeecjfdkjcgcienfgnkjn). Yet dismiss browser extensions at your own peril, as they are some of the most important tools for guarding privacy and enhancing security.

A perfect analogy for how extensions fit into the open web is driving a car:

-   **Roads are the internet.** Everyone uses the roads to move around, but without any rules or protections, it would be chaos.
    
-   **Traffic signals, signs, speed limits, and police are the web browsers**. These enforce rules for how the roads must work, and they exist to protect _everyone_ on the road.
    
-   **Seatbelts, mirrors, backup cameras, and collision warnings are the browser extensions.** These are in your own car, and they exist to protect _you_.
    

With this perspective, it becomes imperative to protect the integrity of the extension ecosystem.

Extension developers are [constantly getting offers to buy their extensions](https://github.com/extesy/hoverzoom/discussions/670). In nearly every case, the people buying these extensions want to rip off the existing users.

When an extension is purchased and transferred, existing users are unaware that any of this has happened. The new owner is free to push updates, and the users’ browsers will happily accept and install these updates.

To address this problem, I built [Under New Management](https://github.com/classvsoftware/under-new-management), an extension that tracks when your installed extensions have changed owners.

The response was incredible!

-   [Under New Management made it to the top of Hacker News](https://news.ycombinator.com/item?id=39620060)
    
-   [Under New Management featured in the tl;dr sec newsletter](https://tldrsec.com/p/tldr-sec-221)
    
-   _[The Register](https://www.theregister.com/2024/03/07/chrome_extension_changes/)_ [wrote an article about Under New Management](https://www.theregister.com/2024/03/07/chrome_extension_changes/)
    

I’ve [recommended an API change](https://github.com/w3c/webextensions/issues/558#issuecomment-1984719588) to the Web Extensions Community Group (WECG) to directly address this issue, and I’ve looped in the Chrome Extensions team. I’m pleased to say that they are taking this very seriously.

Make sure to leave a comment on the WECG GitHub issue!

## Curator notes

<!-- Empty at capture time. -->
