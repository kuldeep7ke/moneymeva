'use client';

import { FileText, CheckCircle, AlertTriangle, XCircle, Mail, Cloud } from 'lucide-react';

// Rendered by both /terms (public site) and /dashboard/terms (in-app).
export default function TermsContent() {
  return (
    <div className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-brand" /> Acceptance of Terms
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          By using Money Meva, you agree to these Terms of Service. If you do not agree with any part of these terms, please do not use the application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Description of Service</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Money Meva is a personal finance management application that helps you track expenses, income, savings, and investments. Your data is stored on your device by default; multi-device sync, which you can switch on, also keeps a copy on the Supabase project you connect.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" /> User Responsibilities
        </h2>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>You are responsible for the accuracy of data you enter.</li>
          <li>You are responsible for backing up your data regularly.</li>
          <li>You understand that clearing browser data will delete all app data on this device.</li>
          <li>You will not use the application for any illegal purposes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" /> Disclaimer
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Money Meva is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee:
        </p>
        <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4">
          <li>Uninterrupted or error-free operation.</li>
          <li>Data recovery after deletion — the Archive holds deleted entries for 30 days, and nothing after that.</li>
          <li>Compatibility with all devices or browsers.</li>
          <li>Financial advice or recommendations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Data Ownership</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          You retain full ownership of all data you enter into Money Meva. We do not claim any rights over your financial information, and we do not read it — but with sync enabled the copy lives on the Supabase project you connected, under that project&apos;s access rules.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Limitation of Liability</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Money Meva and its developers shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the application, including but not limited to data loss, financial decisions, or business losses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Intellectual Property</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          All content, design, and code within Money Meva are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without explicit permission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cloud className="h-5 w-5 text-amber-500" /> Multi-Device Sync Warning
        </h2>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
            Money Meva offers an optional multi-device sync feature via Supabase. By using this feature, you acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-4 text-sm">
            <li>The sync URL/link you provide acts as a <strong>key to your personal financial data</strong> stored on the remote server.</li>
            <li>Anyone with access to this link can <strong>read, modify, or delete</strong> your financial data.</li>
            <li>You are <strong>solely responsible</strong> for keeping this link private and secure.</li>
            <li>You must <strong>never share</strong> the link directly or indirectly with anyone.</li>
            <li>The developers of Money Meva <strong>are not liable</strong> for any data breach, loss, or unauthorized access resulting from the exposure or misuse of your sync link.</li>
            <li>This feature is provided for user convenience only — use it at your own risk.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Changes to Terms</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          We reserve the right to modify these Terms of Service at any time. Changes are reflected here with a new &ldquo;last updated&rdquo; date. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Governing Law</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          These terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand" /> Contact Us
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <a href="mailto:info@marathimeva.com" className="inline-flex items-center gap-2 text-brand hover:text-brand-secondary dark:text-brand-secondary dark:hover:text-brand transition-colors font-medium">
          info@marathimeva.com
        </a>
      </section>
    </div>
  );
}

export function TermsHeader({ updatedAt }: { updatedAt: string }) {
  return (
    <div className="text-center space-y-4 py-6">
      <div className="bg-brand-secondary dark:bg-brand-muted/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
        <FileText className="h-8 w-8 text-brand dark:text-brand-secondary" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Terms of Service</h1>
      <p className="text-slate-500 dark:text-slate-400">Last updated: {updatedAt}</p>
    </div>
  );
}
