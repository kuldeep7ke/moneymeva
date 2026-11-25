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

## 2c. DONE — verification pass before this push (2026-11-26)

| Item | Evidence |
|---|---|
| Every route driven in a headless browser against the static build, both themes × all three brand presets | 96 iframe loads: 26 routes × light/dark × orange, plus 11 brand-sensitive routes × light/dark × blue/green — 8,056 text leaves |
| WCAG AA measured, not eyeballed — including painted gradients (colour stops sampled, translucent stops composited over their backdrop, worst stop scored) | 0 failures at the end of the 96-load re-run; 18 found on the first run, each turned into a source fix |
| Leaves unreachable by a load-only sweep are now *reached*: clicks into What's-New, Forgot password, Add transaction, Developer gate → Start Fresh → PIN prompt | developer page measured past its "I Understand, Continue" gate: 141 leaves (4 while gated); its red-100 panel chips failed at **4.34:1** and became `text-red-700`; 0 hits on re-drill in light + dark |
| Scroll-reveal content counted instead of skipped | `.reveal` force-revealed before measuring (`i=0` on every route after the fix) — this is what exposed the 3.82:1 `opacity-90` labels on the green preset |
| Harness corrections that were **not** app defects | `/20`–`/30` gradient stops read as opaque (54 false failures), `transition-colors` sampled mid-flight ("Continue with Google" 1.46:1 → live `slate-300` 5.9:1), disabled controls counted (exempt under WCAG 1.4.3) |
| Field labels confirmed in the running UI, not in source | `/dashboard/settings` innerText contains "Publishable key", 0 matches for "anon key" |
| Rebuilt and re-derived after the changes | `npm run build` → 29 static pages, `VERSION` v7.3.0.76 baked into `out/index.html`; `npx tsc --noEmit` exit 0; `npm run lint` → 318 problems (244 errors / 74 warnings) — unchanged, no new debt |
| The 292 KB logo every page was paying for | `public/favicon.jpg` (1000×1000) was rendered by `src/app/loading.tsx`, whose `<img>` React hoists into `<link rel="preload" as="image">` — present in all 28 exported page heads, and Chrome warned it was never used. Replaced at the 7 call sites by `public/favicon-256.jpg` (256×256, 7,630 B, same artwork, lanczos); master kept as source. `grep -rl 'href="/favicon.jpg"' out --include=*.html` → 0 |

## 2d. DONE — pushed and deployed (2026-11-26)

| Item | Evidence |
|---|---|
| The pass is one commit: `135520e` (59 files, +1,568/−1,135), pushed `d6883b8..135520e` fast-forward; working tree clean | `git status --short` → empty |
| Staged content scanned before committing — no key values, no `.env.local`, no build output | `git grep --cached -E "sb_secret_\|eyJ…\.\|SERVICE_ROLE"` → 0 code hits (only prose in docs); `.gitignore:4,3` already cover `.env.local` and `out/` |
| All three workflows green on this push's first run | CI `45699882962` (1m31s), Pages deploy `45699882885` (1m45s), Android APK `45699883151` (3m24s) |
| Live Pages serves `v7.3.0.77` and the payload fix is in the artifact: preload is `/moneymeva/favicon-256.jpg`, 0 live pages reference `favicon.jpg`, the asset fetches 7,630 B | `curl -s …/moneymeva/dashboard/ \| grep 'rel="preload"'`; `curl -I …/favicon-256.jpg` |
| The 6 chunks carrying "Publishable key" are live **byte-for-byte identical** to the local build (HTTP 200, `cmp` identical); the legacy anon-JWT placeholder and the stale release note appear in 0 live chunks | `for c in 1_-dfso6407kb …; do curl … \| cmp - out/_next/static/chunks/$c.js; done` |
| VERSION drifted the expected way again: repo `7.3.0.76`, live `7.3.0.77` — CI's `prebuild` bumps and cannot commit back | `cat VERSION` vs the live `app-version` meta |

## 3. BLOCKED-ON-YOU — cannot be done from the repo

