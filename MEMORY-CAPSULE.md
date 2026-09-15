# Memory Capsule — Money Meva

**Version:** v7.3.0.41 (incremented on every build)
**Repository:** github.com/kuldeep7ke/moneymeva (private; renamed from `moneymeva-online`)
**Sync:** Supabase `sync_docs` — link-only shared database (no accounts)
**Android:** Capacitor APK via GitHub Actions (auto-build on push)
**Hosting:** Cloudflare Pages + GitHub Pages + Docker (ghcr.io) — all auto-deploy
**Remote announcements:** jsonbin.io via edge cache — `docs/BROADCAST-GUIDE.md`
**Docs vault:** `docs/` (Obsidian-compatible, seed at `AGENTS.md`)
**Last Updated:** 2026-09-15

---

This file is a snapshot of the project's soul — the philosophy, architecture, and
decisions that shaped every line. It exists so that years from now, the intent is
knowable by anyone who reads it.

---

## Why This Exists

Money Meva was born from a simple frustration: every finance app wants your data.
They store it on their servers, sell ads against it, or lock it behind subscriptions.
For a small business owner or a farmer tracking seasonal income and expenses, that's
not just inconvenient — it's a privacy violation.

So we built one that doesn't.

**Core belief: financial clarity should not require surrendering privacy.**

---

## The Three Principles

1. **Local-first** — every byte of data lives in the user's browser (IndexedDB).
   No cloud account required. No server to trust. The app works fully offline.

2. **Sync is optional** — multi-device sync exists only so you aren't chained to one
   device. It uses a **shared Supabase database**: every device with the same
   project URL + anon key reads and writes the same rows (link-only, no accounts).
   You bring your own project — no credentials are baked into the code.

3. **Traceable** — every mutation carries a `transitionId`, linking the full lifecycle
   of every entity. The audit ledger is the source of truth. Soft-delete everywhere.
   Nothing is ever truly gone.

---

## How Data Flows

```
User Action (UI)
    │
    ▼
In-Memory Cache ─── UI reads instantly (no async wait)
    │
    ▼
Dexie.js (IndexedDB) ─── persistent local store
    │
    ▼
Mutation Log (Dexie) ─── logMutation() writes every CRUD action
    │                      with transitionId tracking + audit sync
    ▼
PouchDB (local buffer) ─── fire-and-forget write to local PouchDB
    │
    ▼
Supabase sync_docs (opt-in) ─── cloud hub + backup
                                 every device reads/writes the same rows
                                 realtime subscription
                                 auto-reconnect (30s)
```

Write path:  Cache → Dexie → Mutation Log → PouchDB → Supabase (fire-and-forget)
Read path:   Cache ← Dexie (hydration on load)
Sync path:   PouchDB ↔ Supabase (bidirectional, realtime + manual)

---

## What We Built

### Core Finance
- **Income / Expenses / Investments** — full CRUD with search, filter, sort, group by
  day/week/month, duplicate detection, category auto-suggest, PIN-protected deletion,
  archive/restore. Account badges (Cash/Bank/UPI/Invest). Future-dated entries blocked.
- **Credit (उधार) Tracking** — accrual-basis: a credit purchase counts as an expense
  and a credit sale as income at the moment it's recorded (no waiting for the payment).
  Every credit entry auto-creates a linked **payment-pending Adjustment** (with
  `sourceTransactionId` and `sourceType`). Settling or receiving in the Party Account
  updates those adjustments **FIFO** — partial keeps Pending with a tracked settled
  amount, full payment flips to Settled. All `Credit Settlement` rows are excluded from
  every income/expense total (dashboard, lists, summary, export, accounts). The real
  cash/bank/UPI payment leg is hidden from the list but still moves balances + party
  ledger; the opposite-section informational clearing row shows with an amber
  **"Credit settled"** badge plus a **"Credit only"** filter chip. Existing credit
  entries are backfilled into pending adjustments automatically on first load
  (idempotent). Each party can carry an optional credit limit + settle-within-days;
  near-limit/reached badges appear on the card.
- **Dashboard** — summary cards (Balance, Income, Expenses, Investments, Available to
  Spend, Partner Invested), 6-month cash flow chart, spending breakdown donut, goals
  with progress bars, upcoming reminders, cloud sync status card, quick-add modals.
- **Investment Calculator** — FD (quarterly/half-yearly/yearly compounding), SIP, RD, PPF.
  Shows maturity amount, total returns, year-wise breakdown. "Use this amount" fills the
  add form.
- **Savings & Goals** — goals grid with contribute/withdraw + progress bars.
  Goal contributions record as transactions.

### Partners & Work
- **Partner Accounts** — 7 party groups (Personal, Services, Financial, Business, Government,
  Agriculture, Office) with per-group types, P&L tracking, investment
  tracking, portfolio value, dual-entry transactions, mini ledger modal per party.
- **Partnership (भागीदारी)** — shared work: members with % shares (must total 100%),
  shared income/expense entries with "who paid" tracking, automatic settlement balances.
  New partnerships auto-add the current user as the first member; "Who paid?" lists all
  members (a free-text member uses a `__ps:<memberId>` payer value) and the settlement
  math attributes `paid` correctly for them. **Type-aware**: the Add/Edit
  modal opens with a Partnership Type chip row (Farm, Livestock, Business, Startup, Shop,
  Transport, Contractor, Freelance, Investment, Rental, Other) — Farm keeps crop+season;
  every other kind hides them and uses the Notes field for industry/description. The
  `kind` field is optional on the doc (absent = Farm) so existing partnerships render
  unchanged.
- **Works (कामे)** — work register for farm jobs, labour, hired work. Profession-driven:
  each onboarding profession maps to a matching work profile (Employee, Employer,
  Freelancer, Student, Homemaker, Investor, Retired, Shop/Business, Farmer, General),
  so a salaried user adds a Salary-style work, not a farmer default. Farmer-specific
  fields (crop, season, year, area) appear only for the farmer/farm-services profiles.
  Records direction, profile, work type, dates, party and partnership links, agreed
  amount. Payment tracking with full history and progress bar.

### Automation
- **Recurring Transactions** — automate bills and subscriptions with configurable
  frequencies and reminder days.
