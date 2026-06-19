'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigrateVariantsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  async function run() {
    if (!confirm('Create one master product per category, with current products as variants? This keeps the originals.')) return;
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/migrate-variants', { method: 'POST', credentials: 'include' });
      if (res.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Migration failed');
      if (data.created.length === 0) {
        setResult('Nothing to migrate — master products may already exist.');
      } else {
        setResult(`✓ Created ${data.created.length} master product(s): ${data.created.map((c: { name: string; variants: number }) => `${c.name} (${c.variants} variants)`).join(', ')}`);
        router.refresh();
      }
    } catch (e) {
      setResult(`Error: ${(e as Error).message}`);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={run} disabled={busy} className="btn btn-outline text-sm disabled:opacity-50">
        {busy ? 'Migrating…' : 'Bulk: create master products with variants'}
      </button>
      {result && <div className={`text-xs ${result.startsWith('Error') ? 'text-red-600' : 'text-stone-600'}`}>{result}</div>}
    </div>
  );
}
