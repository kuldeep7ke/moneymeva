'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/lib/i18n';
import { languages, type Language } from '@/lib/i18n/translations';
import { Globe, Check } from 'lucide-react';

export default function LanguageSelector({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, languages.findIndex(l => l.code === lang));
    itemRefs.current[idx]?.focus();
  }, [open, lang]);

  const updatePos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  const current = languages.find(l => l.code === lang);

  const select = (code: Language) => { setLang(code); setOpen(false); btnRef.current?.focus(); };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
    const idx = items.findIndex(el => el === document.activeElement);
    const move = (n: number) => {
      if (!items.length) return;
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') { e.preventDefault(); move(idx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); move(0); }
    else if (e.key === 'End') { e.preventDefault(); move(items.length - 1); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); if (e.key === 'Escape') { e.preventDefault(); btnRef.current?.focus(); } }
  };

  const items = (
    <>
      {languages.map((l, i) => (
        <button key={l.code} type="button" role="menuitem" tabIndex={-1}
          ref={el => { itemRefs.current[i] = el; }}
          onClick={() => select(l.code as Language)}
          className={`w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium cursor-pointer ${
            lang === l.code
              ? 'text-brand dark:text-brand-secondary bg-brand-secondary/50 dark:bg-brand-muted/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-muted/20'
          }`}
        >
          <span className="flex-1 text-left">{l.nativeName}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-500">{l.name}</span>
          {lang === l.code && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
        </button>
      ))}
    </>
  );

  const chevron = (cls: string) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  if (variant === 'minimal') {
    return (
      <div ref={containerRef} className="relative inline-flex items-center">
        <button ref={btnRef} type="button" onClick={() => setOpen(v => !v)}
          aria-haspopup="menu" aria-expanded={open} aria-label={`Language: ${current?.name}`}
          onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); } }}
          className="flex items-center gap-1.5 bg-transparent border border-slate-200/60 dark:border-brand-muted rounded-full pl-2.5 pr-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 dark:hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-brand/30 cursor-pointer transition-colors"
        >
          <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span>{current?.nativeName}</span>
          {chevron(`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`)}
        </button>
        {open && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50" onKeyDown={onListKeyDown}>
            <div role="menu" aria-label="Select language" className="bg-white dark:bg-[#2A2522] border border-slate-200 dark:border-brand-muted shadow-lg rounded-xl py-1.5 min-w-[140px] overflow-y-auto max-h-72">
              {items}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="inline-block">
      <button ref={btnRef} type="button" onClick={() => { updatePos(); setOpen(v => !v); }}
        aria-haspopup="menu" aria-expanded={open} aria-label={`Language: ${current?.name}`}
        onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); updatePos(); setOpen(true); } }}
        className="flex items-center gap-2 bg-white dark:bg-[#2A2522] border border-slate-200 dark:border-brand-muted rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 focus-visible:ring-2 focus-visible:ring-brand cursor-pointer transition-colors whitespace-nowrap"
      >
        <Globe className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-left">{current?.nativeName} ({current?.name})</span>
        {chevron(`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`)}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)} onKeyDown={onListKeyDown}>
          <div className="fixed" style={{ top: pos.top, left: pos.left, width: pos.width }}>
            <div role="menu" aria-label="Select language" className="bg-white dark:bg-[#2A2522] border border-slate-200 dark:border-brand-muted shadow-lg rounded-lg py-1 overflow-y-auto max-h-72"
              onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
              {items}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