- **Budgets** — category-based monthly/yearly spending limits with overrun warnings.
- **Reminders** — one-time or recurring with "Mark as Paid" that creates expense
  transactions and auto-reschedules.

### Audit & Compliance
- **Audit Ledger** — full mutation log with entity type icons, action badges,
  expandable lifecycle chain, copy transition ID, CSV export, entity/action filters,
  search. Syncs across devices.
- **Archive** — soft-delete across all entity types with bulk restore, permanent delete,
  or empty-all (PIN-protected). Expired archived items are auto-removed from the local
  archive after 30 days.
- **Activity Log** — tracks 200 most recent security and CRUD events.

### Data Portability
- **Export / Import** — CSV, PDF (jsPDF), Excel (SheetJS), full JSON backup/restore
  with cross-user detection and reassignment. Audit trail + activity log included in
  backups and restored on import.
- **Cloud Sync** — PouchDB → Supabase `sync_docs`. **Link-only (no accounts)**: every
  device sharing the project URL + anon key reads/writes the same rows. Manual +
  live (realtime). All 10 data entities + audit log sync across devices. RLS is open
  (`using true`) by design — the URL + anon key ARE the secret; keep them private.
- **Cloud Setup Wizard** — 2-step setup guide (create project, run SQL) with auto-checking.

### Developer Tools (author-only)
- **Developer Zone** (`/dashboard/developer`) — private page for the owner, not
  exposed to users. Header shows live version + release-notes seen status + an
  inactivity timer. Sections, top → bottom:
  - **Data Management** — import a JSON/XLSX backup (with preview), export raw
    JSON, and a custom Excel/JSON export with date range + selectable sections
    (Income, Expenses, Investments, Categories, Party, Recurring, Works, Goals,
    Accounts, Partnership).
  - **Database & Cloud Sync** — Quick Connect to a Supabase project (URL + anon
    key; link-only, no sign-in), a temporary connection that never
    overwrites the saved Settings config; masked current-config readout; Remote
    Data Load Stats / Browse Rows (per-entity counts); and
    Pull Remote → Local / Push Local → Remote.
  - **Diagnostics** — sync health (masked URL, sync account, status, last sync
    event) with Test Connection, local DB stats across all 11 tables, storage
    usage, and a localStorage key/value inspector.
  - **Danger Zone** — two-stage confirmed destructive actions: Start Fresh
    (Clear Remote + Push Local), Clear Remote Only, Clear Local Only, Clear ALL
    Data (Local + Remote). All destructive/sync actions are connection-guarded.

### User Experience
- **i18n** — Marathi (default), Hindi, English. Grammar-preserving translations.
- **Dark / Light Theme** — toggleable, persisted.
- **3 Brand Colors** — Orange, Royal Blue, Emerald Green.
- **PIN Security** — 10 one-time 4-digit PINs for sensitive operations.
- **Multi-user** — multiple profiles with quick-switch.
- **Onboarding Wizard** — 6-step setup.
- **Skeleton Loading** — animated placeholders on data-heavy pages.
- **Remote Announcements** — broadcast pills and banner modals via jsonbin.io.
- **What's New Modal** — release notes, once per version.

---

## Architecture Overview

### Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router, static export) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, Lucide React |
| Local DB | Dexie.js 4 (IndexedDB) — 11 tables |
| Sync | PouchDB 9 (local buffer) + Supabase Postgres `sync_docs` |
| Charts | Recharts 3 |
| PDF | jsPDF + jspdf-autotable |
| Excel | SheetJS (xlsx) |
| Dates | date-fns 4 |
| Auth | Local profiles (PIN-protected) + Supabase anon key for cloud sync; Google OAuth builds a local profile + restores session on the login page (no Supabase accounts) |
| Mobile | Capacitor 8 (Android) — plugins: app, browser, filesystem, share, local-notifications, status-bar |
| Toasts | Custom context (`Toast.tsx`) — replaces `alert()` |

### Why Not...

- **Self-hosted/CouchDB sync** → Removed (Railway decommissioned). Replaced by Supabase — shared database model (link-only, no accounts). Same simplicity as old CouchDB sync but with Postgres + realtime.
- **Server components** → Cannot use. Dexie/PouchDB are browser-only. All pages `'use client'`.
- **Zustand/Redux** → Unnecessary. In-memory cache arrays + direct reads are simpler.
- **Prisma/SQLite** → Dexie is the only offline-capable option for browser storage.
- **react-i18next** → Unnecessary. Custom hook + translations.ts is simpler for 3 languages.

### Transaction Types

Exactly **three** types exist: `income`, `expense`, `investment` (union in `src/types/index.ts`). The old `saving` type was removed from the app — logic, charts, exports, and type union no longer reference it. Savings are tracked as goals only; goal **contribute** records an `expense` transaction, **withdraw** records `income`.

---

## Key Architectural Decisions

### 1. Data Flow Pattern
Every write: `id()` → cache → Dexie (fire-and-forget) → PouchDB (fire-and-forget) → mutation_log (fire-and-forget)

### 2. Soft-Delete Everything
Every entity has `deletedAt?: string`. Items disappear from active views, appear in Archive, and expired archived items are auto-removed from the local archive after 30 days.

### 3. transitionId System
Every entity gets a `transitionId` at creation. Links all mutations across lifecycle. Used in Audit Ledger.

### 4. Offline-First Cloud Sync (Supabase, link-only)
Local PouchDB buffer (`mm_pouch`) + Supabase `sync_docs` table as the cloud hub (not a relay — data IS stored on Supabase). Optional: app fully works offline without it.
- **Connect**: `connectRemote(url, key)` → create client + ping (no sign-in, no auth session) → save config → subscribe to realtime
- **Push**: upsert with `onConflict: 'id'` (single-column PK; every device shares the same rows)
- **Pull**: `select *` (open RLS); conflict resolution via `updated_at` (newer wins)
- **Live updates**: realtime channel on `sync_docs_realtime` (replica identity full); 30s reconnect interval; `startReconnectTimer` self-heals expired sessions
- **Schema migration**: one-time SQL (`supabase/schema.sql`) drops the old `user_id` column + composite PK + every RLS policy, dedupes rows (newest wins per id), creates single-column PK on `id`, sets open anon RLS policies, guards the realtime publication. Idempotent — safe to re-run.
- **URL/key defaults**: NONE — repo ships cloud-free; `src/lib/env.ts` reads from `.env.local` or Settings → Sync per device
- **Security tradeoff**: anyone with the project URL + anon key can read/write the data (same model as old CouchDB). Keep the URL private.
- **Docs/UI wording**: Settings label is "Shared database", never "accounts". `signUpUser` (old email/password cloud accounts) was removed. The login page's "Continue with Google" creates a **local** profile via Google identity + session restore for the local app auth — it does not create a Supabase account.

