'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoryTile } from '@/lib/db';

export default function CategoryTilesAdmin({ initial }: { initial: CategoryTile[] }) {
  const [editing, setEditing] = useState<CategoryTile | null>(null);
  const featureTiles = initial.filter((t) => t.kind === 'feature');
  const productTiles = initial.filter((t) => t.kind === 'product');

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-stone-700 mb-3">Feature Banners (top row)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {featureTiles.map((t) => (
            <TileCard key={t.id} tile={t} onEdit={() => setEditing(t)} aspect="aspect-[16/6]" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-stone-700 mb-3">Product Tiles (bottom row)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productTiles.map((t) => (
            <TileCard key={t.id} tile={t} onEdit={() => setEditing(t)} aspect="aspect-[4/3]" />
          ))}
        </div>
      </section>

      {editing && (
        <TileEditor
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TileCard({ tile, onEdit, aspect }: { tile: CategoryTile; onEdit: () => void; aspect: string }) {
  return (
    <div className="card overflow-hidden">
      <div className={`relative ${aspect}`} style={{ backgroundColor: tile.bgColor }}>
        <img
          src={tile.image}
          alt={tile.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {tile.kind === 'feature' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-center px-4">
              <div className="font-display text-white text-lg md:text-xl font-bold tracking-wider">{tile.label}</div>
              {tile.sublabel && <div className="text-white/90 text-xs md:text-sm mt-1 tracking-widest">{tile.sublabel}</div>}
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold truncate">{tile.label || <em className="text-stone-400">No label</em>}</div>
        <div className="text-xs text-stone-500 truncate">→ {tile.link}</div>
        <button onClick={onEdit} className="btn btn-outline text-sm py-1.5 mt-3 w-full">Edit</button>
      </div>
    </div>
  );
}

function TileEditor({ initial, onClose }: { initial: CategoryTile; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setForm({ ...form, image: data.url });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/admin/category-tiles/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onClose();
    router.refresh();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="card p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <div>
          <h3 className="font-semibold text-lg">Edit {form.kind === 'feature' ? 'Feature Banner' : 'Product Tile'}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {form.kind === 'feature'
              ? 'Wide banner with a label overlay. Image fills the box.'
              : 'Colored tile with a single product photo floating on the background.'}
          </p>
        </div>

        <div>
          <label className="label">Label</label>
          <input className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </div>

        {form.kind === 'feature' && (
          <div>
            <label className="label">Sub-label</label>
            <input className="input" value={form.sublabel} onChange={(e) => setForm({ ...form, sublabel: e.target.value })} placeholder="e.g. NEW ARRIVALS" />
          </div>
        )}

        <div>
          <label className="label">Link</label>
          <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/shop?cat=classic" />
        </div>

        <div>
          <label className="label">Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-12 h-10 rounded border border-stone-300 cursor-pointer"
            />
            <input
              className="input flex-1"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              placeholder="#4338ca"
            />
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {form.kind === 'feature'
              ? 'Used as fallback if the image fails to load.'
              : 'Solid background behind the product image.'}
          </p>
        </div>

        <div>
          <label className="label">Image</label>
          <div className="flex items-start gap-3">
            <div className="w-24 h-24 rounded border border-stone-200 overflow-hidden flex-shrink-0" style={{ backgroundColor: form.bgColor }}>
              <img src={form.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
              <input className="input mt-2" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              {uploading && <div className="text-xs text-stone-500 mt-1">Uploading…</div>}
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
