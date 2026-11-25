# Changelog

## v7.3.0.77 (2026-11-26) — Redeployed from master, and the deploy checks were holding the wrong evidence
- **No source change.** `workflow_dispatch` on `Deploy to GitHub Pages` rebuilt and republished `135520e`; CI's `prebuild` stamped `.77`, so the repo number was realigned to match what is live (run `45701071595`, green).
- **The artifact is now proven, not inferred.** All 21 chunks the live `/dashboard` references compare byte-for-byte (`cmp`) against a local `DEPLOY_TARGET=gh-pages NEXT_PUBLIC_SUPABASE_URL= …_PUBLISHABLE_KEY= npm run build`. CI's env is required: gh-pages mode sets basePath `/moneymeva`, which changes the module graph, so a plain local build shares only 18 of the 21 names. 0 live chunks contain the project ref, and the 2 `supabase.co` hits are placeholder prose (`your-project.supabase.co` and its हिन्दी/मराठी localisations).
- **Two of my own checks were wrong and are corrected forward.** They read `curl …/moneymeva/dashboard/ | grep app-version` and called that "live version confirmed" — but GitHub Pages maps `/dashboard/` to `dashboard/index.html`, which the export does not write, so the slashed URL is a **404 whose body is the app's own `404.html`**. That page carries the same `app-version` meta and then redirects to the dashboard, so the grep looked green while proving nothing. Canonical URLs are slash-free (`/dashboard`, `/dashboard/settings` → 200), in-app `<Link>` hrefs already are, and `docs/TASK-BOARD.md` §5 now asserts `%{http_code}` instead of a bare grep.
- Left as an owner decision, not changed here: whether to set `trailingSlash: true` so both forms work, or keep the extensionless form canonical and document it. It rewrites every public URL, so it is not a verification-pass fix.

## v7.3.0.69–.76 (2026-11-26) — Painted gradients measured: the last low-contrast pairings
- **Gradients are now in scope.** The pass below excluded painted gradients ("pixels cannot be sampled"). They are the app's most common header/stat-card surface, so the harness learned to decompose `linear-gradient(...)` into its colour stops, sample each through a canvas, **composite translucent stops over what is actually behind them** — a `dark:from-sky-900/20` stop is not opaque — and score the worst stop against AA. 96 loads over 26 routes × light/dark × 3 brand presets, 8,056 text leaves, 0 failures at the end.
- **Loading a route is not driving it.** The same pass was repeated against click-reached surfaces: the What's-New popup, the forgot-password dialog, the Add-transaction modal, and the Developer zone behind its "I Understand, Continue" gate. That found what the load sweep could not — the developer page had only ever been measured as its 4-leaf gate screen (141 leaves behind it), and two chips there failed: `text-red-600` on a red-100 panel measured **4.34:1** ("Clear Remote Only", "Clear Local Only" → `text-red-700`). Also fixed: `opacity-90` labels on the dashboard carry-forward cards (3.82:1 on the green preset) and on the Partners "Total Invested" card, and the landing badge `text-orange-600/70` (2.48:1 → `text-orange-700`, 5.18:1).
- **Solid-accent gradient heads retoned.** White captions on `from-amber-500/600`, `from-red-600`, `from-green-600` and `from-sky-500 to-blue-600` measured 3.3–4.4:1, so the fills stepped to `from-amber-700 to-orange-800`, `from-red-700 to-rose-800`, `from-green-700 to-emerald-800` and `from-sky-700 to-blue-700`, and the `-100` caption colours became plain `text-white` (4.6–4.9:1). `src/app/dashboard/developer/page.tsx`, `src/app/dashboard/settings/page.tsx`, `src/app/login/page.tsx`, `src/components/CloudSetupWizard.tsx`, `src/app/dashboard/works/page.tsx`.
- **The PIN guide header ran `from-brand to-orange-600`** — a preset colour next to a fixed one, which made its label unreadable in the blue/green presets. It is `from-brand to-brand-hover` now, so both stops follow the preset.
- **`opacity-*` removed from labels that sit on a brand fill**: white at 0.9 over `--brand` measured 3.82:1 on the green preset. The label token (`--brand-on`) carries the contrast; the alpha discarded it.
- **Pastel-wash floors** in `src/app/globals.css`: the public pages wash the viewport `from-brand-light → to-brand-secondary`, so muted slate text lands on #FFCF9A, not white — those utilities step to `slate-600` in light mode (5.28:1 on the pastel). The dark variant ends on `brand-muted`, which the blue/green presets tint, so metadata over it gets `#A9B8CC` (5.70 / 4.82 / 6.08 across presets). `text-brand` and `hover:text-brand-secondary` inside the wash resolve through `--brand-dark` / `--brand-ink` instead of sitting at 1.43:1 on a pastel.
- **Four measurement traps had to be closed before any of this was trusted**: 54 dark "failures" on Settings info cards were translucent `/20`–`/30` gradient stops compared as if opaque; ~300 more were `.reveal` subtrees still at `opacity: 0` because an off-screen iframe never fires the IntersectionObserver (force-revealing them is what surfaced the green-preset carry-forward failure); `transition-colors` sampled mid-flight produced a fake 1.46:1 reading for "Continue with Google" (live computed colour is `slate-300`, 5.9:1); and disabled controls, which WCAG 1.4.3 exempts, were counted.
- **Field labels verified in the running UI**, not in source: Settings shows "Publishable key" (0 mentions of "anon key"), the Setup Guide and Developer zone match it, and dismissing What's-New writes `mm_seen_release` for the running build — `releaseBase()` ignores the 4th segment, so the popup does not reopen on the next build.
- **The in-app logo was a 1000×1000, 292 KB JPEG** shown at 64–80 px. `src/app/loading.tsx` renders it, React hoists that `<img>` into `<link rel="preload" as="image">`, and the static export therefore put the preload in the head of **all 28 pages** — every route paid 292 KB for a mark that only appears on the loading, landing-adjacent and error screens. `public/favicon-256.jpg` (7.6 KB, same artwork, lanczos-resized) replaces it in the seven call sites; the master file stays in `public/` as source. Console is now clean apart from a favicon-preload note that this fix removes.

