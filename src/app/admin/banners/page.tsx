import { db } from '@/lib/db';
import BannersAdmin from './BannersAdmin';

export default async function BannersPage() {
  const banners = await db.listBanners(false);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Banners</h1>
      <p className="text-stone-600 mt-1">Manage homepage banners.</p>
      <div className="mt-6"><BannersAdmin initial={banners} /></div>
    </div>
  );
}
