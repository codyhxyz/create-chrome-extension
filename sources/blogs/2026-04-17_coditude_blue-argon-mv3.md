---
url: https://www.coditude.com/insights/blue-argon-mv3-additional-requirements-explained/
captured_at: '2026-04-17'
capture_method: script-rendered
source_type: blog
source_id: coditude
title_at_capture: Blue Argon - MV3 Additional Requirements Explained
author: Hrishikesh Kale
evidence_class: c
topics:
  - cws-review
  - rejection-codes
  - blue
  - mv3
wayback_url: >-
  https://web.archive.org/web/20260417001925/https://www.coditude.com/insights/blue-argon-mv3-additional-requirements-explained/
related_docs: []
notes: Fill in during curation.
---

# Blue Argon - MV3 Additional Requirements Explained

## Signal extracted

<!-- Fill in during curation. The one insight this post has that's hard to get elsewhere. -->

---

### Understanding Blue Argon Colour code

A rejection with Blue Argon means that your package does not meet the requirements for Manifest V3 (MV3). Manifest (MV3) represents Google’s latest shift in [Chrome extensions](https://www.coditude.com/capabilities/browser-extension/chrome-extension-development-services-company/) and it comes with tighter security and privacy controls and increased performance standards. Google is also stricter when it comes to the remote execution of code, handling of scripts, and bundling of external dependencies.

In short, extensions that get rejected due to Blue Argon are practicing disallowed code execution, most commonly the use of remote code scripts or unsafe execution methods.

### Why Blue Argon Code Violation Happens

#### There are a few common reasons developers face this rejection:

-   Remotely hosted scripts: Using `<script>` in your extension package.
-   Remote code execution methods: Functions like `eval()`,`new Function()`, or dynamic script injection, or other mechanisms to execute a string fetched from a remote source.
-   Unbundled SDKs or libraries: Depending on Firebase, third-party SDKs, or CDN-hosted scripts instead of including them in your packaged ZIP.
-   Mixed MV2/MV3 logic: Extensions written for MV2 but resubmitted with MV3 manifest without changing the execution model.

Google enforces these rules to stop bad actors from altering extension behaviour remotely. All logic must be static, reviewed, and bundled inside the extension before submission.

### Real-World Example

Imagine that you've built a Chrome Extension to modify dashboards and include pulling in scripts from a Firebase CDN. It works in your dev environment, and when you submit it, once google reviews it, it gets rejected with Blue Argon. Why? Because MV3 will not allow external code sources. You would have to locally bundle Firebase libraries within your extension ZIP file and give them reference directly.

#### How to Fix Blue Argon Rejections:

Blue Argon rejections can be frustrating for the developers. However, the fixes are usually simple once you understand MV3 rules and policies.

#### Here is a step-by-step guide:

#### Remove all the remote `<script src>` tags from the code.

-   Each line of your HTML should link to a JS file that is stored locally.

#### Bundle SDKs and libraries locally.

-   If you use Firebase, Analytics, or third-party SDKs, download them and put them in your extension.

#### Avoid codes that could be dangerous.

-   Use safer options instead of `eval()` or new `Function()`.
-   Precompile templates instead of generating them dynamically.

#### Check your manifest.json.

-   Confirm you’re using "manifest\_version": 3.
-   Remove any keys that are outdated from MV2.

#### Build again and test locally.

-   Make sure there are no missing references when you load the unpacked extension in Chrome (chrome://extensions).

#### Confidently submit again.

-   After making the all the changes and adjustments, package your ZIP file and upload it once more.

### Pro Tips

-   If your app uses any analytics or logging, look for MV3-compliant SDKs. You can also now use libraries that provide MV3-ready versions.
-   You can use a tool like Webpack, Rollup, or Vite to create a single local build for your extension if you're working with large libraries like React or Angular.
-   If you are not sure, you can run a search for http in your extension folder to ensure no external code is being loaded.

### Before You Resubmit

Before you click the “Resubmit” button in the Chrome Web Store dashboard, double-check that your extension meets the QA checklist. A second rejection wastes time and reduces trust in your submission.

Keep this guide handy to decode Blue Argon errors— it helps ensure your extension meets Google’s MV3 standards and moves smoothly through the approval process.

### Conclusion

At Coditude, we consistently assist companies and developers in getting their Chrome extensions accepted on their first try. Whether it be restructuring your extension for MV3, debugging [rejection codes](https://www.coditude.com/insights/chrome-web-store-rejection-codes/), or ensuring compliance with Google’s latest policies and rules, our experts make the process faster and easier for you. Team up with us to launch your extension without any issues.

## Curator notes

<!-- Empty at capture time. -->