### 5. Local Auth with Multi-User
Users in localStorage `mm_users`. Session in `mm_session`. No server needed. Multi-device sync uses the shared-database anon-key model — no cloud login.

### 6. Future-Date Guard
Income/expense/investment entries cannot be dated after today. Dated picker capped via `max={todayStr()}`, submit validated with warning toast. Exempt: recurring start/end, task/todo due, investment maturity. Needed in: TransactionPage add/edit, Dashboard quick-add, Partners transaction modal.

### 7. Per-Type Categories
Categories are kept **separate** per transaction type — `mm_income_categories`, `mm_expense_categories`, `mm_investment_categories` + default base lists. Never merged across types (intentional: dropdowns stay relevant, budgets/breakdowns stay type-scoped).

### 8. Remote Announcements (jsonbin.io + edge cache)
Broadcast pills + banner modals are **remote-config**: JSON hosted on jsonbin.io, fetched through the site's own edge-cached proxy. Works in web AND installed APKs without app updates.
- **Bins**: broadcast `6aa8b329ac6210605ace3a6a` (array of pill objects), banner `6aa8b311ac6210605ace3a0b` (single object)
- **Quota protection**: apps fetch `https://moneymevaonline.pages.dev/api/announcements?type=broadcast|banner` — a Cloudflare Pages Function (`functions/api/announcements.js`, plain JS so Next tsc ignores it) that fetches jsonbin as origin and edge-caches via Cache API + `Cache-Control`. Cache window = `TTL_MINUTES` (currently **180 = 3 hours**). jsonbin volume is time-bound, not user-bound (~8×/day/bin ≈ 480/month worst case per POP) — far under the 10k free cap.
- **Fallback chain**: proxy fail → direct jsonbin `?t=${Date.now()}` + `cache: 'no-store'` (Bin IDs stay in env.ts for this) — announcements never go dark
- **Wiring**: Bin IDs + URLs stored as XOR+base64 obfuscated constants in `src/lib/env.ts` (`BROADCAST_BIN_ID`/`BANNER_BIN_ID`/`JSONBIN_BASE`/`ANNOUNCEMENTS_API`, runtime `_d()` decoder with key `'moneymeva'`) — invisible to bundle extraction; verified zero plain-text occurrences in `out/`. Function has its own hardcoded bin IDs (overridable via Pages env vars)
- **jsonbin response shape**: `{ record: <actual JSON>, metadata: {...} }` — components unwrap via `res?.record ?? res`
- **Broadcast pill** (`BroadcastBanner.tsx`): floating pill top-center over content — wrapper `fixed left-1/2 md:left-[calc(50%+8rem)] -translate-x-1/2 z-[9998]`, stacked via inline `style={{top: ${8+i*44}px}}`; **pill has NO positioning of its own**, only swipe-to-dismiss `transform: translateX(dragX)` (Tailwind v4 sets the independent CSS `translate` property, so class + inline transform ADD). Solid color-coded bg (info=blue-600, warning=amber-500, success=green-600, error=red-600); optional `link`; dismiss by X or swipe-left ≥70px; per-ID dismissal in localStorage `mm_dismissed_broadcasts`; `pinned: true` = no dismiss; fetched list cached at module level (`broadcastCache`)
- **Banner modal** (`BannerModal.tsx`): full-screen overlay `fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm`, centered card, optional image (max-h-64) + href; **skeleton loading card while fetching**; countdown (7s) starts only after full display (waits for image `onLoad`/`onError` with cached-image `complete` check); shows **once per app load** via module flag `bannerShownThisLoad`; NO localStorage persistence; scheduling via inclusive local-calendar-day windows through shared `isWithinPeriod(startDate?, endDate?)` in `utils.ts`
- Local `public/broadcast.json`/`public/banner.json` are dead fallbacks only
- Full editing workflow: `docs/BROADCAST-GUIDE.md`; Developer Zone → Remote Announcements tests BOTH proxy and jsonbin paths live

### 9. Works Module (कामे) — Pending Payments Register
Entity `WorkEntry` + Dexie v5 table `works`. One page covers both sides.
- **Direction model**: `receivable` (my work → payment to receive; ledger mirror = Income, category **"Work Payment"**) vs `payable` (hired work → I must pay; mirror = Expense, category **"Labor"**)
- **Profiles**: `WORK_PROFILES` in `defaultCategories.ts` — farmer, farm_services, labor, shop, contractor, transport, general — each with preset work types (i18n `works.types.*`). `profileForProfession()` maps onboarding profession → default profile; Farmer profession has farming categories.
- **Fields**: crop, season (`kharif|rabi|summer|annual`), year, area `{value, unit}` (acre/hectare/guntha/are), start/end dates (auto duration), party link, optional partnership link, agreed amount, payments[] with per-payment `linkedTransactionId`. Status derived by `getWorkStatus()` (pending/partial/paid); `workPendingAmount()` feeds the dashboard card.
- **Payments**: `recordWorkPayment(workId, {date, amount, note}, {alsoLedger})` appends payment, recomputes `paidAmount`, optionally auto-creates the mirrored ledger transaction (default ON).
- Work-type input = free text + datalist of profile presets; stored value is the translated label (human-readable).

