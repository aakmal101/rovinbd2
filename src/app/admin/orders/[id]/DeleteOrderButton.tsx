'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onDelete() {
    if (!confirm(`Delete order #${orderNumber}? This cannot be undone.`)) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete');
      }
      router.push('/admin/orders');
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={onDelete}
        disabled={busy}
        className="w-full px-3 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium disabled:opacity-50"
      >
        {busy ? 'Deleting…' : 'Delete order'}
      </button>
      {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
    </div>
  );
}
