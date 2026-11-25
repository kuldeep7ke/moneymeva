# Task Board — Money Meva

Snapshot: 2026-11-25. Statuses use `[x]` DONE, `[~]` IN PROGRESS, `[ ]` PENDING, `[!]` BLOCKED-ON-YOU.
Every line below was checked against the working tree at the time of writing; the
commands in "How to verify" re-derive them independently, so another model or person
can confirm each claim without trusting this file.

Related docs: [Active-Tasks.md](Active-Tasks.md) (product roadmap) · root `MEMORY-CAPSULE.md` (app facts, append-only) · [Changelog.md](Changelog.md) (append-only ledger).

---

## 1. DONE — Supabase anon key → publishable API key

| Item | Evidence |
|---|---|
| Env var renamed `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `src/lib/env.ts:20`, `src/lib/pouchdb.ts:3,39` |
| Sync internals renamed (`anonKey` → `pubKey`), error copy updated | `src/lib/pouchdb.ts:326-335` |
| UI labels/placeholders now "Publishable key (`sb_publishable_…`)" | `src/app/dashboard/settings/page.tsx:305,587,595,607,688`, `src/app/dashboard/developer/page.tsx:291,516,758-762`, `src/components/CloudSetupWizard.tsx:168,184,221,233`, `src/app/dashboard/about/page.tsx:44` |
| Docker build arg + ENV | `Dockerfile:10,13` |
| `.env.example` documents the new name and the legacy fallback | `.env.example:8-14` |
| `.env.local` variable renamed, **value untouched** | owner-only file, gitignored |
| CI reads the new secret name | `.github/workflows/build-apk.yml:32`, `.github/workflows/deploy-gh-pages.yml:5,36` |
| Inlined Setup-Guide SQL matches `supabase/schema.sql` on every changed line | `src/lib/cloud-setup-schema.ts:6,63-66` |
| Postgres **role** names deliberately NOT renamed (`TO anon`, `GRANT … TO anon`) — Supabase renamed the key, not the role | `supabase/schema.sql:91-94` |
| Terminology across 14 docs (incl. `Project Settings → API Keys`, `sb_publishable_…` examples, compat note) | `README.md`, `SELF-HOSTING.md`, `CLOUD-SYNC-GUIDE.md`, `CROSS-PLATFORM.md`, `SECURITY.md`, `CONTRIBUTING.md`, `OPENCODE-SYNC-SETUP.md`, `AGENTS.md`, `docs/{Architecture,Sync,Security,Data-Flow,USER-GUIDE,Active-Tasks}.md` |
| Append-only ledgers left intact (`MEMORY-CAPSULE.md`, `docs/Changelog.md` still say "anon key" as history) | by design |

## 2. DONE — hygiene fixes found in the same audit

| Item | Evidence / effect |
|---|---|
| Lint no longer drowns in generated assets (`android/app/src/main/assets`, `android/**/build`, `dist-desktop`, `backup`) | `eslint.config.mjs:9-24` — problems **18,590 → 318** |
| Build artifact `tsconfig.tsbuildinfo` untracked (file kept on disk); `.gitignore` trailing-whitespace rules cleaned | `.gitignore:19-20`, staged as a deletion |
| `prebuild` now keeps `package.json` pinned to `VERSION` (was stuck at 7.1.13 while VERSION was v7.3.0.48) | `scripts/bump-version.cjs:26-36` → package.json is now `7.3.0` |
| What's-New modal no longer re-fires on every build: comparison ignores the 4th build segment | `src/lib/whats-new.ts:27-41` (`releaseBase`), used at `src/components/WhatsNewModal.tsx:15` |
| Stale release notes replaced (were `v7.3.0.38`, 11 Sep 2026, still saying "anon key") | `src/lib/whats-new.ts:7-16` |
| Pre-merge CI added: typecheck + real static-export build; lint runs report-only | `.github/workflows/ci.yml` (new) |
| `AGENTS.md` table count corrected to 11 (code defines 11) | `AGENTS.md:172` vs `src/lib/db.ts:19` |
| Build verified green after all of the above: compiled 5.1s, TypeScript 5.4s, 29/29 static pages, `VERSION` v7.3.0.49 | `out/` regenerated |

## 3. BLOCKED-ON-YOU — cannot be done from the repo

- [!] **Nothing is committed.** HEAD is still `70b6343` (2026-10-14) and `origin/master` equals it; 36 entries sit in the working tree. Verified 2026-11-25.
- [!] **GitHub has ZERO secrets configured.** `gh secret list` → empty, and the only environment (`github-pages`) has no secrets either. So `secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` resolves to an empty string and CI builds bake no cloud config. This was already true of `..._ANON_KEY` before the rename — the web/APK artifacts from Actions have been shipping cloud-free all along. Decide: create the secret, or state plainly in the docs that Actions never bakes keys (see §4, changelog claim).
- [!] **The last GitHub Pages deploy FAILED.** Run `38595288317` (push of HEAD, 2026-10-14) stuck in `updating_pages` and aborted after ~11 min with "Timeout reached, aborting!". Nothing has deployed from master since 2026-10-10.
- [!] **Deployed versions lag the repo**, because `prebuild` bumps VERSION on every CI build and CI never commits it back: GitHub Pages live = `v7.3.0.47`, Cloudflare Pages live = `v7.3.0.45`, this tree builds `v7.3.0.49`. Read it yourself:
      `curl -s https://kuldeep7ke.github.io/moneymeva/ | grep -o 'app-version" content="[^"]*"'`