### 10. Partnership Module (भागीदारी) — Shared Work With Settlements
Entities `Partnership` (members[] with `sharePct`, optional `kind`) + `PartnershipEntry`; UI = tab inside Party Accounts page (`Accounts | भागीदारी` segmented control, `src/components/PartnershipTab.tsx`).
- **Share validation**: members' percentages must total exactly 100% to save.
- **Kind picker**: `PARTNERSHIP_KINDS` (11) + `PartnershipKind` type — farm/livestock/business/startup/shop/transport/contractor/freelance/investment/rental/other, label keys `ps.kind.*` (mr/hi/en). `kind === 'farm'` (or missing → treated as farm for legacy) shows crop+season+year grid; all other kinds hide crop/season and show only year — Notes carries industry/description. Cards show a color-coded kind badge. `kind` flows through `addPartnership`/`updatePartnership` as a plain optional field (no schema change, no migration).
- **Settlement math** (`getPartnershipSummary`): per member `balance = incomeShare + paid − expenseShare` (shares = `total × sharePct/100`). Positive → member should receive from pool; negative → member owes pool.
- **Ledger mirroring**: entry save can auto-create a main-ledger transaction (category **"Partnership"**, description `"{title} · {detail}"`); edits/deletes keep the mirror in step via `linkedTransactionId`.
- **Sync**: all three entities wired through PouchDB `EntityType` + prefixes, archive, backup export/import, and `clearAllDB`. `processRemoteChanges` maps `partnership_entries` → cache key `partnershipEntries`.

---

## i18n System

### Languages
| Code | Name | Native Name | Default |
|---|---|---|---|
| `mr` | Marathi | मराठी | Yes |
| `hi` | Hindi | हिन्दी | No |
| `en` | English | English | No |

### Files
- `src/lib/i18n/translations.ts` — All translation data (phrase objects for mr/hi/en)
- `src/lib/i18n/index.tsx` — I18nProvider + useTranslation hook

### Hook Usage
```tsx
const { lang, setLang, t } = useTranslation();
t('nav.dashboard')           // "डॅशबोर्ड"
t('common.save')             // "सेव्ह करा"
t('tx.add', { title: 'खर्च' }) // "खर्च — नवीन"
```

### Translation Philosophy
- **Grammar stays native** — Marathi/Hindi SOV structure preserved
- **English loanwords only** for tech terms: Dashboard, Save, Sync, UPI, PIN, Google, Settings
- **Everyday words** for money: खर्च, बचत, पैसे, रक्कम, तारीख, श्रेणी, व्यवहार, उत्पन्न
- **No repetition** — vary word choice across keys (e.g., ध्येय not गोल for goals in Marathi)
- **Marathi hero**: "पैसे कुठे जातात? शोधूया." (relatable hook)
- **English footer**: Copyright always `© 2026 Money Meva.` in all languages

### Nav Labels (Marathi)
डॅशबोर्ड, उत्पन्न, खर्च, ध्येय, गुंतवणूक, पार्टी, आवर्ती, खाती, वर्ग, एडजस्टमेंट, सारांश, लेजर, आर्काइव्ह, सेटिंग्ज, माहिती, मदत, अटी, गोपनीयता

### Nav Labels (Hindi)
डैशबोर्ड, कमाई, खर्च, बचत, निवेश, पार्टी, आवर्ती, खाते, वर्ग, एडजस्टमेंट, सारांश, लेजर, आर्काइव्ह, सेटिंग्स, जानकारी, मदद, शर्तें, गोपनीयता

### Language Selector
- `src/components/LanguageSelector.tsx`
- Two variants: `default` (settings) and `minimal` (landing footer)
- Default uses `createPortal` to render at `document.body` — avoids parent `transform`/`overflow` clipping
- `fixed` positioning with `getBoundingClientRect()` for dropdown
- `z-[9999]` ensures dropdown above all content

---

## Global Toast System

- `src/components/Toast.tsx`
- `ToastProvider` wraps the root layout inside `<I18nProvider>` (see `src/app/layout.tsx`)
- `useToast()` returns a **callable** `(message, type?, duration?) => void` (binds `addToast`)
- Types: `success | error | warning | info` — colored toasts with icon, auto-dismiss (default 4000ms), click-to-dismiss
- Uses existing `.slide-up` CSS animation class (`@keyframes slideUp` already in `globals.css`)
- **Replaced all native `alert()` calls** (6 across settings, developer, adjustments)

---

## Skeleton Loading

- `src/components/Skeleton.tsx` — base `Skeleton` (pulse) + composites: `SkeletonCard`, `SkeletonTable`, `SkeletonChart`, `SkeletonList`
- Dashboard has local `CardSkeleton`/`ChartSkeleton`; Ledger uses skeleton rows
- Pattern: `animate-pulse` + grey rounded blocks (`bg-slate-200 dark:bg-brand-muted/30`)

---

## Empty States

All list/table/chart empty views show **icon + bold heading + grey hint** (not bare text). Done across: Dashboard (chart, expenses, recent, tasks, recurring, goals), TransactionPage (mobile/desktop/archive), Partners, Ledger, Archive, Adjustments.

---

## Database Schema (Dexie)

11 tables — `transactions, partners, recurring, budgets, reminders, adjustments, goals, works, partnerships, partnership_entries, mutation_log`:

| Table | Primary Index | Secondary Indexes |
|---|---|---|
| transactions | id | type*, date*, category*, userId*, deletedAt, account, transitionId |
| partners | id | group*, userId*, deletedAt, transitionId |
| recurring | id | txType*, status*, userId*, deletedAt, nextDate, transitionId |
| budgets | id | category*, userId*, deletedAt, transitionId |
| reminders | id | status*, userId*, deletedAt, transitionId |
| adjustments | id | accountType*, userId*, deletedAt, transitionId |
| goals | id | name*, userId*, deletedAt, transitionId |
| works | id | userId*, deletedAt, transitionId |
| partnerships | id | deletedAt, transitionId |
| partnership_entries | id | partnershipId*, deletedAt, transitionId |
| mutation_log | id | transitionId*, entityType*, entityId*, action*, timestamp*, userId* |

All features store data in Supabase via the single `sync_docs` table (deliberate one-table design; the `entity` column tags the feature). Entity values: `transaction | partner | recurring | budget | reminder | adjustment | goal | work | partnership | partnership_entry | pin | audit` (maps to the Dexie tables + PINs; `src/lib/store.ts` `entityMap`/`entityTableMap`, `pushAllToPouch`, PouchDB `ENTITY_PREFIXES`).

---

## PIN Security

