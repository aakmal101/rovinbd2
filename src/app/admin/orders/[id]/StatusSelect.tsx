'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'pending',    label: '🕐 Pending' },
  { value: 'dispatched', label: '🚚 Dispatched' },
  { value: 'received',   label: '✅ Received' },
  { value: 'returned',   label: '↩️ Returned' },
];

export default function StatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [val, setVal] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const update = async (next: string) => {
    const prev = val;
    setVal(next);
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      });

      if (res.status === 401) {
        // Session expired — redirect to login
        window.location.href = '/admin/login';
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Error ${res.status}`);
        setVal(prev); // revert
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      setError('Network error — please try again.');
      setVal(prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <select
        value={val}
        onChange={(e) => update(e.target.value)}
        disabled={saving}
        className="input text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {saving && <p className="text-xs text-stone-500">Saving…</p>}
      {saved  && <p className="text-xs text-green-600 font-medium">✓ Status updated</p>}
      {error  && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
