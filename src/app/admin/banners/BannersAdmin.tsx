'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Banner } from '@/lib/db';

export default function BannersAdmin({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [creating, setCreating] = useState(false);

  const blank: Omit<Banner, 'id'> = { title: '', subtitle: '', ctaText: 'Shop now', ctaLink: '/shop', image: '/placeholder.svg', active: true, order: initial.length + 1 };

  return (
    <div>
      <button onClick={() => { setEditing(null); setCreating(true); }} className="btn btn-primary mb-4">+ Add Banner</button>
      <div className="grid md:grid-cols-2 gap-4">
        {initial.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="aspect-[3/1] bg-stone-100"><img src={b.image} alt="" className="w-full h-full object-cover" /></div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{b.title}</div>
                <span className={`text-xs px-2 py-0.5 rounded ${b.active ? 'bg-green-100 text-green-800' : 'bg-stone-200'}`}>
                  {b.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-stone-600 mt-1">{b.subtitle}</div>
              <div className="text-xs text-stone-500 mt-1">CTA: {b.ctaText} → {b.ctaLink} · Order: {b.order}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setCreating(false); setEditing(b); }} className="btn btn-outline text-sm py-1.5">Edit</button>
                <button onClick={async () => {
                  if (!confirm('Delete this banner?')) return;
                  await fetch(`/api/admin/banners/${b.id}`, { method: 'DELETE' });
                  router.refresh();
                }} className="text-red-600 text-sm hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <BannerEditor
          initial={editing || { ...blank, id: '' } as Banner}
          isNew={creating}
          onClose={() => { setEditing(null); setCreating(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

function BannerEditor({ initial, isNew, onClose }: { initial: Banner; isNew: boolean; onClose: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) { setForm({ ...form, image: data.url }); setPending(true); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isNew ? '/api/admin/banners' : `/api/admin/banners/${form.id}`;
    const method = isNew ? 'POST' : 'PUT';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card p-6 w-full max-w-lg space-y-3">
        <h3 className="font-semibold text-lg">{isNew ? 'Add Banner' : 'Edit Banner'}</h3>
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Subtitle</label><input className="input" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">CTA Text</label><input className="input" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} /></div>
          <div><label className="label">CTA Link</label><input className="input" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} /></div>
          <div><label className="label">Order</label><input type="number" className="input" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
          <div className="flex items-end gap-2"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /><span>Active</span></label></div>
        </div>
        <div>
          <label className="label">Image</label>
          <div className="flex items-center gap-3">
            <img src={preview || form.image} alt="" className="w-20 h-20 object-cover rounded border border-stone-200" />
            <div className="flex-1">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <input className="input mt-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              {uploading && <div className="text-xs text-stone-500 mt-1">Uploading…</div>}
              {pending && !uploading && <div className="text-xs text-amber-600 mt-1">Committed — live on the site in ~1–2 min after the auto-deploy finishes.</div>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