- 10 random 4-digit PINs, no duplicates
- Single-use with index tracking, resets after 10
- Session auto-lock: configurable 1h–24h or off
- Stored in localStorage `mm_pins` + PouchDB `pin:batch` (entity `pin`)
- PIN input uses `type="text"` + `inputMode="numeric"` + `.pin-mask` (number inputs auto-increment on focus in some browsers)

---

## Theme System

- CSS variables: `--brand`, `--brand-secondary`, `--brand-light`, `--brand-dark`, `--brand-muted`
- 3 brands: Orange (default), Royal Blue, Emerald Green
- Dark mode via `.dark` class on `<html>`, persisted in `mm_theme`

---

## Page Details

### Dashboard (`/dashboard`)
- Summary cards with animated counters
- 6-month cash flow AreaChart, spending PieChart
- Balance carry-forward, sync card
- Goals, Recurring cards — always visible with empty-state placeholders
- Upcoming Reminders card
- Notes: `aggregates` has no `saving` field; available-to-spend = income − expense limit − invest limit (quotas 15%/35%)

### Income / Expenses / Investments (`/dashboard/{type}`)
- Shared `TransactionPage` component
- Desktop: table with Date, Category, Description, Amount, Partner, Actions
- Mobile: minimal list with tap-to-view detail modal
- **Badges**: category badge (slate pill) + account badge (Cash/Bank/UPI/Invest, colored) shown beside the date in the mobile list and next to the description on desktop — one shared `ACCOUNT_BADGE` map in `TransactionPage.tsx`; works in the Android APK too
- Add/Edit modals with searchable category + party dropdowns
- Search, filters (category/date/amount), sort, group by day/week/month
- 30-day default date filter (`filterDateFrom` init = local-tz date −30d; "Clear Filters" shows all)
- Archive tab for soft-deleted items
- Future dates blocked (date picker `max` + submit toast)
- **Party field**: no parties → disabled "None" input; else dropdown of 3 most-used parties; typing searches all; unmatched name → "Create Party (Name)" opens inline modal (group/type/description) → "Create & Select"

### Partners (`/dashboard/partners`)
- Groups: Personal / Services / Financial / Business / Government / Agriculture / Office (constants in `src/lib/parties.ts`)
- P&L per partner, mini ledger with transaction history
- Add/edit modal (pre-filled on edit, `updatePartner`), duplicate guard skips self

### Recurring (`/dashboard/recurring`)
- Active/stopped recurring transactions
- Frequency: daily, weekly, monthly, yearly, custom
- "Advance" button creates transaction, computes next date
- Add-modal category field swaps suggestion set when the Type changes (income vs expense)

### Categories (`/dashboard/categories`)
- Three tabs: Income / Expense / Investment categories
- Reads from `mm_income_categories`, `mm_expense_categories`, `mm_investment_categories` + categories found in transactions
- Inline edit, delete with confirmation, add new
- PIN-protected batch save
- Default categories set during onboarding (profession-based), surfaced in dropdowns via `recentCategories`

### Settings (`/dashboard/settings`)
- Profile, PIN Security, Brand picker, Theme toggle
- Multi-Device Sync (Supabase, **link-only**): URL + anon key (auto-filled from `.env.local`), Connect / Sync Now / Disconnect — no email/password, no cloud accounts
- Export/Import (PDF, Excel, JSON) — summary exports have no Savings column; on Android exports open the native share sheet
- Language selector with portal dropdown
- Credit/Notification & Popups section; Danger Zone

### Audit Ledger (`/dashboard/ledger`)
- Full mutation log: entity type icons, action badges, expandable lifecycle chain, copy transition ID, CSV export, entity/action filters, search. All 11 entity types filterable.

### Investment Calculator
- 4 scrollable pill tabs: FD, SIP, RD, PPF (no Lumpsum). "Use this amount" fills the add form. Accessible from the Investments page header (type === 'investment' only).

---

## Build & Dev Commands

```bash
npm run dev                  # Next.js dev server on localhost:3000
npm run build                # Static export to out/ (auto version bump)
npm run version:patch        # vX.Y.Z.N → vX.Y.Z.N+1
npx cap sync android         # Sync web build to Android project
npm run lint
npm run android:apk          # build → version → gradle assembleDebug
```

Launchers: `start.bat` / `start.sh` (production on :3000), `start-dev.bat` / `start-dev.sh` (HMR), `stop-server.bat` / `stop-server.sh` — see `scripts/serve.cjs`, `scripts/fresh-check.cjs`. Logs: `.server.log` / `.dev-server.log` (gitignored).

---

## Known Gotchas

### PouchDB / Supabase Sync
- `db.type()` deprecated in PouchDB 9.x (harmless warning)
- `_`-prefixed custom fields (like `_entity`) rejected — use `entity` instead
- Upserts use `onConflict: 'id'` (single-column PK). The old composite `(user_id, id)` was removed by the v7.3.x migration (541 multi-account rows deduped to 241 — newest `updated_at` wins per `id`)
- Realtime requires `ALTER PUBLICATION supabase_realtime ADD TABLE sync_docs;` + replica identity full, else events never fire
- Pull tri-state: rows already up-to-date locally are "skipped" (not "failed") — only genuine storage errors count as failures
- Push errors surface the first real Postgres error message (e.g. RLS policy violation, ON CONFLICT mismatch)
- Schema migration drops PK/FK constraints BEFORE the `user_id` column (Postgres won't drop a column that's part of a constraint without CASCADE)

### Dexie
- Bulk operations: chunk at 500 items
- Compound indexes are comma-separated strings
- `db.table.put()` silent on failure (fire-and-forget)

### Next.js Static Export
- `output: 'export'` — no server-side features
- All pages must be `'use client'`
- Images unoptimized

### Runtime Config (env.ts)
- `NEXT_PUBLIC_*` env vars ARE read since v7.2.0.8 (Supabase URL/key/SITE_URL overrides at build time); defaults are EMPTY (cloud-free repo). Supabase URL/key can also be set per-device in Settings → Sync
- To rotate a value: encode with the node one-liner in CLOUD-SYNC-GUIDE.md, paste into env.ts, rebuild
- Obfuscation defeats bundle grep/extraction only — network traffic still reveals runtime calls. Anon key is public-by-design (RLS protects the data)

