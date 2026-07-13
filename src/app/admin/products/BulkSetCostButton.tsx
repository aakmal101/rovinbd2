'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkSetCostButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  async function run() {
    const input = prompt('Set cost (৳) for every product (used for profit/loss on the Finance page):', '110');
    if (input == null) return;
    const cost = Number(input);
    if (!Number.isFinite(cost) || cost < 0) { setResult('Error: enter a valid non-negative number'); return; }
    if (!confirm(`Set cost to ৳${cost} for every product? This overwrites any per-product cost already set.`)) return;
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/products/bulk-set-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cost }),
      });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setResult(`✓ Set cost to ৳${cost} on ${data.updated} product(s).`);
      router.refresh();
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={run} disabled={busy} className="btn btn-outline text-sm disabled:opacity-50">
        {busy ? 'Updating…' : 'Bulk: set cost for all products'}
      </button>
      {result && <div className={`text-xs ${result.startsWith('Error') ? 'text-red-600' : 'text-stone-600'}`}>{result}</div>}
    </div>
  );
}
