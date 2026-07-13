'use client';
import { useState } from 'react';
import { formatPrice, formatDate } from '@/lib/format';
import type { FinanceOrderRow, FinanceSummary } from '@/lib/finance';

type FinanceData = { summary: FinanceSummary; orders: FinanceOrderRow[] };

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: '🕐 Pending', cls: 'bg-yellow-100 text-yellow-800' },
  dispatched: { label: '🚚 Dispatched', cls: 'bg-blue-100 text-blue-800' },
  received: { label: '✅ Received', cls: 'bg-green-100 text-green-800' },
  returned: { label: '↩️ Returned', cls: 'bg-red-100 text-red-800' },
};

export default function FinanceView({ initial }: { initial: FinanceData }) {
  const [data, setData] = useState<FinanceData>(initial);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [reconcileText, setReconcileText] = useState('');
  const [reconciling, setReconciling] = useState(false);
  const [reconcileMsg, setReconcileMsg] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const load = async (fromDate: string, toDate: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.set('from', String(new Date(fromDate + 'T00:00:00').getTime()));
    if (toDate) params.set('to', String(new Date(toDate + 'T23:59:59').getTime()));
    const res = await fetch(`/api/admin/finance?${params.toString()}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const applyRange = (e: React.FormEvent) => {
    e.preventDefault();
    load(from, to);
  };

  const clearRange = () => {
    setFrom(''); setTo('');
    load('', '');
  };

  const sync = async () => {
    setSyncing(true);
    setSyncMsg('');
    const res = await fetch('/api/admin/finance/sync', { method: 'POST' });
    const d = await res.json().catch(() => ({}));
    setSyncing(false);
    if (res.ok) {
      setSyncMsg(
        `Checked ${d.checked} order(s), updated ${d.updated}.` +
        (d.remaining > 0 ? ` ${d.remaining} more still pending — click Sync again to continue.` : '') +
        (d.errors?.length ? ` ${d.errors.length} lookup error(s).` : ''),
      );
      load(from, to);
    } else {
      setSyncMsg(d.error || 'Sync failed');
    }
  };

  const reconcile = async () => {
    const rows = reconcileText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\t|,/).map((p) => p.trim());
        const key = parts[0]?.replace(/^#/, '') || '';
        const fee = Number((parts[1] || '').replace(/[^\d.-]/g, ''));
        return { key, fee };
      })
      .filter((r) => r.key);

    if (rows.length === 0) {
      setReconcileMsg('Paste at least one row: Order ID or Consignment ID, then the actual charge.');
      return;
    }
    setReconciling(true);
    setReconcileMsg('');
    const res = await fetch('/api/admin/finance/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    const d = await res.json().catch(() => ({}));
    setReconciling(false);
    if (res.ok) {
      setReconcileMsg(
        `Matched ${d.matched.length} order(s).` +
        (d.unmatched.length ? ` Couldn't match: ${d.unmatched.join(', ')}` : ''),
      );
      if (d.matched.length) load(from, to);
    } else {
      setReconcileMsg(d.error || 'Reconcile failed');
    }
  };

  const importCsv = async (file: File) => {
    setImporting(true);
    setImportMsg('');
    const csv = await file.text();
    const res = await fetch('/api/admin/finance/import-pathao-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv }),
    });
    const d = await res.json().catch(() => ({}));
    setImporting(false);
    if (res.ok) {
      setImportMsg(
        `${d.rowsInCsv} delivery row(s) in file — updated ${d.feeUpdated} fee(s), ${d.statusUpdated} status(es), linked ${d.linkedByPhone} pre-API order(s) by phone.` +
        (d.ambiguous.length ? ` Ambiguous (multiple possible matches): ${d.ambiguous.join('; ')}` : '') +
        (d.unmatched.length ? ` Couldn't match: ${d.unmatched.join(', ')}` : ''),
      );
      load(from, to);
    } else {
      setImportMsg(d.error || 'Import failed');
    }
  };

  const { summary } = data;

  return (
    <div className="mt-6 space-y-6">
      <div className="card p-4 flex flex-wrap items-end gap-3">
        <form onSubmit={applyRange} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <button className="btn btn-outline" disabled={loading}>{loading ? 'Loading…' : 'Apply'}</button>
          {(from || to) && <button type="button" onClick={clearRange} className="btn btn-outline">Clear</button>}
        </form>
        <div className="ml-auto flex flex-col items-end gap-1">
          <button onClick={sync} disabled={syncing} className="btn btn-primary">
            {syncing ? 'Syncing with Pathao…' : 'Sync statuses with Pathao'}
          </button>
          {syncMsg && <div className="text-xs text-stone-600 max-w-xs text-right">{syncMsg}</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Revenue"
          value={formatPrice(summary.revenue)}
          sub={summary.paidReturnCount ? `Includes ${summary.paidReturnCount} paid-return order(s)` : undefined}
        />
        <SummaryCard label="Cost of goods" value={'-' + formatPrice(summary.cogs)} />
        <SummaryCard label="Delivery cost" value={'-' + formatPrice(summary.deliveryCost)} />
        <SummaryCard
          label="Delivery profit"
          value={formatPrice(summary.deliveryProfit)}
          sub="Charged to customer minus Pathao's actual fee"
          highlight={summary.deliveryProfit >= 0 ? 'green' : 'red'}
        />
        <SummaryCard label="Return cost" value={'-' + formatPrice(summary.returnCost)} sub={`Estimated only, for returns without a real Pathao fee yet`} />
        <SummaryCard
          label="Net profit"
          value={formatPrice(summary.netProfit)}
          highlight={summary.netProfit >= 0 ? 'green' : 'red'}
        />
        <SummaryCard label="Pipeline (not yet final)" value={formatPrice(summary.pendingValue)} sub={`${summary.pendingCount} order(s) pending/in transit`} />
      </div>

      <div className="text-xs text-stone-500">
        {summary.deliveredCount} delivered · {summary.returnedCount} returned ({summary.paidReturnCount} paid) · {summary.pendingCount} pending/dispatched.
        Delivery cost uses Pathao&apos;s actual fee when known, otherwise the delivery charge collected from the customer as an estimate.
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-semibold">Import Pathao CSV</h2>
        <p className="text-sm text-stone-500">
          From the Pathao merchant panel: Deliveries → Export CSV. Upload it here — it has the real total fee (delivery + COD fee) and live
          order status per order, so this updates both delivery cost and order status (delivered/returned) in one go.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv"
            disabled={importing}
            onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
          />
          {importing && <span className="text-sm text-stone-500">Importing…</span>}
        </div>
        {importMsg && <div className="text-xs text-stone-600">{importMsg}</div>}
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-semibold">Reconcile manually</h2>
        <p className="text-sm text-stone-500">
          For one-off corrections without a full CSV export. Paste rows (Order ID or Consignment ID, then the actual charge).
          One per line — <code className="text-xs bg-stone-100 px-1 rounded">1161, 59.30</code> or paste straight from a spreadsheet (tab-separated).
        </p>
        <textarea
          className="input font-mono text-sm"
          rows={4}
          placeholder={'1161, 59.30\n1160, 59.30\nDC130726PCZ7ER, 66.30'}
          value={reconcileText}
          onChange={(e) => setReconcileText(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button onClick={reconcile} disabled={reconciling} className="btn btn-outline">
            {reconciling ? 'Reconciling…' : 'Reconcile'}
          </button>
          {reconcileMsg && <div className="text-xs text-stone-600">{reconcileMsg}</div>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[940px]">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Revenue</th>
              <th className="px-4 py-2 text-right">COGS</th>
              <th className="px-4 py-2 text-right">Delivery</th>
              <th className="px-4 py-2 text-right">Delivery profit</th>
              <th className="px-4 py-2">Consignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.orders.map((o) => {
              const isPaidReturn = o.status === 'returned' && o.revenue > 0;
              const s = isPaidReturn
                ? { label: '↩️ Paid Return (PR)', cls: 'bg-orange-100 text-orange-800' }
                : STATUS_MAP[o.status] ?? { label: o.status, cls: 'bg-stone-100 text-stone-600' };
              return (
                <tr key={o.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2 font-semibold">#{o.orderNumber}</td>
                  <td className="px-4 py-2">{o.customerName}</td>
                  <td className="px-4 py-2 text-stone-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>{s.label}</span></td>
                  <td className="px-4 py-2 text-right">{o.revenue > 0 ? formatPrice(o.revenue) : '—'}</td>
                  <td className="px-4 py-2 text-right">{o.cogs > 0 ? formatPrice(o.cogs) : '—'}</td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(o.deliveryFee)}
                    {o.deliveryFeeIsEstimate && <span className="text-amber-600" title="Estimated from delivery charge collected — actual Pathao fee unknown">*</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {o.deliveryFeeIsEstimate ? '—' : formatPrice(o.deliveryProfit)}
                  </td>
                  <td className="px-4 py-2 text-stone-600">{o.pathaoConsignmentId || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.orders.length === 0 && <div className="p-8 text-center text-stone-500">No orders in this range.</div>}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: 'green' | 'red' }) {
  const valueCls = highlight === 'green' ? 'text-green-700' : highlight === 'red' ? 'text-red-700' : 'text-stone-900';
  return (
    <div className="card p-5">
      <div className="text-sm text-stone-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${valueCls}`}>{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  );
}