### i18n / UI
- `Reveal` component `transform` breaks `fixed` positioning — use `createPortal` for dropdowns
- Default language saved in `mm_language`; `getDefaultLanguage()` returns `'mr'`
- One element = one centering mechanism; motion (transform) belongs on a wrapper, positioning on the element (Tailwind v4 `translate` is independent of `transform`)

---

## What Changed Recently

### v7.3.x — now
- **Docs/maintenance pass** (v7.3.0.39+) — stale in-app copy fixed (Settings sync panel no longer references email/password cloud accounts), dead `signUpUser` removed; memory capsules merged into this single root file
- **Partnership Type field** — 11-option kind picker; legacy docs without `kind` default to Farm
- **Accrual credit model** — credit counts at record time; auto-linked payment-pending Adjustments, FIFO settlement
- **Settlement rows excluded everywhere** — `Credit Settlement` never in income/expense totals; "Credit only" filter chip
- **Adjustments page** — Source + Status columns; idempotent credit backfill on first load
- **Credit alerts + Notification & Popups settings** — CreditAlertModal, per-type popup toggles, partner credit limits (₹10k default) + settle-within days (30)
- **PIN input fix** — `type="text"` + `inputMode="numeric"` + `.pin-mask`
- **Restore-linkage fix** — restoring a deleted credit transaction also restores its archived linked adjustment
- **Recurring categories follow type** — category suggestions swap with Type; `useSortedCategories` recomputes on `[type]`
- **Broadcast pill placement** — centering on `fixed` wrapper; pill carries only swipe transform
- **Shared sync database (link-only, no accounts)** — `connectRemote(url, key)` = client + ping only; upserts `onConflict: 'id'`; open RLS; old `user_id` column + FK dropped by hardened one-time migration
- **Schema migration hardened** — drops every policy, drops PK/FK before column drop, guards realtime publication; safe to re-run
- **Pull tri-state** — up-to-date rows = "skipped" not "failed"
- **Push error detail** — surfaces the first real Postgres error
- **Cloud Setup Wizard simplified** — 2 steps (create project, run SQL); Google sign-in steps removed
- **Cloud Setup Wizard** — auto-checking 4-step wizard for new users

### v7.2.x
- **Cloud-free by default** — repo ships zero Supabase credentials
- **Audit trail sync** — `mutation_log` syncs across devices via PouchDB (local prefs remain local-only)
- **Audit trail in backups** — JSON export/import includes audit + activity log
- **Calendar month filter** — Accounts page uses proper month picker
- **GitHub Pages hosting** — static export at `/moneymeva` (`https://kuldeep7ke.github.io/moneymeva/`); base path auto-derived from repo name
- **Cloudflare Pages hosting** — Cloudflare project `moneymevaonline` (`https://moneymevaonline.pages.dev`); a workflow gated on `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` was later **removed** — deploys happen via the repo's Cloudflare-native GitHub integration (both CF projects auto-deploy on push)
- **Docker image** — published to ghcr.io on every version tag
- **Session auto-restore** — landing page restores cloud session, skips to dashboard
- **OAuth redirect fix** — Google login returns to correct origin
- **Cross-platform scripts** — .sh launchers for Mac/Linux alongside Windows .bat
- **Ledger filter completeness** — all 11 entity types filterable in Audit Ledger
- **Todos removed** — deleted end-to-end; savings & goals own the savings experience
- **Profession-driven Works** — onboarding profession → matching work profile; farmer-form fields restricted to farmer profiles
- **Full data-clear wipes cloud session** — settings + developer clear-all sign out, strip `sb-` tokens, hard-nav to login
- **In-app confirm modals + toasts** — native `confirm()`/`alert()` replaced

---

## Deep Change Log (v7.3.0.27 → v7.1.1.26)

### v7.3.0.27 (2026-09-11) — Partnership Type Field (Non-Farm Partnerships)
- Partnerships are no longer farm-only. Add/Edit modal opens with an 11-kind chip row (Farm, Livestock/Poultry, Business, Startup, Shop, Transport, Contractor, Freelance/Services, Investment/Trading, Rental/Property, Other).
- Farm keeps crop + season + year; every other kind hides crop/season and shows a generic year — Notes carries industry/description; contextual hint (`ps.farmHint` vs `ps.businessHint`).
- Cards: color-coded kind badge; subtitle switches based on kind.
- Data model: optional `kind` on `Partnership` (absent = farm); flows through `addPartnership`/`updatePartnership` as plain JSONB — no schema change, no migration.
- Verified: tsc clean, no new eslint errors, bundle check confirmed all 11 labels + picker in `out/`; all 4 pipelines green on tag.

### v7.3.0.24–25 (2026-09-11) — Recurring Category Fix + Broadcast Placement Fix
- Recurring add-modal category dropdown swaps suggestion set with Type (income → Salary/Business/Freelance/…, expense → Bills/Premium/…); switching type clears selection; `form.txType` widened to `'expense' | 'income'`. (`useSortedCategories` was recomputing on an empty deps array.)
- Broadcast pill misplacement (v7.3.0.21 regression): inline `transform` + Tailwind v4 `-translate-x-1/2` (independent `translate` property) ADDED → pill sat a full width off-center. Fix: positioning on `fixed` wrapper only, pill keeps only swipe transform; desktop pills center over content area.
- Verified: tsc clean; deployed through all 4 pipelines.

### v7.3.0.21–23 (2026-09-10) — Accrual Credit Model, Credit Alerts & Adjustments Overhaul
- Credit purchases/sales count in totals at record time (`account: 'credit'`); each auto-creates a pending Adjustment (`sourceType`, `settleStatus`, `settledAmount`). FIFO settlement in Party Account.
- All `Credit Settlement` rows excluded from every income/expense total; real payment leg hidden but moves balances; opposite-side clearing row shows with amber **"Credit settled"** badge + "Credit only" chip.
- Adjustments page: Source + Status columns; partner names via `partnerMap`.
- Partner `creditLimit` (default ₹10,000) + `creditSettleDays` (default 30); Near Limit/Limit Reached badges (`getPartnerCreditStats`, `creditLimitFor`/`creditSettleDaysFor` in `src/lib/parties.ts`).
- `backfillCreditAdjustments()` in `initDB()` (guard + idempotent): backfills pending adjustments, replays settled clearances FIFO.
- Delete/restore linkage: deleting a credit tx archives linked pending adjustments; restoring restores both (v7.3.0.22 fixed the filter).
- CreditAlertModal + NotificationPanel credit icon + "Notification & Popups" settings; `notification-prefs.ts`.
- Verified: build green; 18/18 DB-layer simulation checks pass; 4 pipelines green.