- [!] **Create the GitHub secret** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if you want baked sync (Settings → Secrets and variables → Actions). With no matching secret the deploy silently ships cloud-free. The old `…_ANON_KEY` name no longer exists anywhere in the repo.
- [!] **Same rename in Cloudflare Pages** build environment variables (dashboard-only; see `SELF-HOSTING.md:164,181`).
- [!] **Mint the real publishable key** in Supabase → Project Settings → API Keys, then paste into `.env.local` and the CI secret. Verified 2026-11-25: `.env.local` **still holds the legacy `eyJ…` anon JWT** under the new variable name — works today, on Supabase's retirement path.
- [!] `build-apk.yml` never passes `NEXT_PUBLIC_SITE_URL` (only URL + key), so APK OAuth redirect falls back to the default `pages.dev` origin. `.github/workflows/build-apk.yml:31-32`

## 4. PENDING — recommended next work

Deploy pipeline:
- [ ] Decide the VERSION/CI policy: stop `prebuild` bumping in CI (or have CI commit it back), otherwise deployed builds and the repo number never line up
- [ ] `docs/Changelog.md:27` claims Actions bakes the Supabase URL/key "from repo secrets" — no such secrets exist; correct the claim or add the secrets (ledger is append-only, so fix forward in a new entry)
- [ ] Re-run the failed Pages deploy once this work is committed, and confirm the Pages source is still "GitHub Actions"

Lint backlog, now that it is readable (246 errors / 72 warnings):
- [ ] `@typescript-eslint/no-explicit-any` — 164 sites, concentrated in `src/lib/store.ts`, `src/lib/pouchdb.ts`
- [ ] `@typescript-eslint/no-unused-vars` — 46 (safe to sweep first)
- [ ] `react-hooks/set-state-in-effect` — 32 (e.g. `src/app/dashboard/about/page.tsx:17`)
- [ ] `react/no-unescaped-entities` — 28, `no-require-imports` — 17, `exhaustive-deps` — 14, `no-img-element` — 12
- [ ] Decide the lint policy: fix incrementally per file, or set rules to warn with a ratchet so CI can enforce "no new errors"

Error handling:
- [ ] 62 empty `catch {}` blocks swallow failures, including user-visible paths: audit import `src/app/dashboard/settings/page.tsx:1355`, session restore `src/app/login/page.tsx:100,112,175`, wizard step checks `src/components/CloudSetupWizard.tsx:17,84,98` — Setup Guide can report false success

Version/release process:
- [ ] Unify the release identity: `VERSION` v7.3.0.49 vs `android/app/build.gradle:11` versionName "7.2.0.33" — only the `android:apk` script syncs them, so an APK built outside that path ships a stale version
- [ ] `docs/Changelog.md` uses a `v7.3.x` scheme while `VERSION` uses `v7.3.0.N` — pick one and record it
- [ ] Add a `CHANGELOG`/`CHANGES.md` ledger entry for the publishable-key migration (needs a release number from you)

Tests (currently zero — no `test` script, no test files):
- [ ] Smallest useful start: `node --test` unit tests for `releaseBase`/`shouldShowWhatsNew`, `cleanSupabaseUrl`, and the sync push/pull error mapping

Docs vs reality:
- [ ] `docs/File-Map.md` omits shipped routes `dashboard/developer`, `support`, `terms`, `privacy` and ~10 components (verified by grep: 0 hits for `developer`/`support`/`terms`/`privacy`)
- [ ] Offline story: `src/components/RegisterSW.tsx:7-14` and `public/sw.js` intentionally *unregister* the service worker and purge caches, while `README.md:337` promises "works fully offline" and `public/manifest.webmanifest` still offers install — reword the claim or add real caching
- [ ] Orphaned config nothing references: `netlify.toml`, `bookmarklet.txt` — confirm before deleting

Product roadmap (mirrors [Active-Tasks.md](Active-Tasks.md)):
- [ ] Recurring-reminder notifications on web — none exist: no `new Notification(` / `PushManager` anywhere in `src`; only Capacitor (`src/lib/capacitor-notifications.ts:24`), yet Settings shows notification toggles
- [ ] PWA offline caching refinements
- [ ] Investment portfolio tracking; multi-currency support

## 5. How to verify (run from `MoneyMeva/`)

```bash
git status --short                    # 33 modified + 1 staged deletion + 2 new = 36 entries, nothing committed
git ls-files tsconfig.tsbuildinfo     # empty = artifact untracked
cat VERSION; node -p "require('./package.json').version"   # v7.3.0.49 / 7.3.0

# old name must survive only in append-only ledgers and the legacy-key note
grep -rn "SUPABASE_ANON_KEY" src Dockerfile .github .env.example        # expect no hits
grep -rn "anon key" --include="*.md" . | grep -v node_modules | grep -vi legacy
#   expect only: MEMORY-CAPSULE.md, docs/Changelog.md (both append-only) and this file

npm run build      # must compile, typecheck, generate 29 static pages
npm run lint       # 318 problems (246 errors) — generated dirs now excluded
npx tsc --noEmit   # exit 0
grep -rl "sb_publishable_" out/ | wc -l     # 6 → new UI strings are in the bundle
grep -rl "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" out/ | wc -l   # 2 → baked key still wired
grep -rl "anon key shares one database" out/ | wc -l           # 0 → stale release notes gone
```

Untested here (needs a browser session with local data): the What's-New popup
behaviour and the renamed Settings/Developer field labels were verified at build-artifact
level, not by driving the UI.
