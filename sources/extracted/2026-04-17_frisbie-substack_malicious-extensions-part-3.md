---
extracts:
  - sources/blogs/2026-04-17_frisbie-substack_malicious-extensions-part-3.md
extracted_at: 2026-04-17
title: "Frisbie teaser Part 3: pointer to Seraphic Security webinar on real-world extension breaches"
author: Matt Frisbie
url: https://mattfrisbie.substack.com/p/lets-talk-about-malicious-browser-9e0
evidence_class: c
topics:
  - security
  - malicious-extensions
  - pointer-post
  - breach-case-studies
feeds_docs: []
---

# Frisbie — Substack teaser pointing to a Seraphic Security webinar (signal lives at the webinar recording)

## TL;DR

Third announcement post in Frisbie's malicious-extensions series. Part 3 is a **webinar co-hosted with Alon Levin (VP of Product Management, Seraphic)** in the Seraphic Attack Surface Series, analyzing real-world extension-based breaches: **Cyberhaven, ChromeLoader, PDF Toolbox, Dataspii**. The on-page content is a registration teaser (date was Thursday March 20, 2025, 11:00 AM ET). Substantive content lives in the webinar itself at Seraphic Security's resources page.

## Signal

The valuable part of this teaser is the enumerated list of named breaches the webinar covers — these are concrete case studies worth tracking down independently:
- **Cyberhaven** — browser-extension-based corporate breach
- **ChromeLoader** — malware distributed via extensions
- **PDF Toolbox** — compromised/malicious extension incident
- **Dataspii** — large-scale extension data-exfiltration disclosure

Each of these is a potential capture target for deeper analysis. Frisbie's framing — "how attackers manipulate browser extensions to evade security controls," "why traditional security tools fail to detect these threats" — is pitched at CISOs and security architects, not at extension developers, so the implications for the factory are indirect (these are the breaches that justify why CWS review exists in its current form).

## Key quotes

> "I'll join Alon Levin, VP of Product Management at Seraphic, to analyze real-world extension-based breaches, including Cyberhaven, ChromeLoader, PDF Toolbox, and Dataspii, and reveal how attackers exploit browser extensions to infiltrate enterprises."
> — Matt Frisbie, 2026-04-17 (post date per capture)

> "How attackers manipulate browser extensions to evade security controls / Insights from major extension-based breaches and their impact / Why traditional security tools fail to detect these threats"
> — Matt Frisbie, 2026-04-17 (webinar agenda)

## Implications for the factory

- **Not applicable** — this is a pointer post. The webinar at `https://seraphicsecurity.com/resources/webinar/the-unreasonable-effectiveness-of-malicious-browser-extensions` is a **capture candidate for the next discovery pass**, along with dedicated captures/writeups of each named breach (Cyberhaven, ChromeLoader, PDF Toolbox, Dataspii) — these would give the factory real case-study material to cite in `docs/09`'s "why CWS review matters" framing.

## Provenance

- **Raw capture:** [`../blogs/2026-04-17_frisbie-substack_malicious-extensions-part-3.md`](../blogs/2026-04-17_frisbie-substack_malicious-extensions-part-3.md)
- **Original URL:** https://mattfrisbie.substack.com/p/lets-talk-about-malicious-browser-9e0
- **Wayback:** https://web.archive.org/web/20260417001456/https://mattfrisbie.substack.com/p/lets-talk-about-malicious-browser-9e0
- **Capture candidate:** Seraphic webinar at https://seraphicsecurity.com/resources/webinar/the-unreasonable-effectiveness-of-malicious-browser-extensions; individual breach writeups for Cyberhaven, ChromeLoader, PDF Toolbox, Dataspii.