### v7.3.0.11 (2026-09-10) — Docs Restructure + Full-App Verification
- Route/nav/i18n audit: all nav items map to real pages; support/terms/privacy published; developer hidden.
- README version + Partner Accounts bullet, MEMORY-CAPSULE `Partners & Work`, USER-GUIDE groups aligned (7 groups via `src/lib/parties.ts`).
- Verified: lint (only repo-wide baseline) + build green, 30/30 static routes.

### v7.3.0.10 (2026-09-10) — Supabase Sync Architecture Verified
- ALL features store data in Supabase via the single `sync_docs` table (one-table design; `entity` column tags the feature): `transaction | partner | recurring | budget | reminder | adjustment | goal | work | partnership | partnership_entry | pin | audit`.
- Party groups/types are app constants (`src/lib/parties.ts`); partnership `__ps:` payer pseudo-ids are jsonb values in `partnership_entry` docs.
- Live-verified against shared project `orpgmbrycnmjwtalupce` via REST + realtime (sync_docs exists; anon RLS; realtime subscribed).
- schema.sql: added `sync_docs_user_entity_idx` (now superseded by the single-PK migration).

### v7.3.0.7 (2026-09-10) — Developer Zone Restructured + Docs Policy
- Developer page restructured (owner-only): Data Management top; Database & Cloud Sync, Diagnostics, Danger Zone bottom.
- Docs policy: developer page documented ONLY in the memory capsule (references removed from README, File-Map, Changelog, BROADCAST-GUIDE).
- Party redesign: 3 group constants → 7 groups via `src/lib/parties.ts`, auto-migration (`mm_partner_groups_v2`), type remap (vendor→business, customer→business, contact→personal).

### v7.2.0 (2026-08-23) — Big Update + Supabase Sync Audit
- Accounts page rebuilt: Cash, Bank, **Capital** (Capital/Drawings txs), **Revenue** & **Expenses** (period pills 1W–ALL; exclude non-operational).
- Stats integrity: `getAggregates()` + `getMonthlySummary()` exclude `NON_OPERATIONAL_CATEGORIES = ['Transfer','Capital','Drawings']` — transfers no longer double-inflate Income+Expense.
- Dashboard: 6 compact cards (`xl:grid-cols-6`). Perf: dashboard scans tx array once via `useMemo`; fake loading delays removed; NotificationPanel poll 20s→60s.
- SUPABASE SYNC AUDIT (verified): all 11 Dexie entities sync via `syncWriteDoc`/`putDoc`; permanent deletes push `{id, deletedAt}` tombstone via `deleteFromCacheAndWrite`; PIN batch `pin:batch` (entity `pin`) syncs too.
- Doc key-name fixes: real keys `mm_pouch_url` / `mm_sync_key` / `mm_pouch_urls` / session `sb-<ref>-auth-token`.
- Formulas verified: FD `P(1+r/n)^(nt)`, SIP annuity-due, RD quarterly, PPF yearly, partnership settlement, works pending.

### v7.1.1.99 (2026-08-23) — Works (कामे) + Partnership (भागीदारी)
- Works page, Partnership tab, Dexie version(5) adds `works`/`partnerships`/`partnership_entries`; full store CRUD + archive + backup + clearAllDB coverage; onboarding Farmer 🌾 profession. ~120 new i18n keys ×3.

### v7.1.1.94–.96 — TTL in Minutes
- `TTL_SECONDS` → `TTL_MINUTES`, set to 10 (~290 req/day worst case per POP). Later raised to 180 for the 3h window.

### v7.1.1.93 — Edge-Cache Proxy for jsonbin Quota
- `functions/api/announcements.js` (Cloudflare Pages Function, plain JS), edge-caches 1h, CORS `*` for APK. Both components + Developer Zone hit proxy first, direct-jsonbin fallback.

### v7.1.1.91 — Banner Once Per Load + Broadcast Cache
- `bannerShownThisLoad` module flag; `broadcastCache` module-level cache.

### v7.1.1.90 — Local-Day Period Windows
- `isWithinPeriod(startDate?, endDate?)` in `utils.ts` — inclusive local calendar days (old UTC parse shifted ~5.5h in IST).

### v7.1.1.89 — Banner Load-Aware Timing
- Skeleton while fetching; countdown 7s starts only after full display (image `onLoad`/`onError`, cached-image `complete` ref check).

### v7.1.1.87 — Developer Zone Refresh
- Live version header, Sync Diagnostics (masked URL, connection test, last sync event `getLastSyncEvent()`), Remote Announcements test section.

### v7.1.1.85–.86 — Secret Obfuscation
- Runtime secrets → XOR+base64 obfuscated constants in `src/lib/env.ts` (`_d()` decoder, `_K='moneymeva'`); removed `process.env.NEXT_PUBLIC_*` reads (`.env.local` inert). Verified zero plain-text in `out/`.

### v7.1.1.84 — jsonbin Bin IDs Wired
- Broadcast/banner Bin IDs baked in `.env.local` + fallbacks in env.ts; jsonbin is live source of truth.

### v7.1.1.82–.83 — jsonbin.io Remote Config
- Components fetch `https://api.jsonbin.io/v3/b/<BIN_ID>/latest` when configured, else local fallbacks; `res?.record ?? res` unwrap.

### v7.1.1.81 — Banner Date Scheduling
- `startDate`/`expires` (YYYY-MM-DD) windows.

### v7.1.1.77–.80 — Banner Modal
- `public/banner.json` + `BannerModal.tsx` wired into DashboardLayout (z-[10000]); X with 5s countdown; session-only dismissal.

### v7.1.1.70–.76 — Broadcast Pill System
- `public/broadcast.json` + `BroadcastBanner.tsx`; final **centered floating pill** that never pushes content; optional `link` + emoji; array format for stacked pills. `docs/BROADCAST-GUIDE.md`.

