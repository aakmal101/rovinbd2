'use client';
import { useState } from 'react';
import type { ProductVariant } from '@/lib/db';

function makeId() {
  return 'v_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export default function VariantsEditor({
  variants,
  onChange,
}: {
  variants: ProductVariant[];
  onChange: (next: ProductVariant[]) => void;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<ProductVariant>) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };
  const add = () => {
    onChange([...variants, { id: makeId(), name: '', image: '/placeholder.svg', stock: 0 }]);
  };
  const remove = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const onFile = async (id: string, file: File) => {
    setUploadingId(id);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploadingId(null);
    if (res.ok) update(id, { image: data.url });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Variants</div>
          <div className="text-xs text-stone-500">Add color/style options. When you add variants, the base stock field is ignored — each variant has its own stock.</div>
        </div>
        <button type="button" onClick={add} className="btn btn-outline text-sm">+ Add variant</button>
      </div>
      {variants.length === 0 ? (
        <div className="text-sm text-stone-500 italic py-2">No variants — customers buy the base product directly.</div>
      ) : (
        <div className="space-y-3">
          {variants.map((v) => (
            <div key={v.id} className="border border-stone-200 rounded p-3 flex gap-3 items-start">
              <div className="shrink-0">
                <img src={v.image} alt="" className="w-16 h-16 object-cover rounded bg-stone-100" />
                <label className="block mt-1 text-xs text-brand-600 cursor-pointer hover:text-brand-700">
                  {uploadingId === v.id ? 'Uploading…' : 'Change'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(v.id, e.target.files[0])} />
                </label>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-stone-600">Name (e.g. "Leopard print")</label>
                  <input className="input" value={v.name} onChange={(e) => update(v.id, { name: e.target.value })} placeholder="Variant name" />
                </div>
                <div>
                  <label className="text-xs text-stone-600">Stock</label>
                  <input type="number" min={0} className="input" value={v.stock} onChange={(e) => update(v.id, { stock: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className="text-xs text-stone-600">Image URL</label>
                  <input className="input" value={v.image} onChange={(e) => update(v.id, { image: e.target.value })} />
                </div>
              </div>
              <button type="button" onClick={() => remove(v.id)} className="text-stone-400 hover:text-red-600 p-1" aria-label="Remove variant">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