## v7.3.0.51–.68 (2026-11-26) — Full-app verification pass: contrast, forms, gates
- **Contrast measured, not guessed.** A headless harness loaded every static route, walked every leaf text node, composited its colour over the real ancestor background (canvas + WCAG maths, CSS `opacity` included) and checked it against AA. Light mode: 2,179 nodes over 21 routes, 0 failures. Dark mode: same pages re-run per brand preset, 0 failures (the blue/green presets had been hiding 103 near-misses).
- **Token split for the orange preset** — `#FF8A3D` clears 4.5:1 against neither white text nor the white surfaces it sits on, so presets now carry `--brand-on` (label on a brand fill), `--brand-ink` (brand used *as* text) and `--brand-ink-light` (the same ink for light-only islands). `.text-brand`, hover variants and white-on-brand labels resolve through them.
- **Legibility floors** in `src/app/globals.css` for the utilities that measured 1.4–4.5:1 in practice (`text-slate-300/400/500`, the `-500/-600` accent shades, solid accent fills behind white labels, `text-[9px]/[10px]` → 11px), with dark-mode counterparts for `dark:text-slate-500`, unpaired `text-red-500/600` and `text-slate-500`, and a `brand-muted` strip ink (`#A9B8CC`) because the blue/green presets tint that strip and cost the muted ink ~1:1.
- **`.mm-surface-light`** marks subtrees that stay light regardless of theme (the landing page hero and its mock app panels), so the dark floors no longer drop their copy to 1.8–2.6:1.
- **Call-site fixes where a token could not help**: `-600` ink on `-100` chips → `-700` (summary, partners, settings), toasts to `-700` fills, primary-button hover to `--brand-hover`, brand-gradient stat cards to solid `bg-brand` (the label token is only defined for the solid pairing), captions on brand fills `opacity-80` → `opacity-90`, decorative `|`/`·` separators retoned.
- **In-form Cancel buttons were submitting.** `ui/Button` sets no default `type`, so 16 Cancel/secondary buttons inside `<form>` fired the page's add/edit handler — closing a modal could create a row. All now say `type="button"` explicitly.
- **Adjustments validate through the app** — the amount field uses `aria-required` so the toast explains the range instead of the browser's own bubble swallowing the message.
- **CSV import is strict** (`src/lib/csv-import.ts`): quoted fields with commas/doubled quotes, calendar-valid `YYYY-MM-DD` dates, `income|expense|investment` whitelist, party matched by id or name, positive amounts only. Anything else is reported per line instead of being quietly coerced.
- **Developer zone gates** — data wipes, "start fresh", and PIN disclosure now require a PIN as well as the two-stage confirmation (`src/app/dashboard/developer/page.tsx`).
- **One Supabase client per credentials** (`src/lib/pouchdb.ts`) — the reconnect timer and connection checks each built a client, leaking GoTrue instances and refresh timers into one session.
- **Legal pages share their content** (`src/lib/legal.ts`, `src/components/legal/`), so `/privacy` ↔ `/dashboard/privacy` and `/terms` ↔ `/dashboard/terms` cannot drift; dates and the end-to-end wording corrected.
- **Dialog/toast semantics** — `role="dialog" aria-modal aria-labelledby` on the modals that lacked them, `aria-live` region + `role="alert"`/`status` on toasts, `aria-label` on the PIN field, language menu keyboard navigation (arrows/Home/End/Escape, focus return).
- `common.sessionLocked` added to all three dictionaries; `docs/File-Map.md` rewritten against the tree (26 routes, component and lib tables); dead `public/banner.json` + `public/broadcast.json` removed and `docs/BROADCAST-GUIDE.md` corrected to say there is no bundled fallback.

