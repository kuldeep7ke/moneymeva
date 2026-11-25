# 📋 Active Tasks

> Current work in progress. Move completed items to [[Changelog]].
> Source of truth for app facts: root [`MEMORY-CAPSULE.md`](../MEMORY-CAPSULE.md).
> Full status of the 2026-11-25 audit (migration + hygiene, done/pending/blocked):
> [`TASK-BOARD.md`](TASK-BOARD.md).

---

## In Progress

- [ ] **Supabase publishable-key migration (v7.3.0.49)** — code, SQL, docs, Docker
      and both workflows renamed to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; UI says
      "Publishable key (`sb_publishable_…`)". Waiting on you: the GitHub secret, the
      Cloudflare Pages var, the real key value, and the commit. Detail: `TASK-BOARD.md` §1, §3.
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