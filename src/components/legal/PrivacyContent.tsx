'use client';

import { Shield, Lock, Eye, Database, Trash2, Mail, Cloud, AlertTriangle } from 'lucide-react';

// Rendered by both /privacy (public site) and /dashboard/privacy (in-app).
// Keeping one copy means the two pages can never drift apart in wording.
export default function PrivacyContent() {
  return (
    <div className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Eye className="h-5 w-5 text-brand" /> Information We Collect
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Money Meva is designed with privacy as a core principle. We collect <strong>no personal data</strong> and <strong>no financial information</strong> on our servers.
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>All your financial data (transactions, income, expenses, savings, goals) is stored <strong>locally on your device</strong> using IndexedDB.</li>
          <li>Your records are never uploaded. The only automatic network request the app makes is for the release-news banner and announcement pills, which fetch a public JSON feed — it carries no personal or financial data.</li>
          <li>No cookies are used for tracking or analytics.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database className="h-5 w-5 text-brand" /> How Your Data is Stored
        </h2>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>All data is stored in your browser&apos;s IndexedDB — a secure, local database.</li>
          <li>Data never leaves your device unless you turn on multi-device sync or export it yourself.</li>
          <li>You have full control over your data at all times.</li>
          <li>You can delete everything anytime from Settings → Danger Zone.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand" /> Data Security
        </h2>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>No account creation or login is required on our servers.</li>
          <li>When you do create a profile, its password is stored in this browser&apos;s local storage on your device and is never transmitted to us. Anyone with access to the device can read it, so use this app on devices you control.</li>
          <li>PIN-based security is optional and stored locally only.</li>
          <li>Session auto-lock protects your data when the device is idle.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-brand" /> Data Deletion
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Your records live on your device, so deletion is under your control:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>Delete individual entries from any page. Deleted rows go to the Archive, where they stay for 30 days (or until you purge them) and can be restored.</li>
          <li>Permanently purge archived entries from Archive → Delete permanently to remove them for good.</li>
          <li>Clear everything from Settings → Danger Zone, which offers &ldquo;Clear User Data&rdquo; (your ledger, settings kept) and &ldquo;Clear All Data&rdquo;.</li>
          <li>Clear browser site data to remove the databases directly from this device.</li>
          <li>With sync on, deletion also propagates to the remote copy; the remote server&apos;s own retention and backups are outside our control.</li>
          <li>Once entries leave the Archive and you have no export, recovery is not possible — back up regularly.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Third-Party Services</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Money Meva does not integrate with any third-party analytics, advertising, or tracking services. We do not use Google Analytics, Facebook Pixel, or similar tools.
        </p>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          The services we do rely on are infrastructure, not trackers:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li><strong>Hosting</strong> — the website is served by Cloudflare Pages and GitHub Pages, which see standard web-server request data (IP address, user agent, URL) as any host would.</li>
          <li><strong>Announcements</strong> — the release-news banner and pills fetch a public JSON feed through an edge function on our own Cloudflare app. The request carries no personal or financial data, and no account or cookie is set.</li>
          <li><strong>Web fonts</strong> — the Geist font is bundled into the app at build time and served from this site, so the browser never contacts Google Fonts.</li>
          <li><strong>Sync (only if you switch it on)</strong> — your own Supabase project, described below. We have no access to it.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-amber-500" /> <AlertTriangle className="h-4 w-4 text-amber-500" /> Multi-Device Sync &amp; Your Data
        </h2>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            When you turn on multi-device sync, your ledger replicates over HTTPS to the CouchDB-compatible (Supabase) endpoint configured for your build. That connection is encrypted in transit, but your documents are <strong>not end-to-end encrypted by the app</strong> — they are stored as ordinary rows on that server. This means:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4 text-sm">
            <li>Your data is <strong>no longer local only</strong> — it resides on the remote server.</li>
            <li>The sync URL you connect with is the <strong>only authentication mechanism</strong> protecting your data on that server.</li>
            <li>Anyone who obtains this URL can <strong>access your complete financial data</strong> stored on the remote server.</li>
            <li>The security of your data on the remote server depends entirely on that server&apos;s security measures, which are beyond our control.</li>
            <li>You should only use Supabase projects that you <strong>trust and manage</strong> yourself.</li>
            <li>We do not read, copy, or log the contents of your sync database. On the hosted build, the shared sync endpoint and its publishable key are configured by us at build time, so that deployment trusts the project&apos;s access rules; point <code className="text-xs px-1 rounded bg-slate-100 dark:bg-brand-muted">NEXT_PUBLIC_SUPABASE_URL</code> at your own project when self-hosting.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Changes to This Policy</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          We may update this Privacy Policy from time to time. Any changes are reflected on this page with a new &ldquo;last updated&rdquo; date. Continued use of the app constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand" /> Contact Us
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <a href="mailto:info@marathimeva.com" className="inline-flex items-center gap-2 text-brand hover:text-brand-secondary dark:text-brand-secondary dark:hover:text-brand transition-colors font-medium">
          info@marathimeva.com
        </a>
      </section>
    </div>
  );
}

export function PrivacyHeader({ updatedAt }: { updatedAt: string }) {
  return (
    <div className="text-center space-y-4 py-6">
      <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
        <Shield className="h-8 w-8 text-brand dark:text-brand-secondary" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
      <p className="text-slate-500 dark:text-slate-400">Last updated: {updatedAt}</p>
    </div>
  );
}
