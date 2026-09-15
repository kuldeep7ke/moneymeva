# Announcements via Edge-Cached jsonbin Proxy — Guide & Reuse Playbook

A reusable technique for serving in-app announcements (broadcast pills / release
banners) from a [jsonbin.io](https://jsonbin.io) free bin without blowing through
the **10,000 requests/month quota** as your user count grows — on **every**
platform, including installed apps (Android APK).

This playbook is deliberately generic. Replace names/URLs and copy the three
building blocks into any app that needs dashboard-editable announcements.

---

## 1. The problem

jsonbin.io free tier allows ~10,000 requests/month. If every app install fetches
the bin on every app load, quota is consumed **per user**, not per edit:

| Users × loads/month | Direct-fetch requests | Free quota |
|---|---|---|
| 3,000 | ~3,000+ | 10,000 |
| 12,000 | ~12,000+ | 10,000 — exceeded |

Static hosts (GitHub Pages) and installed apps (Android APK) have **no server**,
so the naive fix — "make a server-side request" — is not available on those
platforms at all.

## 2. The solution (one edge proxy for ALL platforms)

A single Cloudflare Pages Function acts as an **edge-cached proxy** between every
app instance and jsonbin:

```
Every app instance ──> https://<proxy>.pages.dev/api/announcements?type=broadcast|banner
  ├─ Cloudflare Pages web                       │
  ├─ GitHub Pages web                           │  Cloudflare edge cache
  └─ Android APK (installed, no server)         │  ONE copy per TTL window
                                                ▼
                              jsonbin.io/v3/b/<bin-id>/latest
                              (hit only on cache expiry / miss)
```

The app calls **your own URL**, never jsonbin directly. On the first request in a
TTL window the function hits jsonbin once and caches the reply at Cloudflare's
edge; every device for that window is served from cache.

**Why it works on every platform:** the platform only decides where the app is
*served from* — it never changes where the app *fetches announcements from*. All
instances call the same absolute HTTPS URL at runtime, so one Cloudflare
deployment backs Cloudflare Pages, GitHub Pages, and APK simultaneously. The only
cross-platform requirements are:

1. **HTTPS** — yes (`https://*.pages.dev`).
2. **CORS** — the function must return `Access-Control-Allow-Origin: *`, because
   GitHub Pages (`https://user.github.io/...`) and the Android WebView
   (`capacitor://localhost` / `https://localhost`) are cross-origin to the proxy.
3. **Android**: `INTERNET` permission + HTTPS network access in the app (already
   present in any app that does cloud sync).

### Quota math

jsonbin requests per month are bounded by **time**, not users:

```
requests/month ≈ 30 × 1440 / TTL_minutes
```

| TTL | Max jsonbin requests/month |
|---|---|
| 3 hours (Money Meva default) | ~240 |
| 10 min | ~4,320 |
| 30 min | ~1,440 |
| 60 min | ~720 |

Lower TTL = edits appear sooner, more jsonbin requests. Higher = fewer requests,
slower propagation. Everything stays well under 10k for a single bin.

## 3. Building blocks (copy these)

### A. The Cloudflare Pages Function — `functions/api/announcements.js`

A Cloudflare Pages **Function** (`functions/api/announcements.js`) that
normalizes the cache key (ignores extra query params so all devices share one
cache entry), fetches jsonbin on a miss, caches at the edge, and always returns
CORS headers. Bin IDs are configurable as Pages **environment variables**
(`BROADCAST_BIN_ID` / `BANNER_BIN_ID`) with `FALLBACK_IDS` in code.

```js
const TTL_MINUTES = 180;                // 3 hours — tunable per app (see quota math, §2)

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get('type') === 'banner' ? 'banner' : 'broadcast';
  const binId = (type === 'banner' ? env.BANNER_BIN_ID : env.BROADCAST_BIN_ID) || FALLBACK_IDS[type];

  const cacheKey = new Request(`${url.origin}/api/announcements?type=${type}`);
  const cache = caches.default;

  let res = await cache.match(cacheKey);
  if (!res) {
    try {
      const upstream = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { Accept: 'application/json' },
        cf: { cacheTtl: TTL_MINUTES * 60 },
      });
      const body = await upstream.text();
      res = new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': `public, max-age=${TTL_MINUTES * 60}`,
          'Access-Control-Allow-Origin': '*',      // cross-origin: GH Pages + APK
        },
      });
      if (upstream.ok) waitUntil(cache.put(cacheKey, res.clone()));
    } catch {
      res = new Response(JSON.stringify({ error: 'upstream-failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
  return res;
}
```

> **Money Meva reference (how this app actually runs it):**
> - The same `functions/api/announcements.js` is deployed to **both** Cloudflare
>   Pages projects — `moneymevaonline` and `moneymeva` — by
>   `.github/workflows/deploy-cloudflare.yml` (it runs
>   `wrangler pages deploy out`, which bundles `functions/`, and auto-creates the
>   project with `pages project create ... || true` if missing). No per-project
>   config is needed.
> - **No dashboard environment variables are required.** `FALLBACK_IDS` in the
>   function carries the bin IDs server-side; `BROADCAST_BIN_ID` /
>   `BANNER_BIN_ID` are optional overrides.
> - The app's canonical endpoint is
>   `https://moneymevaonline.pages.dev/api/announcements` (the
>   `ANNOUNCEMENTS_API` default in `src/lib/env.ts`). It is intentionally
>   decoupled from `SITE_URL` (OAuth identity URL) and from the supabase
>   config, which the app deliberately does **not** bake — users bring their own.

### B. The app-side endpoint constant (decoupled from SITE_URL)

Define the announcement URL as its **own** constant with an optional override.
Do **not** derive it from the OAuth identity URL (`SITE_URL`) — a self-hoster
points `SITE_URL` at their own domain and announcements must keep flowing through
the shared proxy.

```ts
export const ANNOUNCEMENTS_API = (
  process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API?.replace(/\/+$/, '') ||
  'https://<proxy>.pages.dev/api/announcements'
);
```

- Default: shared Cloudflare proxy — correct for every default build (web, GH
  Pages, APK) with **zero configuration**.
- Override `NEXT_PUBLIC_ANNOUNCEMENTS_API` only if you run your own proxy.

### C. The app-side fetch pattern (one fetch per load, graceful fallback)

```ts
const fetchJson = async () => {
  try {                                    // primary: edge-cached proxy (quota-friendly)
    const r = await fetch(`${ANNOUNCEMENTS_API}?type=broadcast`);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {}
  try {                                    // fallback: direct jsonbin, only if proxy fails
    const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?t=${Date.now()}`,
      { cache: 'no-store' });
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {}
  return null;                             // silent failure — no pill/banner
};
```

Response shape is jsonbin's (`{ record: ... }`); unwrap via `res?.record ?? res`.
Parse `expires`/`startDate` and skip stale/dismissed entries. Cache the fetched
list in **module scope** so in-app navigation never re-requests it (one request
per app load at most).

## 4. How it works on each platform

| Platform | Hosts app | Fetch URL | Needs CORS | Result |
|---|---|---|---|---|
| Cloudflare Pages (`moneymevaonline` / `moneymeva`) | either project | same/cross-origin proxy | no | edge-cached |
| GitHub Pages | `user.github.io/<repo>/` | cross-origin proxy | yes | edge-cached |
| Android APK | bundled WebView | cross-origin proxy | yes | edge-cached |
| Any other host (Netlify/Vercel/custom) | same | cross-origin proxy | yes | edge-cached |

All four are identical from the function's point of view — a GET with `?type=`.
Nothing is platform-specific in the app code.

## 5. Setting it up for a NEW app (reuse checklist)

1. **jsonbin** — create a bin; paste your array (broadcast) or single object
   (banner). Copy the bin ID.
2. **Cloudflare Pages** — create a project (new, or reuse an existing one so the
   function rides the same edge cache). Add a `functions/api/announcements.js`
   exactly as in §3-A and `functions/` must be deployed (Cloudflare auto-runs
   Functions; no config). In Money Meva this is automatic: the deploy workflow
   deploys to both `moneymevaonline` and `moneymeva` and creates a missing
   project (`pages project create ... || true`).
3. **Bin IDs** — optional. Set `BROADCAST_BIN_ID` / `BANNER_BIN_ID` as Production
   env vars in the Pages dashboard, **or** skip dashboard setup entirely and let
   `FALLBACK_IDS` in code (server-side, never in app bundles) carry the IDs — the
   Money Meva default.
4. **App** — add the `ANNOUNCEMENTS_API` constant (§3-B) and the fetch pattern
   (§3-C). Wire the pills/banner UI to the fetched records.
5. **TTL** — tune `TTL_MINUTES` per the quota math (§2).
6. **Build every platform** — build the static export for GH Pages/deploy and the
   APK; no per-platform branches. The proxy URL is the same in all bundles.
7. **Verify cross-origin** — in browser DevTools on the GH Pages URL and in the
   APK, confirm the proxy responds with `access-control-allow-origin: *` and
   `cache-control: public, max-age=...`.

## 6. Editing announcements (day-to-day)

- Edit the record in the **jsonbin dashboard** — no app update needed.
- Change appears after `TTL_MINUTES` (edge cache) plus one app load (each load
  fetches once).
- Edit results are visible on web **and** installed APKs at the same time
  (same endpoint, shared cache).

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Nothing on GH Pages / APK | App called its own `/api/announcements` (old SITE_URL-derived config) and 404'd | Rebuild with `NEXT_PUBLIC_ANNOUNCEMENTS_API` unset (uses proxy) or set to proxy URL; don't reuse `SITE_URL` |
| 404 on proxy | Wrong host / bin missing | Check the function deployed (`/api/announcements?type=broadcast` via `curl -I`) |
| CORS error in browser/WebView | Function header missing | Ensure `Access-Control-Allow-Origin: *` |
| Stale content | Edge TTL + per-load fetch | Lower `TTL_MINUTES`, redeploy, hard-refresh app |
| jsonbin usage climbing | Proxy bypassed (fallback engaged) | Check app network tab: requests must go to `<proxy>/api/announcements`, not `api.jsonbin.io` |
| Quota exceeded (4xx/429) | Very low TTL or many bins | Raise `TTL_MINUTES`; check Cloudflare analytics for request volume |

## 8. Monitoring

- **Cloudflare Pages → Functions** tab: per-URL request volume, latency, status —
  confirms the proxy is absorbing traffic.
- **jsonbin dashboard**: usage meter — should be flat (~time-based spikes), not
  scaling with users.

## 9. Notes & trade-offs

- **Multiple bins/companies**: add a `type` param per record family; each stays a
  separate cache key and jsonbin hit.
- **Unbounded per-user churn**: capped at TTL; the pattern trades *real-time per
  user* for *bounded global cost*.
- **Offline**: if the proxy (and fallback) are unreachable, the app shows no
  announcement — same as any fetch-based feature. The APK should already be
  offline-first for its data.