### v7.1.1.72 — Archive Panel Moved to Top
### v7.1.1.66 — Category Badges on Mobile
### v7.1.1.68 — Entry Submission Toasts
### v7.1.1.69 — What's New Modal
- On dashboard load, compares build version (meta `app-version`) vs `mm_seen_release`; shows once per version.

### v7.1.1.65 — Sync Status Stability + Native Exports + Mobile Badges
- Sync flicker fixed: `checkConnection()` self-heals (recreates client, `getSession()` auto-refreshes token if expired, re-pings, re-subscribes); `startReconnectTimer` dispatches sync event on reconnect; Settings re-checks via `listenSyncEvents`.
- Android exports fixed: blob-URL anchors don't work in Capacitor WebView → `@capacitor/filesystem` + `@capacitor/share`; `downloadBlob()` native path writes to `Cache/exports/`, native share sheet, auto-delete after 60s.
- Account badges on mobile list via module-scope `ACCOUNT_BADGE` map.

### v7.1.1.64 — Account Badges (Desktop)
### v7.1.1.63 — Default 30-Day Filter Restored
- `filterDateFrom` init = local-tz date −30d.

### v7.1.1.62 — Visibility & Boot Hardening
- `Reveal.tsx` rebuilt (IntersectionObserver safety timer, immediate reveal if in viewport); `initDB()` hardened (try/catch so `ready` + store-ready always fire); all data loads try/catch.

### v7.1.1.60 — Full Audit & Bug-Fix Pass
- `todayStr()` local-date helper replaced UTC `toISOString().split('T')[0]` (UTC made today = yesterday in IST).
- `advanceRecurring` accepts overrides, parses nextDate in UTC; `updatedAt` added everywhere; `permanentDeleteAllArchived` bulk-deletes rows; `deleteFromCacheAndWrite` writes tombstones (permanent deletes propagate); `clearAllDB` pin-key fixes.
- `pushLocalToRemote` upserts tombstones for `_deleted`; `startReconnectTimer` detects expired sessions → recreate client + auto-refresh; OAuth logs → `console.debug`.
- TransactionPage amount>0 guards, investSource `'bank'` default (real "Investment Outflow" expense), quick filters real weeks/months/quarters + local dates, edit-modal category memo fix; dashboard recurring advance single-call, Sync Now try/finally, investments violet in Recent Transactions; summary goal % guard; partners amount>0 + linked-count delete warn; settings backup reads `getSession().user`, import/export CSV escapes + partnerId mapping; categories listens for `store-ready`; InvestmentCalculator "Use this amount" fills `result.invested`; onboarding seeds `mm_investment_categories`; `localAuth.updateProfile` fixture; account "Logout & Clear Data" calls `clearAllDB()`; i18n footer + Marathi hero.
- Known-deferred (documented): store getters have no userId filtering (multi-user local profiles share one dataset by design; cloud isolation handled by Supabase RLS); plaintext passwords in `mm_users`; partner delete leaves orphaned `partnerAccountId`s (soft-delete is safe); duplicate toast systems left as-is.

### v7.1.1.34 (2026-08-17) — Cloud Sync 2.0 (Supabase) — historical
- Migrated CouchDB → Supabase after Railway CouchDB died. Supabase project `orpgmbrycnmjwtalupce`: `sync_docs` with **per-user** PK `(user_id,id)` + `sync_docs_own_*` RLS; `signUpUser`, `connectRemote(url, key, email, password)`. **This per-user model was later replaced** by the link-only shared model (see "Shared sync database (link-only, no accounts)") — the old auth-session path, `signUpUser`, and `sync_docs_own_*` policies are gone.

### v7.1.1.33 — Party edit button
### v7.1.1.32 — Future-date guard (max={today} on pickers)
### v7.1.1.31 — Removed the `saving` transaction type entirely (`'income' | 'expense' | 'investment'`)
### v7.1.1.29 — Summary page removes Savings card/bar
### v7.1.1.28 — Global Toast system + Skeleton library
### v7.1.1.26 — Party field defaults "None"; no backdrop click-to-close on modals; Categories page

---

## Sync Debug — From Scratch (historical, CouchDB era)

### The Bug (Pushed 0 · Pulled 0)
`putDoc` added a `_entity` field to every PouchDB doc. PouchDB 9 rejects custom fields starting with `_` (only `_id`, `_rev`, `_deleted`, `_attachments`, `_conflicts` allowed). Each `localDB.put()` threw `"Bad special document member: _entity"` — silently caught, zero docs reached CouchDB.

### The Fix
Renamed `_entity` → `entity` everywhere (`src/lib/pouchdb.ts`, `src/lib/store.ts`). Backward compat: `pullAll`/`processRemoteChanges` fall back to `doc._entity` for old remote docs.

### Supabase migration (v7.1.1.34 → now)
Remote is no longer a CouchDB database. `pullAll` maps `sync_docs` rows back into PouchDB docs (`id` → `entityType:id`); push maps PouchDB docs back to rows. Old CouchDB-era docs keep working (same `entityType:id` ids).

---

## Obsidian Vault (`docs/`)

- Home → Start-Here → File-Map (every source file linked)
- Active-Tasks / Bug-Tracker / Changelog
- Templates: Feature, Bug Report, Daily Dev Log, Quick Note
- Reference: Architecture, Data-Flow, i18n, Sync, Security, Capacitor
- `.obsidian/` is git-ignored (local user settings)

---

## The Numbers

- **11 Dexie tables** — transactions, partners, recurring, budgets, reminders,
  adjustments, goals, works, partnerships, partnership_entries, mutation_log
- **1 Supabase table** — sync_docs (PK: id)
- **10 synced data entities + audit entries** — transactions, partners, recurring,
  budgets, reminders, adjustments, goals, works, partnerships, partnership_entries
  push through one doc store, plus the mutation_log audit trail (and `pin:batch` for PINs)
- **3 languages** — Marathi, Hindi, English
- **3 brand colors** — Orange, Blue, Green
- **10 one-time PINs** — for sensitive operations

---

## Author

Made by Kuldeep7ke with care for Indian users — farmers, traders, small business
owners, and anyone who wants financial clarity without privacy compromise.

© 2026 Money Meva. All rights reserved.

---

*This file is the project's memory. Update it when the soul changes.*