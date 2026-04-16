# Staleness Prevention

## The Problem

Chrome Web Store considers extensions inactive after approximately 6 months without updates. Inactive extensions may be:
- Deprioritized in search results
- Flagged for removal review
- Marked with warnings visible to users

## Strategy 1: GitHub Actions Cron Reminder

Add this workflow to `.github/workflows/staleness-reminder.yml`:

```yaml
name: Staleness Reminder
on:
  schedule:
    - cron: '0 9 1 */5 *'  # First day of every 5th month
jobs:
  remind:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          gh issue create \
            --title "Extension update reminder — $(date +%B\ %Y)" \
            --body "This extension hasn't been updated in 5 months. Review for updates, bump version, and re-submit to Chrome Web Store." \
            --label "maintenance"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This creates a GitHub issue every 5 months reminding you to update and re-submit.

## Strategy 2: Calendar Reminder

Set a recurring calendar reminder every 5 months:
- Review the extension for any needed updates
- Bump the version
- Rebuild and re-submit

## Version Bump Process

### 1. Bump the version

In `package.json`:
```json
"version": "0.1.1"
```

WXT reads the version from `package.json` by default. You can also set it explicitly in `wxt.config.ts`:
```ts
manifest: {
  version: '0.1.1',
},
```

### 2. Update CHANGELOG (if you maintain one)

```markdown
## 0.1.1 - 2025-06-01
- Maintenance update
- [any actual changes]
```

### 3. Rebuild and re-submit

```bash
npm run zip
# Upload to CWS dashboard
```

Even a version bump with no functional changes counts as an update and resets the staleness clock.
