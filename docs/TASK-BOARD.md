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

## 2b. DONE — committed, pushed and deployed (2026-11-25)

| Item | Evidence |
|---|---|
| All 36 entries committed as one change, `4fce3ac`, pushed to `origin/master` (fast-forward from `70b6343`); working tree now clean | `git status --porcelain` → empty |
| Staged content scanned before committing: no key values, no `.env.local`, no build output | `git grep --cached -E "eyJ…\.eyJ|sb_secret"` → only prose/role mentions |
| New `ci.yml` gate passed on its **first** run (1m31s) | run `45658520194` |
| GitHub Pages deploy succeeded (1m37s) — the 2026-10-14 timeout did **not** recur, so it was transient, not artifact size (`out/` is 7.5 MB / 335 files) | run `45658520178` |
| Android APK workflow succeeded (2m58s) | run `45658520206` |
| Live Pages now serves the migrated UI: `v7.3.0.50`, and the 6 chunks that carry "Publishable key" locally serve it byte-for-byte live; the old JWT placeholder appears in 0 live chunks | `curl …/moneymeva/ \| grep app-version` |
| The deployed artifact bakes **no** Supabase config — 0 `supabase.co` strings live vs 8 in a local build | see §5 |

## 3. BLOCKED-ON-YOU — cannot be done from the repo

- [!] **GitHub still has ZERO secrets configured.** `gh secret list` → empty, and the only environment (`github-pages`) has no secrets either. So `secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` resolves to an empty string and CI builds bake no cloud config. This was already true of `..._ANON_KEY` before the rename — the web/APK artifacts from Actions have been shipping cloud-free all along, and today's deploy is no exception: anyone connecting from the hosted site must paste URL + key in Settings themselves. Decide: create the secret, or state plainly in the docs that Actions never bakes keys (see §4, changelog claim).
- [!] **Cloudflare Pages has not rebuilt**: still live at `v7.3.0.45` while GitHub Pages is `v7.3.0.50`. Its build is owner-side (dashboard credentials), so the push above did not update it. Trigger it, or confirm the connection.
- [!] **Create the GitHub secret** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if you want baked sync (Settings → Secrets and variables → Actions). The old `…_ANON_KEY` name no longer exists anywhere in the repo, so a secret under the old name does nothing.
- [!] **Same rename in Cloudflare Pages** build environment variables (dashboard-only; see `SELF-HOSTING.md:164,181`).
- [!] **Mint the real publishable key** in Supabase → Project Settings → API Keys, then paste into `.env.local` and the CI secret. Verified 2026-11-25: `.env.local` **still holds the legacy `eyJ…` anon JWT** under the new variable name — works today, on Supabase's retirement path.
- [!] `build-apk.yml` never passes `NEXT_PUBLIC_SITE_URL` (only URL + key), so APK OAuth redirect falls back to the default `pages.dev` origin. `.github/workflows/build-apk.yml:31-32`
- [!] **VERSION now drifts the other way**: CI runs `npm run build`, whose `prebuild` bumped the number to `7.3.0.50` in the artifact but cannot commit it back, so the repo file (`7.3.0.49`) is now one behind what is live. Same root cause as the §4 policy item.

## 4. PENDING — recommended next work

Deploy pipeline:
- [ ] Decide the VERSION/CI policy: stop `prebuild` bumping in CI (or have CI commit it back), otherwise deployed builds and the repo number never line up — today's deploy proves it again (repo `7.3.0.49`, live `7.3.0.50`)
- [ ] `docs/Changelog.md:27` claims Actions bakes the Supabase URL/key "from repo secrets" — no such secrets exist; correct the claim or add the secrets (ledger is append-only, so fix forward in a new entry)
- [ ] If baked sync is *not* wanted, make that explicit in `README.md` / `SELF-HOSTING.md` instead of leaving the workflows referencing secrets that resolve to empty strings

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
git status --short                    # empty = everything committed
git log --oneline -1                  # 4fce3ac refactor: adopt Supabase publishable API key…
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

# what is actually deployed (§2b)
gh run list --repo kuldeep7ke/moneymeva --limit 3   # CI 45658520194, Pages 45658520178, APK 45658520206 — all success
curl -s https://kuldeep7ke.github.io/moneymeva/dashboard/ | grep -o 'app-version" content="[^"]*"'   # v7.3.0.50
#   a local build bakes the project URL, CI (no secret) cannot:
grep -rl "supabase\.co" out --include="*.js" | wc -l    # 8 locally…
for u in $(curl -s https://kuldeep7ke.github.io/moneymeva/dashboard/ | grep -oE '/moneymeva/_next/static/chunks/[^"]+\.js' | sort -u); do curl -s "https://kuldeep7ke.github.io$u"; done | grep -c "supabase\.co"   # …0 live
curl -s https://moneymevaonline.pages.dev/ | grep -o 'app-version" content="[^"]*"'                   # v7.3.0.45 → Cloudflare not rebuilt
```

Untested here (needs a browser session with local data): the What's-New popup
behaviour and the renamed Settings/Developer field labels were verified at build-artifact
level, not by driving the UI.
