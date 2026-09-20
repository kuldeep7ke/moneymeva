// Cloudflare Pages Function — edge-cached proxy for the single jsonbin "announcements" bin.
// One combined bin holds BOTH broadcast pills and the banner:
//   { record: { broadcasts: [...], banner: {...} } }
// All devices hit THIS endpoint; Cloudflare serves each response from the edge
// cache for TTL_MINUTES, so jsonbin request volume depends on time only —
// never on user count. Bin ID lives server-side here (never in app bundles).
// Optional: set ANNOUNCEMENTS_BIN_ID as a Pages env var in the Cloudflare
// dashboard to override the fallback below.
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b/';
const FALLBACK_BIN_ID = '6aafc4baac6210605ae254df';
// How long each response is cached at Cloudflare's edge (in MINUTES).
// Lower = users see jsonbin edits sooner (but jsonbin gets more requests). Higher = fewer requests.
// 180 = 3 hours: ~8 jsonbin requests/day (≈240/month, far under the 10k free cap).
const TTL_MINUTES = 180;
const TTL_SECONDS = TTL_MINUTES * 60;

export async function onRequestGet(context) {
  const { request, env, waitUntil } = context;
  const url = new URL(request.url);
  const binId = env.ANNOUNCEMENTS_BIN_ID || FALLBACK_BIN_ID;

  if (!binId) {
    return new Response(JSON.stringify({ error: 'bin-not-configured' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // Normalize cache key: ignore query params so every device shares one cache entry
  const cacheKey = new Request(`${url.origin}/api/announcements`);
  const cache = caches.default;

  let res = await cache.match(cacheKey);
  if (!res) {
    try {
      const upstream = await fetch(`${JSONBIN_BASE}${binId}/latest`, {
        headers: { Accept: 'application/json' },
        cf: { cacheTtl: TTL_SECONDS },
      });
      const body = await upstream.text();
      res = new Response(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': `public, max-age=${TTL_SECONDS}`,
          'Access-Control-Allow-Origin': '*',
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