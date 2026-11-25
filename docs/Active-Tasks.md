# 📋 Active Tasks

> Current work in progress. Move completed items to [[Changelog]].
> Source of truth for app facts: root [`MEMORY-CAPSULE.md`](../MEMORY-CAPSULE.md).
> Full status of the 2026-11-25 audit (migration + hygiene, done/pending/blocked):
> [`TASK-BOARD.md`](TASK-BOARD.md).

---

## In Progress

- [ ] **Publishable-key follow-through (v7.3.0.50 shipped)** — the rename itself is
      committed (`4fce3ac`) and live on GitHub Pages. Still waiting on you: the GitHub
      Actions secret, the Cloudflare Pages var + rebuild, and the real
      `sb_publishable_…` value (`.env.local` still holds the legacy `eyJ…` anon JWT).
      Detail: `TASK-BOARD.md` §3.
- [ ] **Docs/maintenance pass (v7.3.0.41)** — align all docs to the current state
      (link-only sync, 11 tables, Google OAuth = local profile, announcements
      proxy). Ref `MEMORY-CAPSULE.md` for facts; audit links/wikilinks; commit.
- [ ] Sync-link docs — single source of truth for the link-only model is live;
      no further sync code changes planned.

## Up Next

- [ ] PWA offline improvements (caching refinements on top of the static export)
- [ ] Recurring reminders via notifications
- [ ] Push notifications for due reminders (web/APK)

## Backlog

- [ ] Investment portfolio tracking (calculator done; full portfolio next)
- [ ] Multi-currency support
- [ ] Recurring reminder notifications (device-level)

---

## Done (recent)

- [x] **Gradient + interaction contrast pass (v7.3.0.69–.76, 2026-11-26)** — the harness now
      measures painted gradients: colour stops sampled through a canvas, translucent stops
      composited over the surface behind them, worst stop scored, scroll-reveal subtrees forced
      visible. 96 loads (26 routes × light/dark × 3 presets), 8,056 text leaves, 0 failures; then
      the click-reached surfaces — What's-New popup, forgot-password dialog, Add-transaction
      modal, Developer zone past its gate + its Start-Fresh modal + the PIN prompt. Fixed:
      `text-*-100` captions on amber/red/green/sky gradient heads, `from-brand to-orange-600` →
      `to-brand-hover` in the PIN guide, `opacity-90` labels on brand fills (3.82:1 on green),
      `text-orange-600/70` landing badge (2.48:1), `text-red-600` chips on the developer red-100
      panel (4.34:1) and the public pages' pastel wash (new floors in `globals.css`). Settings
      verified in the running UI to read "Publishable key" with no "anon key" left. The same
      sweep's console check found the loading-screen logo was a 292 KB 1000×1000 JPEG that React
      preloads into all 28 page heads; it is a 7.6 KB 256px copy now. See
      `docs/Changelog.md`.
- [x] **Deployed and re-verified the evidence (v7.3.0.77, 2026-11-26)** — `workflow_dispatch`
      build + deploy of master (run `45701071595`, green); all 21 chunks the live `/dashboard`
      references are byte-for-byte identical to a local `DEPLOY_TARGET=gh-pages` build, and 0 live
      chunks carry the project ref. Found and fixed two of our own checks: they grepped
      `…/dashboard/`, which on GitHub Pages is a 404 whose body is the app's `404.html` (same
      `app-version` meta) — so the "live version" claim had been reading an error page. Canonical
      URLs are slash-free; `docs/TASK-BOARD.md` §5 now asserts `%{http_code}`.
- [x] **Full-app verification pass (v7.3.0.51–.68, 2026-11-26)** — every route driven in a
      headless browser against the static build; WCAG AA measured per brand preset (light and
      dark), 0 failures at the end; in-form Cancel buttons stopped submitting forms; strict CSV
      import; developer-zone PIN gate on wipes and PIN reveal; cached Supabase client; shared
      legal-page content; dead banner/broadcast fixtures deleted; `docs/File-Map.md` rewritten.
- [x] **Docs + memory consolidation (v7.3.0.41)** — merged root
      `MEMORY-CAPSULE.md` (replaces `CLAUDE.md` / `From-Scratch.md` /
      `data/memory-capsule.md`); rewrote stale docs to the link-only model.
- [x] **Cloud sync migrated to link-only shared database (v7.3.0.33+)**
  - Removed email/password cloud accounts, `signUpUser`, per-user RLS
  - `sync_docs` single-column PK `id` + open RLS + realtime in `supabase/schema.sql`
  - Settings: URL + publishable key fields, "Connect" only — "Create account & sync" gone
  - Old CouchDB/Railway URL decommissioned (Railway instance dead)
  - Google OAuth retained (login screen) but now creates a **local** profile only
- [x] Global toast system (v7.1.1.28)
- [x] Skeleton component library + ledger skeleton loading
- [x] 12 empty state upgrades
- [x] Alert → toast migration (6 calls)
- [x] Social media OG image
- [x] Sitemap + robots.txt
- [x] Modal backdrop click removal
- [x] Party field "None" default
- [x] Categories page with PIN-protected batch save

---

#money-meva #tasks