# sources/ — frozen citation footnotes

This directory holds primary-source captures that back specific claims in `docs/` playbooks. It is **not** a growing knowledge base — the mining workflow was retired in April 2026.

- `blogs/`, `forums/`, `official/` — raw captures with frontmatter (URL, retrieval date, Wayback).
- `extracted/` — per-capture synthesis summarizing the signal, cited verbatim in docs.

**Do not add new captures here.** New Chrome-Web-Store knowledge enters the factory via:
1. A new rule in `scripts/validate-cws.ts` (with a `source:` URL inline) — for pattern/presence/policy rules.
2. A new recipe in the relevant skill's SKILL.md — for judgment-level guidance.

See `ARCHITECTURE.md` → "Knowledge entry" for the full rationale.
