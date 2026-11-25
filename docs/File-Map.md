# 📂 File Map

> Find any file in the project instantly.

---

## App Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page |
| `/login` | `src/app/login/page.tsx` | Local profiles + optional Google OAuth |
| `/onboarding` | `src/app/onboarding/page.tsx` | First-run |
| `/privacy` | `src/app/privacy/page.tsx` | Public policy page — body from `components/legal/PrivacyContent.tsx` |
| `/terms` | `src/app/terms/page.tsx` | Public terms page — body from `components/legal/TermsContent.tsx` |
| `/dashboard` | `src/app/dashboard/page.tsx` | Home dashboard |
| `/dashboard/income` | `src/app/dashboard/income/page.tsx` | Thin wrapper → `components/TransactionPage.tsx` (`type="income"`) |
| `/dashboard/expenses` | `src/app/dashboard/expenses/page.tsx` | Thin wrapper → `components/TransactionPage.tsx` (`type="expense"`) |
| `/dashboard/investments` | `src/app/dashboard/investments/page.tsx` | Thin wrapper → `components/TransactionPage.tsx` (`type="investment"`) |
| `/dashboard/savings` | `src/app/dashboard/savings/page.tsx` | Goals |
| `/dashboard/partners` | `src/app/dashboard/partners/page.tsx` | Party management (+ Partnership tab) |
| `/dashboard/works` | `src/app/dashboard/works/page.tsx` | Work register & pending payments |
| `/dashboard/recurring` | `src/app/dashboard/recurring/page.tsx` | Recurring txns |
| `/dashboard/accounts` | `src/app/dashboard/accounts/page.tsx` | Accounts |
| `/dashboard/adjustments` | `src/app/dashboard/adjustments/page.tsx` | Adjustments |
| `/dashboard/summary` | `src/app/dashboard/summary/page.tsx` | Monthly summary + activity feed |
| `/dashboard/ledger` | `src/app/dashboard/ledger/page.tsx` | Audit trail |
| `/dashboard/archive` | `src/app/dashboard/archive/page.tsx` | Deleted items (30-day tombstones) |
| `/dashboard/categories` | `src/app/dashboard/categories/page.tsx` | Categories |
| `/dashboard/settings` | `src/app/dashboard/settings/page.tsx` | Settings + sync + Danger Zone |
| `/dashboard/account` | `src/app/dashboard/account/page.tsx` | Profile & password |
| `/dashboard/support` | `src/app/dashboard/support/page.tsx` | Help, contact, troubleshooting |
| `/dashboard/about` | `src/app/dashboard/about/page.tsx` | App info, version, legal links |
| `/dashboard/developer` | `src/app/dashboard/developer/page.tsx` | Developer Zone (debug, sync ops, wipes) |
| `/dashboard/privacy` | `src/app/dashboard/privacy/page.tsx` | Same body as `/privacy`, inside DashboardLayout |
| `/dashboard/terms` | `src/app/dashboard/terms/page.tsx` | Same body as `/terms`, inside DashboardLayout |

## Components