- [!] **GitHub still has ZERO secrets configured.** `gh secret list` → empty, and the only environment (`github-pages`) has no secrets either. So `secrets.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` resolves to an empty string and CI builds bake no cloud config. This was already true of `..._ANON_KEY` before the rename — the web/APK artifacts from Actions have been shipping cloud-free all along, and today's deploy is no exception: anyone connecting from the hosted site must paste URL + key in Settings themselves. Decide: create the secret, or state plainly in the docs that Actions never bakes keys (see §4, changelog claim).
- [!] **Cloudflare Pages has not rebuilt**: still live at `v7.3.0.45` while GitHub Pages is `v7.3.0.77`. Its build is owner-side (dashboard credentials), so the push above did not update it. Trigger it, or confirm the connection.
- [!] **Create the GitHub secret** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if you want baked sync (Settings → Secrets and variables → Actions). The old `…_ANON_KEY` name no longer exists anywhere in the repo, so a secret under the old name does nothing.
- [!] **Same rename in Cloudflare Pages** build environment variables (dashboard-only; see `SELF-HOSTING.md:164,181`).
- [!] **Mint the real publishable key** in Supabase → Project Settings → API Keys, then paste into `.env.local` and the CI secret. Verified 2026-11-25: `.env.local` **still holds the legacy `eyJ…` anon JWT** under the new variable name — works today, on Supabase's retirement path.
- [!] `build-apk.yml` never passes `NEXT_PUBLIC_SITE_URL` (only URL + key), so APK OAuth redirect falls back to the default `pages.dev` origin. `.github/workflows/build-apk.yml:31-32`
- [!] **VERSION now drifts the other way**: CI runs `npm run build`, whose `prebuild` bumped the number to `7.3.0.77` in the artifact but cannot commit it back, so the repo file (`7.3.0.76`) is one behind what is live. It has repeated on every deploy since (`7.3.0.49`→`.50`, `7.3.0.76`→`.77`). Same root cause as the §4 policy item.

## 4. PENDING — recommended next work

Deploy pipeline:
- [ ] Decide the VERSION/CI policy: stop `prebuild` bumping in CI (or have CI commit it back), otherwise deployed builds and the repo number never line up — it has now happened twice (repo `7.3.0.49` vs live `7.3.0.50`, repo `7.3.0.76` vs live `7.3.0.77`)
- [ ] `docs/Changelog.md:27` claims Actions bakes the Supabase URL/key "from repo secrets" — no such secrets exist; correct the claim or add the secrets (ledger is append-only, so fix forward in a new entry)
- [ ] If baked sync is *not* wanted, make that explicit in `README.md` / `SELF-HOSTING.md` instead of leaving the workflows referencing secrets that resolve to empty strings

Lint backlog, now that it is readable (244 errors / 74 warnings):
- [ ] `@typescript-eslint/no-explicit-any` — 164 sites, concentrated in `src/lib/store.ts`, `src/lib/pouchdb.ts`
- [ ] `@typescript-eslint/no-unused-vars` — 46 (safe to sweep first)
- [ ] `react-hooks/set-state-in-effect` — 32 (e.g. `src/app/dashboard/about/page.tsx:17`)
- [ ] `react/no-unescaped-entities` — 28, `no-require-imports` — 17, `exhaustive-deps` — 14, `no-img-element` — 12
- [ ] Decide the lint policy: fix incrementally per file, or set rules to warn with a ratchet so CI can enforce "no new errors"

Error handling:
- [ ] 62 empty `catch {}` blocks swallow failures, including user-visible paths: audit import `src/app/dashboard/settings/page.tsx:1355`, session restore `src/app/login/page.tsx:100,112,175`, wizard step checks `src/components/CloudSetupWizard.tsx:17,84,98` — Setup Guide can report false success

Version/release process:
- [ ] Unify the release identity: `VERSION` v7.3.0.76 vs `android/app/build.gradle:11` versionName "7.2.0.33" — only the `android:apk` script syncs them, so an APK built outside that path ships a stale version
- [ ] `docs/Changelog.md` uses a `v7.3.x` scheme while `VERSION` uses `v7.3.0.N` — pick one and record it
- [ ] Add a `CHANGELOG`/`CHANGES.md` ledger entry for the publishable-key migration (needs a release number from you)

Tests (currently zero — no `test` script, no test files):
- [ ] Smallest useful start: `node --test` unit tests for `releaseBase`/`shouldShowWhatsNew`, `cleanSupabaseUrl`, and the sync push/pull error mapping

Docs vs reality:
- [x] `docs/File-Map.md` rewritten against the tree — the previously missing routes
      (`dashboard/developer`, `support`, `terms`, `privacy`) and the new
      `csv-import`/`legal` modules are all in it now (grep: 1/1/4/4/1/6 hits)
- [ ] Offline story: `src/components/RegisterSW.tsx:7-14` and `public/sw.js` intentionally *unregister* the service worker and purge caches, while `README.md:337` promises "works fully offline" and `public/manifest.webmanifest` still offers install — reword the claim or add real caching
- [ ] Two different logos ship side by side: the in-app mark (`public/favicon*.jpg` — dark disc, low-poly orange M, coins) and the PWA/app icon set (`public/icon-*.png`, `icon.svg`, generated from the ₹ tile by `scripts/generate-web-icons.mjs`). Both are wired — installed icon and loading screen never appear together, so nobody notices. Pick one identity or document why they differ.
- [ ] Orphaned config nothing references: `netlify.toml`, `bookmarklet.txt` — confirm before deleting

