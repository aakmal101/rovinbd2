'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Customer } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/format';
import { SEGMENT_LABELS, classify, inSegment, type Segment } from '@/lib/segments';

export default function CustomersView({ customers }: { customers: Customer[] }) {
  const [segment, setSegment] = useState<Segment>('all');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const now = Date.now();
    return {
      all: customers.length,
      vip: customers.filter((c) => classify(c, now) === 'vip').length,
      new: customers.filter((c) => classify(c, now) === 'new').length,
      at_risk: customers.filter((c) => classify(c, now) === 'at_risk').length,
      repeat: customers.filter((c) => classify(c, now) === 'repeat').length,
    };
  }, [customers]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const ql = q.trim().toLowerCase();
    return customers.filter((c) => {
      if (!inSegment(c, segment, now)) return false;
      if (!ql) return true;
      return (
        c.name.toLowerCase().includes(ql) ||
        c.email.toLowerCase().includes(ql) ||
        c.phone.toLowerCase().includes(ql)
      );
    });
  }, [customers, segment, q]);

  const exportHref = `/api/admin/customers/export.csv?segment=${segment}`;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold">Customers</h1>
          <p className="text-stone-600 mt-1">{filtered.length} of {customers.length}</p>
        </div>
        <a
          href={exportHref}
          className="btn btn-outline text-sm"
          download
          title="Download as CSV (hashed) for Meta Custom Audiences"
        >
          Export for Meta Ads ↓
        </a>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(['all', 'vip', 'new', 'at_risk', 'repeat'] as Segment[]).map((s) => (
          <button
            key={s}
            onClick={() => setSegment(s)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              segment === s
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500'
            }`}
          >
            {SEGMENT_LABELS[s]} <span className="opacity-60 ml-1">{counts[s]}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 max-w-md">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or phone…"
        />
      </div>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Segment</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Last Order</th>
              <th className="px-4 py-2 text-right">Orders</th>
              <th className="px-4 py-2 text-right">Total Spent</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((c) => {
              const seg = classify(c);
              return (
                <tr key={c.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      seg === 'vip' ? 'bg-amber-100 text-amber-800'
                        : seg === 'new' ? 'bg-green-100 text-green-800'
                        : seg === 'at_risk' ? 'bg-red-100 text-red-700'
                        : 'bg-stone-100 text-stone-700'
                    }`}>{SEGMENT_LABELS[seg]}</span>
                  </td>
                  <td className="px-4 py-2 text-stone-600">{c.email}</td>
                  <td className="px-4 py-2 text-stone-600">{c.phone}</td>
                  <td className="px-4 py-2 text-stone-600 whitespace-nowrap">{formatDate(c.lastOrderAt)}</td>
                  <td className="px-4 py-2 text-right">{c.orderCount}</td>
                  <td className="px-4 py-2 text-right font-semibold">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-2 text-right"><Link href={`/admin/customers/${c.id}`} className="text-brand-600 hover:underline">View</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-8 text-center text-stone-500">No customers match this filter.</div>}
      </div>
    </div>
  );
}
