import { addTransaction } from '@/lib/store';
import { todayStr } from '@/lib/utils';
import type { TransactionType } from '@/types';

type NewTransaction = Parameters<typeof addTransaction>[0];

export interface CsvSkip { line: number; reason: string }
export interface CsvImportResult { ok: boolean; error?: string; imported: number; skipped: CsvSkip[] }

const TYPES: TransactionType[] = ['income', 'expense', 'investment'];

// Quoted fields can contain commas and doubled quotes; naive split(',') mangles
// them, so parse character by character instead.
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Imports transactions from `date,amount,category,description,type,partnerId`
 * CSV. Rows that cannot be represented faithfully are reported instead of being
 * quietly coerced, so an import never invents data the user did not supply.
 */
export function importTransactionsFromCsv(
  text: string,
  partners: { id: string; name: string }[],
  onProgress?: (imported: number, total: number) => void
): CsvImportResult {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { ok: false, error: 'The file has no data rows.', imported: 0, skipped: [] };

  const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase());
  const idx = (names: string[]) => headers.findIndex(h => names.includes(h));
  const dateIdx = idx(['date']);
  const amountIdx = idx(['amount']);
  const catIdx = idx(['category']);
  const descIdx = idx(['description', 'desc', 'note', 'notes']);
  const typeIdx = idx(['type']);
  const partnerIdx = idx(['partnerid', 'partner', 'party']);

  if (amountIdx < 0) return { ok: false, error: 'No "amount" column found. Expected headers: date, amount, category, description, type.', imported: 0, skipped: [] };

  const skipped: CsvSkip[] = [];
  let imported = 0;
  const total = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const amount = Number.parseFloat(cols[amountIdx] ?? '');
    if (!Number.isFinite(amount) || amount <= 0) {
      skipped.push({ line: i + 1, reason: 'amount missing or not a positive number' });
      continue;
    }

    let date = todayStr();
    if (dateIdx >= 0) {
      const raw = cols[dateIdx] ?? '';
      if (!raw) { skipped.push({ line: i + 1, reason: 'date is empty' }); continue; }
      if (!isRealDate(raw)) { skipped.push({ line: i + 1, reason: `"${raw}" is not a valid YYYY-MM-DD date` }); continue; }
      date = raw;
    }

    let type: TransactionType = 'expense';
    if (typeIdx >= 0) {
      const raw = (cols[typeIdx] ?? '').toLowerCase();
      if (raw && !TYPES.includes(raw as TransactionType)) {
        skipped.push({ line: i + 1, reason: `"${raw}" is not income, expense or investment` });
        continue;
      }
      if (raw) type = raw as TransactionType;
    }

    let partnerAccountId: string | undefined;
    if (partnerIdx >= 0 && cols[partnerIdx]) {
      const needle = cols[partnerIdx].toLowerCase();
      const byId = partners.find(p => p.id === cols[partnerIdx]);
      const byName = partners.find(p => p.name.trim().toLowerCase() === needle);
      if (!byId && !byName) {
        skipped.push({ line: i + 1, reason: `unknown party "${cols[partnerIdx]}"` });
        continue;
      }
      partnerAccountId = (byId || byName)?.id;
    }

    const row: NewTransaction = {
      amount,
      type,
      category: catIdx >= 0 && cols[catIdx] ? cols[catIdx] : 'Other',
      description: descIdx >= 0 ? (cols[descIdx] || '') : '',
      date,
      partnerAccountId,
      isRecurring: false,
    };
    addTransaction(row);
    imported++;
    if (imported % 25 === 0) onProgress?.(imported, total);
  }

  return { ok: true, imported, skipped };
}