Product roadmap (mirrors [Active-Tasks.md](Active-Tasks.md)):
- [ ] Recurring-reminder notifications on web — none exist: no `new Notification(` / `PushManager` anywhere in `src`; only Capacitor (`src/lib/capacitor-notifications.ts:24`), yet Settings shows notification toggles
- [ ] PWA offline caching refinements
- [ ] Investment portfolio tracking; multi-currency support

## 5. How to verify (run from `MoneyMeva/`)

```bash
git status --short                    # empty = everything committed
git log --oneline -1                  # the verification-pass commit (§2c), on top of d6883b8
git ls-files tsconfig.tsbuildinfo     # empty = artifact untracked
cat VERSION; node -p "require('./package.json').version"   # v7.3.0.76 / 7.3.0

# old name must survive only in append-only ledgers and the legacy-key note
grep -rn "SUPABASE_ANON_KEY" src Dockerfile .github .env.example        # expect no hits
grep -rn "anon key" --include="*.md" . | grep -v node_modules | grep -vi legacy
#   expect only: MEMORY-CAPSULE.md, docs/Changelog.md (both append-only) and this file

npm run build      # must compile; 29 static pages (26 app routes + 404/not-found)
npm run lint       # 318 problems (244 errors / 74 warnings) — generated dirs now excluded
npx tsc --noEmit   # exit 0
grep -rl "sb_publishable_" out/ | wc -l     # 6 → new UI strings are in the bundle
grep -rl "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" out/ | wc -l   # 2 → baked key still wired
grep -rl "anon key shares one database" out/ | wc -l           # 0 → stale release notes gone

# page payload (§2c): every exported page preloads whatever loading.tsx renders as an <img>
grep -o '<link rel="preload" href="/favicon[^>]*>' out/dashboard.html   # → favicon-256.jpg, not favicon.jpg
grep -rl 'href="/favicon.jpg"' out --include="*.html" | wc -l           # 0 → the 292 KB mark is no longer requested
ls -l public/favicon.jpg public/favicon-256.jpg | awk '{print $5, $9}'  # 299310 source, 7630 shipped

# what is actually deployed (§2b)
gh run list --repo kuldeep7ke/moneymeva --limit 3   # CI 45699882962, Pages 45699882885, APK 45699883151 — all success (§2d)
curl -s https://kuldeep7ke.github.io/moneymeva/dashboard/ | grep -o 'app-version" content="[^"]*"'   # v7.3.0.77
#   a local build bakes the project URL, CI (no secret) cannot:
grep -rl "supabase\.co" out --include="*.js" | wc -l    # 8 locally…
for u in $(curl -s https://kuldeep7ke.github.io/moneymeva/dashboard/ | grep -oE '/moneymeva/_next/static/chunks/[^"]+\.js' | sort -u); do curl -s "https://kuldeep7ke.github.io$u"; done | grep -c "supabase\.co"   # …0 live
curl -s https://moneymevaonline.pages.dev/ | grep -o 'app-version" content="[^"]*"'                   # v7.3.0.45 → Cloudflare not rebuilt
```

Driven in the browser on 2026-11-26 (see §2c): all 26 routes in both themes and all three presets,
plus the click-reached surfaces — What's-New popup (shows 5s after settle; dismiss writes
`mm_seen_release`), forgot-password dialog, Add-transaction modal, the Developer zone past its
gate with its Start-Fresh modal and the PIN prompt, and the Settings credential labels.

Still not testable from this machine: real cloud sync (the automation profile points at the live
project URL, but no key is baked and none was pasted — see §3 for the key that is actually needed),
the Capacitor/APK paths (native notifications, hardware back button), and remote announcement
content, which comes from a bin this build cannot reach. Those three are the honest boundary of
the pass.

A fourth, narrower boundary: the browser sweep ran against the **local** static export. On the
deployed site the same routes render, but `/dashboard/settings` there has no session for this
origin and bounces to `/moneymeva/login`, so the live label evidence is the byte-for-byte chunk
comparison in §2d rather than a rendered read. The automation profile's local storage was restored
after the sweep — real project URL back, the temporary `BLOCKED_FOR_LOCAL_TESTING` sync-key
sentinel removed (it had no backup to restore), PIN counter reset to 0, theme light / brand orange,
session unchanged. Left behind deliberately, not deleted: the `sweeptest@mm.test` profile with its
10 test PINs (`mm_pins` keeps them as plaintext 4-digit strings by design — `src/lib/pinStore.ts:13-30`)
and `mm_seen_release`, which only decides whether What's-New opens once.
