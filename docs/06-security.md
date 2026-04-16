# Security

## Secret Management

This template uses `.secrets.local.json` for local secrets. It is already in `.gitignore`.

### Build-time placeholder replacement

Store secrets in `.secrets.local.json`:
```json
{
  "API_KEY": "sk-real-key-here"
}
```

Reference in code with a placeholder pattern and replace at build time via Vite's `define` config in `wxt.config.ts`:
```ts
vite: () => ({
  define: {
    __API_KEY__: JSON.stringify(process.env.API_KEY || '__PLACEHOLDER__'),
  },
}),
```

### `.gitattributes` clean/smudge filter (safety net)

Prevents accidental secret commits by automatically scrubbing values on `git add`:

Add to `.gitattributes`:
```
# Prevent accidental secret commits
entrypoints/background.ts filter=secret-inject
```

Setup commands:
```bash
git config filter.secret-inject.clean 'sed "s/REAL_SECRET/__SECRET_PLACEHOLDER__/g"'
git config filter.secret-inject.smudge 'sed "s/__SECRET_PLACEHOLDER__/REAL_SECRET/g"'
```

Replace `REAL_SECRET` with your actual secret value. The clean filter strips it on commit; the smudge filter restores it on checkout.

## OAuth in Chrome Extensions

Use `chrome.identity.launchWebAuthFlow` with PKCE for OAuth flows:

```ts
// In background.ts
const redirectUrl = chrome.identity.getRedirectURL();

const authUrl = new URL('https://provider.com/authorize');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', redirectUrl);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('code_challenge', codeChallenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

const responseUrl = await chrome.identity.launchWebAuthFlow({
  url: authUrl.toString(),
  interactive: true,
});

const code = new URL(responseUrl).searchParams.get('code');
// Exchange code for tokens...
```

Key points:
- `chrome.identity.getRedirectURL()` gives you the extension's redirect URI
- Use PKCE (Proof Key for Code Exchange) -- no client secret stored in the extension
- Add `"identity"` to permissions in `wxt.config.ts`

## MV3 Content Security Policy

Manifest V3 enforces strict CSP. You cannot:

| Banned | Alternative |
|---|---|
| `eval()`, `new Function()` | Refactor to avoid dynamic code execution |
| Remote scripts (`<script src="https://...">`) | Bundle everything via Vite |
| Inline `<script>` tags in HTML | Vite handles this -- all scripts are bundled as modules |
| `document.write()` | Use DOM APIs (`createElement`, `appendChild`) |

Vite's build output is already MV3-compliant. Problems only arise if you try to bypass the build system.

## Permissions Best Practices

- **Only request permissions you actually use.** CWS reviewers will reject extensions with unjustified permissions.
- **Prefer optional permissions** for features that not all users need:
  ```ts
  // In wxt.config.ts
  manifest: {
    optional_permissions: ['tabs', 'bookmarks'],
  },
  ```
  Then request at runtime:
  ```ts
  const granted = await chrome.permissions.request({
    permissions: ['tabs'],
  });
  ```
- **Document each permission** in your privacy policy with a clear reason.
- **Audit before submission:** review `wxt.config.ts` permissions and remove any you added during development but no longer use.

## Common Permission Justifications

| Permission | Typical justification |
|---|---|
| `storage` | Saving user preferences and extension state |
| `activeTab` | Accessing the current tab when user clicks the extension |
| `alarms` | Scheduling periodic background tasks |
| `sidePanel` | Displaying the side panel UI |
| `tabs` | Reading tab URLs or titles for core functionality |
| `identity` | OAuth authentication flow |
