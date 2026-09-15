# Security Policy

## Data Storage

Money Meva is a **local-first** application. All your financial data is stored in your browser's IndexedDB and localStorage. No data is transmitted to any server unless you:

- **Enable cloud sync** (optional) — your data is pushed to a **shared link-only** Supabase `sync_docs` table (no accounts). Anyone holding the project URL + anon key can read/write those rows, so keep the key private.
- **Sign in with Google** (optional) — the OAuth flow only creates a **local** profile and restores the previous local session; no cloud account is made.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by opening an issue on GitHub or contacting the maintainers directly. Do not disclose it publicly until it has been addressed.

## Supported Versions

| Version | Supported |
|---|---|
| 7.x | ✅ |
| < 7.0 | ❌ |

## Best Practices

- Use a strong password for your local profile
- Keep your Supabase URL + anon key private (they are the cloud sync credentials)
- Set up PIN security in Settings for sensitive operations
- Enable session auto-lock to protect data when idle
- Export backups regularly via Settings → Export/Import
- Clear browser data if using a shared device