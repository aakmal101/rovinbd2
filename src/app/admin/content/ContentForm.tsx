'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SiteContent } from '@/lib/db';

export default function ContentForm({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onHeroFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setForm({ ...form, heroImage: data.url });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    await fetch('/api/admin/content', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, shippingFee: Number(form.shippingFee), freeShippingOver: Number(form.freeShippingOver) }),
    });
    setSaving(false); setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Hero Banner */}
      <div className="card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-lg">Hero Banner</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            The big image at the top of the homepage. Leave headline/sub-headline blank if your image already has text baked in.
          </p>
        </div>

        <div>
          <label className="label">Hero image</label>
          <div className="flex items-start gap-4">
            <div className="w-40 h-24 rounded border border-stone-200 overflow-hidden bg-stone-100 flex-shrink-0">
              <img src={form.heroImage} alt="Hero preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onHeroFile(e.target.files[0])} />
              <input
                className="input"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                placeholder="/hero-banner.jpg"
              />
              {uploading && <div className="text-xs text-stone-500">Uploading…</div>}
              <p className="text-xs text-stone-500">Recommended: 1920×840 (16:7) or wider.</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Headline (overlay)</label>
            <input
              className="input"
              value={form.heroHeadline}
              onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
              placeholder="Leave blank if image has text"
            />
          </div>
          <div>
            <label className="label">Sub-headline (overlay)</label>
            <input
              className="input"
              value={form.heroSubheadline}
              onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
              placeholder="e.g. Since 2017"
            />
          </div>
          <div>
            <label className="label">CTA button text</label>
            <input
              className="input"
              value={form.heroCtaText}
              onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
              placeholder="Shop the Collection (leave blank to hide)"
            />
          </div>
          <div>
            <label className="label">CTA button link</label>
            <input
              className="input"
              value={form.heroCtaLink}
              onChange={(e) => setForm({ ...form, heroCtaLink: e.target.value })}
              placeholder="/shop"
            />
          </div>
        </div>
      </div>

      {/* Site info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Site Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Site name</label><input className="input" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} /></div>
          <div><label className="label">Tagline</label><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">About title</label><input className="input" value={form.aboutTitle} onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">About body</label><textarea rows={6} className="input" value={form.aboutBody} onChange={(e) => setForm({ ...form, aboutBody: e.target.value })} /></div>
          <div><label className="label">Contact email</label><input className="input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
          <div><label className="label">Contact phone</label><input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.contactAddress} onChange={(e) => setForm({ ...form, contactAddress: e.target.value })} /></div>
          <div><label className="label">Shipping fee (৳)</label><input type="number" className="input" value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} /></div>
          <div><label className="label">Free shipping over (৳)</label><input type="number" className="input" value={form.freeShippingOver} onChange={(e) => setForm({ ...form, freeShippingOver: Number(e.target.value) })} /></div>
        </div>
      </div>

      <div className="flex items-center gap-3 sticky bottom-4 bg-white/80 backdrop-blur p-3 rounded-lg shadow border border-stone-200">
        <button disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Save Changes'}</button>
        {saved && <span className="text-green-700 text-sm">Saved ✓</span>}
      </div>
    </form>
  );
}