| File | Used By |
|---|---|
| `DashboardLayout.tsx` | All dashboard pages — nav, lock overlay, startup popups |
| `TransactionPage.tsx` | Income, Expenses, Investments routes (+ archive panel) |
| `ui/button.tsx` | Shared `<Button>`; 26 pages/components |
| `Toast.tsx` | Global (via layout) |
| `Skeleton.tsx` | Loading states |
| `Reveal.tsx` | Scroll animations |
| `AuthProvider.tsx` | Layout + login, onboarding, dashboard, settings, works, PartnershipTab |
| `LanguageSelector.tsx` | Landing page, Settings |
| `InvestmentCalculator.tsx` | Dashboard home, TransactionPage |
| `PartnershipTab.tsx` | Partners page (भागीदारी tab) |
| `PinPrompt.tsx` | 12 call sites — every PIN-gated action |
| `PinSetupGuide.tsx` | First-run PIN minting + fallback when no PINs remain |
| `DataSafetyNotice.tsx` | DashboardLayout (first-run) |
| `InstallPrompt.tsx` | DashboardLayout (PWA install) |
| `NotificationPanel.tsx` | Dashboard home header |
| `Notification prefs` → `src/lib/notification-prefs.ts` | Which startup popups/toasts are allowed |
| `WhatsNewModal.tsx` | DashboardLayout (release notes popup) |
| `BroadcastBanner.tsx` | DashboardLayout (remote pills) |
| `BannerModal.tsx` | DashboardLayout (remote banner, z-[10000]) |
| `CreditAlertModal.tsx` | DashboardLayout (credit-limit breaches) |
| `SecurityTipNotice.tsx` | DashboardLayout |
| `SyncStatusBar.tsx` | DashboardLayout |
| `CloudSetupWizard.tsx` | Settings, login (self-host Supabase setup) |
| `SwipeCard.tsx` | Recurring page |
| `ShareButton.tsx` | Landing page |
| `LoadingOverlay.tsx` | Full-screen loading |
| `RegisterSW.tsx` | `src/app/layout.tsx` — intentionally unregisters the service worker |
| `legal/PrivacyContent.tsx` | `/privacy` + `/dashboard/privacy` (single body + `PrivacyHeader`) |
| `legal/TermsContent.tsx` | `/terms` + `/dashboard/terms` (single body + `TermsHeader`) |
| `popup-queue.ts` (`src/lib/`) | Sequential startup popups |
| `defaultCategories.ts` (`src/lib/`) | Profession categories + WORK_PROFILES registry |

## Lib

| File | Purpose |
|---|---|
| `store.ts` | All CRUD operations |
| `db.ts` | Dexie schema |
| `parties.ts` | Party group/type registry + credit-limit constants |
| `csv-import.ts` | CSV parse + validation for Settings → Import |
| `pouchdb.ts` | Cloud sync (Supabase + local PouchDB buffer); one cached Supabase client per credentials |
| `sync-notify.ts` | Sync events |
| `cloud-setup-schema.ts` | SQL shown by CloudSetupWizard (kept byte-aligned with `supabase/schema.sql`) |
| `pinStore.ts` | PIN management (10 single-use 4-digit PINs) |
| `localAuth.ts` | Multi-user auth (`mm_users`, `mm_session`, auto-lock) |
| `activityLog.ts` | Activity tracking |
| `notification-prefs.ts` | Startup popup/toast toggles |
| `whats-new.ts` | Release-note comparison (`releaseBase` ignores the build segment) |
| `export.ts` | PDF/Excel export |
| `download.ts` | File downloads |
| `progressOverlay.ts` | Long-operation progress |
| `capacitor-notifications.ts` | Native (APK) reminder notifications — web has none |
| `legal.ts` | `POLICY_LAST_UPDATED` — the one date shown on privacy/terms |
| `env.ts` | Build-time/runtime config, BASE_PATH, obfuscated announcement constants |
| `utils.ts` | Shared utilities |
| `i18n/translations.ts` | Translation strings (mr / hi / en objects + `languageNames`) |
| `i18n/index.tsx` | i18n provider |
| `ThemeProvider.tsx` | Theme system |

## Sync / Cloud

| File | Purpose |
|---|---|
| `supabase/schema.sql` | `sync_docs` table + RLS + realtime (run in Supabase SQL Editor); header lists all 12 synced doc types (11 entities + pin batch) |
| `src/lib/env.ts` | Runtime config — Supabase URL/key empty by default (NEXT_PUBLIC_* build env or Settings → Sync), jsonbin Bin IDs XOR-obfuscated |
| `CLOUD-SYNC-GUIDE.md` | Owner setup + troubleshooting (includes the secret-encoder one-liner) |

## Config

| File | Purpose |
|---|---|
| `next.config.ts` | Next.js config |
| `capacitor.config.ts` | Android config |
| `tailwind.config.ts` | Tailwind config |
| `tsconfig.json` | TypeScript config |
| `package.json` | Dependencies |
| `AGENTS.md` | AI instructions |
| `docs/USER-GUIDE.md` | End-user manual |
| `MEMORY-CAPSULE.md` | AI + project memory (merged capsule) |

---

#money-meva #reference #file-map
