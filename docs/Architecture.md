# Architecture

## Stack

| Layer | Tech | Why |
|---|---|---|
| Framework | Next.js 16.2.9 App Router | Static export, React 19 |
| Styling | Tailwind CSS v4 + CSS vars | 3-brand theme |
| i18n | Custom hook | mr/hi/en, no external lib |
| Database | Dexie.js (IndexedDB) | Offline-first, 11 tables |
| Sync | PouchDB ↔ Supabase | Shared database, link-only (no accounts) |
| State | In-memory cache + Dexie | Instant reads |
| Auth | Local profiles (localStorage) + optional Google OAuth → local profile | No cloud accounts |
| Sync credential | Supabase anon key + project URL | Link-only shared `sync_docs` table |
| Security | One-time 4-digit PINs | Simple, auto-rotate |
| Mobile | Capacitor v8 | Android APK |
| Charts | Recharts | Lightweight |
| PDF | jsPDF + autotable | Client-side |
| Excel | SheetJS (xlsx) | Client-side |

## Why Not...

- **Self-hosted server / CouchDB** → Removed (Railway instance decommissioned).
  Cloud sync is now a **shared Supabase project with open (link-only) RLS** — the
  same model as the original CouchDB sync. No per-user accounts.
- **Server components** → Browser-only (Dexie/PouchDB).
- **Zustand/Redux** → Cache arrays are simpler.
- **Prisma/SQLite** → Dexie is the only browser option.
- **react-i18next** → Overkill for 3 languages.

## Data Model

- **11 Dexie tables** (see `src/lib/db.ts`): transactions, partners, recurring,
  budgets, reminders, adjustments, goals, works, partnerships, partnership_entries,
  mutation_log.
- All writes flow: **cache → Dexie → mutation_log → PouchDB → (optional) Supabase
  `sync_docs`** (fire-and-forget). `transitionId` links entity lifecycle mutations.
- Soft-delete with `deletedAt` on all entities; Archive holds items for 30 days
  before permanent removal.
- Sync is **link-only**: any device with the project URL + anon key reads/writes
  the shared `sync_docs` table (see `docs/Sync.md` and `supabase/schema.sql`).

## File Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout + providers
│   │   ├── page.tsx            # Landing page
│   │   ├── login/page.tsx      # Local profiles + optional Google OAuth
│   │   ├── onboarding/page.tsx # First-run setup
│   │   └── dashboard/          # All authenticated pages (incl. settings, ledger, archive)
│   ├── components/             # React components
│   ├── lib/                    # Utilities, store, i18n, pouchdb, env
│   └── types/                  # TypeScript types
├── supabase/schema.sql         # Link-only sync_docs schema + open RLS + realtime
├── functions/api/              # Cloudflare Pages Functions (announcements proxy)
├── scripts/                    # serve.cjs, fresh-check.cjs + launchers
├── android/                    # Capacitor Android project
└── docs/                       # Obsidian vault (HOME.md is the index)
```

## Runtime Config

- Env via `.env.local` (build-time): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (empty by default — bring your own),
  `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ANNOUNCEMENTS_API` (edge proxy).
- Users can override URL + key per device in Settings → Multi-Device Sync.