## v7.3.9 (2026-09-11) — Pull "failed to store" false alarm fixed
- Rows already up-to-date locally (e.g. right after a successful push) were counted as **failed** pulls, producing a scary "Fetched 241 remote row(s) but failed to store them locally" after a healthy sync. Pull now distinguishes **applied / skipped / failed**; only genuine storage failures trigger the error.

## v7.3.8 (2026-09-11) — Bullet-proof Shared Schema + Live Cloud Count
- **Schema migration hardened**: the SQL now drops *every* RLS policy on `sync_docs` (not just the known names) before remodelling, so a partially-migrated/older project can't leave stale policies blocking the `id`-only key. Fixes "no unique ... constraint matching the ON CONFLICT specification" on projects that still have the old `(user_id, id)` key.
- Cloud-row count now refreshes right after a successful Connect sync, so you can see rows appear immediately.

## v7.3.7 (2026-09-11) — Push Error Detail + Schema Hint
- Push errors now include the first real underlying error (e.g. RLS "new row violates row-level security policy" / "null value in column user_id") so a wrong/missing schema is obvious instead of a bare "N write failure(s)".
- Settings 0-rows warning now says to run `supabase/schema.sql` (Setup Guide → Copy SQL) when Connect works but upload fails.

## v7.3.6 (2026-09-11) — Shared Sync Database (no accounts)
- **Sync is now link-only and shared** — the old CouchDB model is back: every device that connects with the project URL + anon key reads and writes the **same** rows. No email/password, no per-device anonymous accounts, no more "connected but empty" identity mismatches.
- **One-time SQL** — run `supabase/schema.sql` in your project's SQL Editor. It drops `user_id`, dedupes rows per document id, changes the PK to a single shared `id`, and replaces per-user RLS with open anon policies. Without it a fresh project has no table and an old project still hides rows behind the old policies.
- **App**: Settings → Multi-Device Sync now only asks for URL + anon key; removed email/password, "Create account & sync", Google, and anonymous-mode UIs. Diagnostics show "Shared database (no accounts)" and total cloud rows. Developer quick-connect is link-only too.
- **Schema**: `src/lib/cloud-setup-schema.ts` and `supabase/schema.sql` updated for the shared model; existing rows are collapsed to one row per `id` (newest wins).
- **Setup wizard simplified** — now 2 steps (create project, run SQL) with no Google/redirect steps.

## v7.3.5 (2026-09-11) — Anonymous-Account Visibility
- **Sync panel shows the Account ID** (first 8 chars) next to "Signed in as", labelled "must match on both devices" — anonymous mode mints a different throwaway id per device, which is why two "anonymous" devices each see an empty cloud.
- **Anonymous sessions labelled honestly** — "Anonymous account (this device only)" instead of "session active".

## v7.3.4 (2026-09-11) — Android Sync Mismatch Fix
- **Root cause found** — the old (≤ v7.1.x) sync replicated one shared CouchDB to every device with no accounts; the Supabase migration (v7.2.0) made sync per-user (`user_id = auth.uid()` RLS). A device on a different project URL or a different sign-in (anonymous vs email) now legitimately sees an empty cloud — which the app reported as a confusing silent "0 pulled".
- **APK ships the same default project** — `build-apk.yml` now bakes `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` from repo secrets, exactly like the Cloudflare/Pages web deploys (previously the APK had a blank default, inviting a wrong-URL connection).
- **Mismatch warning in Settings** — when the connected account has 0 cloud rows, the sync panel now says so explicitly and tells you to compare the project URL + "Signed in as" values on both devices.
- **Anonymous label clarified** — anonymous mode is now labelled as a separate empty account that won't see email-account data.

