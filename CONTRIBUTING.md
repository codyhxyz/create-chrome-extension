# Contributing

Short version: read [ARCHITECTURE.md](ARCHITECTURE.md) before adding a feature. It explains where deterministic code belongs, where the model belongs, and how the plugin-with-sub-skills architecture hangs off the factory.

## Where things go

- **A new rule that can be tested deterministically?** Script. Add to `scripts/validate-cws.ts`. See ARCHITECTURE.md → "How to extend → Add a new validator rule."
- **A new conversational recipe?** Skill. Add to `/skills/<name>/SKILL.md`. See ARCHITECTURE.md → "Skill conventions."
- **A new gate or command?** Script + `package.json` entry. See ARCHITECTURE.md → "How to extend → Add a new automation gate."
- **Explaining *why*?** Prose in `docs/`. Not for rule enforcement — prose-only rules only get enforced by vibes.

## Before opening a PR

```bash
npm run compile           # TypeScript green
npm run check:cws         # structural validator green (13 rules)
```

Both must pass. CI runs these on every push.

`npm run check:cws:ship` will be red on a fresh fork — that's correct and expected (see the two-tier check model in ARCHITECTURE.md). Don't "fix" it by populating real-looking placeholders.

## Invariants to preserve

- `npm run check:cws` is green on the factory. Always. Structural regressions break this.
- `npm run check:cws:ship` is red on the factory (6 errors by design). The template is pre-ship.
- `npm run zip` refuses to run without a green ship check.
- Validator `rule` ids are public API — skills key off them. Renaming a rule is a breaking change for every skill that uses it. Coordinate in the same PR.
- `--json` envelope (`schemaVersion: 1`) is additive-only. Removing / renaming fields requires bumping `schemaVersion`.
- Features requiring external auth are opt-in. If the secret isn't set, the script no-ops cleanly — it does not fail. Contributors don't want a red CI badge because they haven't pasted OAuth tokens.

## Adding a skill

See the existing ones: `skills/cws-content/`, `skills/cws-ship/`, `skills/cws-screens/`, `skills/cws-video/`, `skills/cws-init/`. Follow their frontmatter shape (`name`, `description`, `triggers`, `invokes`, `writes`, `requires`) and the one-responsibility-per-skill rule.

## AI-generated code

This repo was built end-to-end with Claude Code and is intended to be Claude-friendly going forward. CLAUDE.md exists as the Claude-facing orientation; ARCHITECTURE.md is the canonical design doc for any human or AI contributor. Neither is sacred — update them when the code moves.

## Questions?

Open an issue. Include what you tried and what you expected.
