'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrivacyContent, { PrivacyHeader } from '@/components/legal/PrivacyContent';
import { POLICY_LAST_UPDATED } from '@/lib/legal';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-secondary dark:from-brand-dark dark:via-[#2A2522] dark:to-brand-muted py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand-secondary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <PrivacyHeader updatedAt={POLICY_LAST_UPDATED} />
        <PrivacyContent />
      </div>
    </div>
  );
}
