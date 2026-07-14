import { formatPrice } from '@/lib/format';

// Status palette — validated (node scripts/validate_palette.js), fixed order, never cycled.
const ROWS: { key: string; label: string; color: string }[] = [
  { key: 'received', label: 'Delivered', color: '#059669' },
  { key: 'paidReturn', label: 'Paid return', color: '#d97706' },
  { key: 'returned', label: 'Returned', color: '#e11d48' },
  { key: 'pending', label: 'Pending / dispatched', color: '#3b82f6' },
];

export default function StatusBreakdown({
  counts,
}: {
  counts: { received: number; paidReturn: number; returned: number; pending: number };
}) {
  const max = Math.max(counts.received, counts.paidReturn, counts.returned, counts.pending, 1);
  return (
    <div className="space-y-3">
      {ROWS.map((r) => {
        const value = counts[r.key as keyof typeof counts];
        const pct = Math.max((value / max) * 100, value > 0 ? 3 : 0);
        return (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-32 text-sm text-stone-600 shrink-0">{r.label}</div>
            <div className="flex-1 h-2.5 rounded-full bg-stone-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: r.color }} />
            </div>
            <div className="w-10 text-sm font-semibold text-stone-900 text-right shrink-0">{value}</div>
          </div>
        );
      })}
    </div>
  );
}

export function returnLossNote(returnCost: number) {
  return returnCost > 0 ? `${formatPrice(returnCost)} lost to returns this period` : 'No return losses this period';
}
