export interface WhatsNewItem {
  version: string;
  date: string;
  items: string[];
}

export const RELEASE_NOTES: WhatsNewItem = {
  version: 'v7.3.0',
  date: '25 Nov 2026',
  items: [
    'Cloud sync now uses a Supabase publishable API key (starts with sb_publishable_); legacy anon keys still work',
    'Settings, Developer and Setup Guide all label the credential "Publishable key"',
    'Shared sync database — every device with the same URL + publishable key shares one database',
    'Setup Guide simplified: 2 steps (create project, run SQL)',
  ],
};

const STORAGE_KEY = 'mm_seen_release';

export function getLastSeenVersion(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function markVersionSeen(version: string): void {
  try { localStorage.setItem(STORAGE_KEY, version); } catch {}
}

// `prebuild` bumps the 4th VERSION segment on every build, so release-level
// comparison must ignore it — otherwise the modal re-opens after each deploy.
const BUILD_SUFFIX = /^(v?\d+\.\d+\.\d+)\.\d+$/;

export function releaseBase(version: string): string {
  const m = (version || '').match(BUILD_SUFFIX);
  return m ? m[1] : version;
}

export function shouldShowWhatsNew(currentVersion: string): boolean {
  const lastSeen = getLastSeenVersion();
  if (!lastSeen) return true;
  return releaseBase(lastSeen) !== releaseBase(currentVersion);
}
