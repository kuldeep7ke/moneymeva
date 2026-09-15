# Security

## PIN System

- One-time 4-digit PINs generated at setup
- Auto-rotate after 10 uses
- Stored in `mm_pins` (localStorage)
- `PinPrompt` component for entry
- `PinSetupGuide` for first-time creation

## Local Auth

- Local profiles in `mm_users` (localStorage)
- Session in `mm_session`
- Multi-user support with profile switching
- Optional **Google OAuth** on the login screen: creates a **local** profile
  (via the Google identity) and restores the previous local session. It does
  **not** create a Supabase/cloud account.

## Cloud Sync Security (link-only shared database)

- **No email/password cloud accounts.** Sync uses link-only access to a shared
  Supabase `sync_docs` table — the classic CouchDB sync model.
- **Open RLS** (`using(true)` / `with check(true)`): any device holding the
  project URL + anon key can read/write every row.
- The **URL + anon key together are the credential**. The anon key is public by
  design (safe in app bundles); the real protection is keeping the **URL private**.
- `sync_docs` PK is `id` (one row per document, e.g. `transaction:abc123`),
  with `entity` tag, `data` jsonb, `updated_at` conflict resolution, `deleted_at`
  soft-delete tombstone. Realtime is enabled (`replica identity full`).
- Schema is authoritative in `supabase/schema.sql` and is idempotent — it also
  migrates away the old per-user `user_id` model.
- No PII is stored remotely except the sync data the user chooses to upload.
- Google OAuth requires a configured `NEXT_PUBLIC_SUPABASE_URL` + anon key as
  well (the OAuth flow runs through Supabase Auth) — see SELF-HOSTING.md.

## Data Safety

- No PII stored remotely (only local, unless cloud sync enabled)
- Soft-delete with 30-day retention
- Archive for deleted items
- Data export anytime (JSON/PDF/Excel)

## Auto-Lock

- Configurable auto-lock timeout (default: inactivity)
- `getAutoLockMinutes()` / `setAutoLockMinutes()`

## Best Practices

- Never log secrets or keys
- Never commit secrets to repo (env vars are gitignored; `backup/` is untracked)
- Treat the Supabase URL + anon key as a shared credential — never expose them publicly
- PINs are for app access only, not encryption
- Local profile password never leaves the app except in the sign-in request (HTTPS)