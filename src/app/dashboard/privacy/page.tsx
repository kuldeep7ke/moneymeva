'use client';

import DashboardLayout from '@/components/DashboardLayout';
import Reveal from '@/components/Reveal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrivacyContent, { PrivacyHeader } from '@/components/legal/PrivacyContent';
import { POLICY_LAST_UPDATED } from '@/lib/legal';

export default function PrivacyPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <Reveal><Link href="/dashboard/about" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand-secondary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to About
        </Link></Reveal>

        <Reveal delay={100}><PrivacyHeader updatedAt={POLICY_LAST_UPDATED} /></Reveal>
        <Reveal delay={200}><PrivacyContent /></Reveal>
      </div>
    </DashboardLayout>
  );
}
