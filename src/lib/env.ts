// Runtime config. Supabase URL/key are NOT baked in — this app is offline-first and
// cloud sync is bring-your-own: set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// / NEXT_PUBLIC_SITE_URL in .env.local (see SELF-HOSTING.md) before building, or paste a
// project in Settings → Multi-Device Sync at runtime. Announcement bins stay obfuscated.
const _K = 'moneymeva';
function _d(e: string): string {
  try {
    const bin = atob(e);
    let out = '';
    for (let i = 0; i < bin.length; i++) {
      out += String.fromCharCode(bin.charCodeAt(i) ^ _K.charCodeAt(i % _K.length));
    }
    return out;
  } catch {
    return '';
  }
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://moneymevaonline.pages.dev'
).replace(/\/$/, '');

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// jsonbin.io Bin IDs (broadcast & banner — edit via jsonbin.io dashboard, see docs/BROADCAST-GUIDE.md)
export const BROADCAST_BIN_ID = _d('Ww4PXRteV08ADllcVElbVUMADgpdBE8M');
export const BANNER_BIN_ID = _d('Ww4PXRteVEcADllcVElbVUMADgpdBEkP');
export const JSONBIN_BASE = _d('BRsaFQpXSlkAHQZADwoCCxQIA0EHClYbVlkDQg==');

// Edge-cached proxy (Cloudflare Pages Function, functions/api/announcements.js).
// Primary source for broadcasts/banner on EVERY platform — Cloudflare Pages, GitHub
// Pages and Android APK all call this one URL — because Cloudflare serves a single
// edge-cached copy per TTL window instead of per-device requests, which keeps the
// jsonbin free quota from scaling with user count. Deliberately NOT derived from
// SITE_URL (the OAuth identity URL): a self-hoster rightly points SITE_URL at their
// own domain, and announcements must keep flowing through the shared proxy. Override
// only if you run your own proxy (see docs/ANNOUNCEMENTS-EDGE-PROXY-GUIDE.md).
export const ANNOUNCEMENTS_API = (
  process.env.NEXT_PUBLIC_ANNOUNCEMENTS_API?.replace(/\/+$/, '') ||
  'https://moneymevaonline.pages.dev/api/announcements'
);