## v7.3.3 (2026-09-11) — Partnership Type Field
- **Partnerships are no longer farm-only.** The Add/Edit form has a **Partnership Type** picker with 11 options: Farm, Livestock/Poultry, Business, Startup, Shop, Transport, Contractor, Freelance/Services, Investment/Trading, Rental/Property, Other.
- **Conditional fields** — Farm keeps crop + season + year (previous behavior); every other type hides crop/season and shows a generic year, using the Notes field for industry/description.
- **Card badges** — each partnership shows its type as a small colored badge; the subtitle adapts (farm: crop · season · year; others: year · members · description).
- **Backward compatible** — `kind` is optional; existing partnerships without it render as Farm. No schema change, no migration.
- **i18n** — `ps.kind.*` labels added in Marathi, Hindi, English (e.g. शेती/खेती/Farm, व्यवसाय/धंदा/Business, गुंतवणूक/निवेश/Investment).
- **Verification** — tsc clean, no new lint errors, all four pipelines green on v7.3.0.27.

## v7.3.2 (2026-09-11) — Recurring Category Type-Awareness + Broadcast Pill Placement
- **Recurring category suggestions follow the selected Type** — the New Recurring Transaction modal now shows income categories (Salary, Business, Freelance, Interest, Dividend, Rental, Pension…) when Type = Income and expense categories (Bills, Premium, Subscription, Shopping, Credit Card…) when Type = Expense. Switching Type clears the field and reopens the dropdown. (Previously the list always came from the expense set, even for Income.)
- **Broadcast pill placement fixed** — the pill was rendering a full width off-center because Tailwind v4's `-translate-x-1/2` utility (CSS `translate` property) and an inline `translateX(calc(-50% + …))` swipe style were **adding** instead of the inline replacing the class. Centering now lives on a wrapper (`left-1/2 md:left-[calc(50%+8rem)]` so desktop pills center over the content area, past the sidebar); the pill only carries its swipe-to-dismiss transform. Multiple broadcasts stack correctly at 44px apart.
- **Verification** — `npx tsc --noEmit` clean; both fixes deployed through all four pipelines.

## v7.3.1 (2026-09-10) — Accrual Credit Model, Credit Alerts & Settlement Tracking
- **Accrual credit tracking** — credit purchases/sales count in income/expense totals at record time (no longer at settlement). `operationalTransactions()` excludes `Credit Settlement` everywhere, so settlements never double-count.
- **Auto payment-pending adjustments** — every credit entry creates a linked Adjustment (`sourceTransactionId`, `sourceType`, `settleStatus: pending`, `settledAmount: 0`) in the Adjustments section.
- **FIFO settle tracking** — settling or receiving in the Party Account updates those adjustments FIFO: partial payments stay Pending with a tracked settled amount, full payments flip to Settled with a language-aware note.
- **Visible settlement rows** — real cash/bank/UPI payment legs are hidden from the list (balances + party ledger still move); the opposite-section clearing row shows with an amber **"Credit settled"** badge + a **"Credit only"** filter chip.
- **Adjustments page columns** — Source ("Credit purchase/sale · Party") and Status (Pending/Settled) badges.
- **Partner credit limits** — optional credit limit (₹10,000 default) + settle-within days (30 default) per party; near/reached-limit badges on cards; `getPartnerCreditStats` computes outstanding/pct/due state.
- **Backfill** — existing credit entries get pending adjustments automatically on first load (idempotent); clearance history is replayed to mark settlements correctly.
- **Credit alerts + Notification & Popups settings** — CreditAlertModal, NotificationPanel credit icon, per-type popup toggles, swipe-to-dismiss dashboard credit chip.
- **Fix** — restoring a deleted credit transaction now also restores its archived linked adjustment (v7.3.0.22).
- **Other** — PIN inputs switched to `type="text"` + `inputMode="numeric"` + `.pin-mask`; new `credit.*` i18n keys (mr/hi/en); worked example: dashboard "1W" is a rolling 7-day window while the Expenses page "This Week" is calendar Monday→today (values legitimately differ mid-week).

