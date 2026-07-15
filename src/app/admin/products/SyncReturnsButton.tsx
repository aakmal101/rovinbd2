'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncReturnsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  async function run() {
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/finance/sync-returns', { method: 'POST', credentials: 'include' });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setResult(
        `Checked ${data.checked} order(s), restocked ${data.restocked}.` +
        (data.remaining > 0 ? ` ${data.remaining} more still pending — click again to continue.` : '') +
        (data.errors?.length ? ` ${data.errors.length} lookup error(s).` : ''),
      );
      router.refresh();
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={run} disabled={busy} className="btn btn-outline text-sm disabled:opacity-50">
        {busy ? 'Checking returns…' : 'Sync returns & update stock'}
      </button>
      {result && <div className={`text-xs ${result.startsWith('Error') ? 'text-red-600' : 'text-stone-600'}`}>{result}</div>}
    </div>
  );
}