## v7.3.0 (2026-09-10) — Party Groups Redesign, Partnership Fixes, Supabase Verify
- **Party groups redesign** — 3 generic groups → 7 (Personal, Services, Financial, Business, Government, Agriculture, Office) with per-group types; shared constants in `src/lib/parties.ts`, auto-migration of old records in `initDB`
- **Partnership "Who paid?" fix** — dropdown now lists ALL members, including free-text names (pseudo payer `__ps:<memberId>`); settlement math attributes `paid` correctly to them
- **Partnership UX** — new partnerships auto-add the current user as the first member (links to their Partner card when a name match exists)
- **Supabase verify** — confirmed every feature stores data in the single `sync_docs` table via the `entity` tag (11 Dexie tables + PINs); live RLS/realtime checks against the shared project; `supabase/schema.sql` gained `sync_docs_user_entity_idx (user_id, entity)` — re-run in SQL Editor to apply
- **Docs restructure** — README, USER-GUIDE, From-Scratch, memory capsules aligned to the current app (7 groups, partnership details, up-to-date version)

## v7.2.0 (2026-08-23) — Big Update: Works, Partnership, Accounts 2.0, Performance
- **Works (कामे)** module — farm & job entries with direction (receivable/payable), profiles, payment history, pending tracking
- **Partnership (भागीदारी)** tab in Party Accounts — member shares (must total 100%), settlement math (`balance = incomeShare + paid − expenseShare`), ledger mirroring; members are free-text fields with recent-party suggestions
- **Accounts page rebuilt** — 5 cards: Cash, Bank, Capital, Revenue, Expenses; period pills (1W–ALL); Add Capital/Drawings modal writes real synced transactions
- **Stats integrity** — `getAggregates()`/`getMonthlySummary()` now exclude `Transfer`, `Capital`, `Drawings`; transfers no longer inflate Income+Expense totals
- **Dashboard** — compact single-line summary cards; Tasks card removed (Savings = Goals only)
- **Performance** — dashboard scans transactions once per render (was ~18×), first-load-only skeleton, notification polling 20s→60s
- **Categories page** — tap a category to view all its entries with count + total
- **Sync audit (v7.2.0)** — verified all 11 entities + `pin:batch` sync through `sync_docs`; entity list corrected in `supabase/schema.sql`; stale localStorage key names fixed across docs (`mm_pouch_url`, `mm_sync_key`, `mm_pouch_urls`, `sb-<ref>-auth-token`)

## v7.1.1.34 (2026-08-17) — Cloud Sync 2.0 (Supabase)
- **Migrated cloud sync from CouchDB → Supabase** (shared project, per-user isolation)
- `supabase/schema.sql`: `sync_docs` table (PK `user_id,id`), Row-Level Security, realtime publication
- `pouchdb.ts`: `signUpUser`, `connectRemote(url, key, email, password)`, user-scoped upserts (`onConflict user_id,id`), realtime subscription, 30s reconnect
- Settings → Multi-Device Sync: URL + anon key auto-filled from build env; users only enter email + password; "Create account & sync" / "Connect"
- Multi-user isolation verified E2E (two accounts, RLS blocks cross-account reads/writes)
- New GitHub repo: `moneymeva-online` (private). Old repo `moneymeva` frozen at `dc965eb` (pure CouchDB).
- Docs: USER-GUIDE, Sync guide, Security (RLS), README, memory capsule updated

## v7.1.1.28
- Added global toast system (Toast.tsx + ToastProvider)
- Added skeleton component library (Skeleton.tsx)
- Replaced all `alert()` calls with toast (6 occurrences)
- Upgraded ledger loading from spinner to skeleton rows
- Upgraded 12 empty states with icons + headings + CTAs
- Wired ToastProvider into root layout

## v7.1.1.26
- Rollback point — all UI state work built on top
- Social media OG image (og-image.svg)
- Sitemap + robots.txt for SEO
- Open Graph + Twitter Card meta tags
- Removed backdrop click-to-close on all modals
- Party field defaults to "None" with clear-on-focus

## v7.1.1.20
- Categories page with PIN-protected batch save
- Category dropdown keyboard nav reaches "Create"
- Category save on add/edit

## v7.1.1.15
- Renamed "Money Meva Premium" → "Money Meva"
- Updated git remote + GitHub repo name

## v7.1.1.10
- Investment calculator (FD/SIP/RD/PPF)

## v7.1.1.5
- Partners page with CRUD
- PIN setup guide

## v7.1.1.0
- Initial working version
