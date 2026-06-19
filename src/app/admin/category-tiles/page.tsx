import { db } from '@/lib/db';
import CategoryTilesAdmin from './CategoryTilesAdmin';

export default async function CategoryTilesPage() {
  const tiles = await db.listCategoryTiles();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Category Tiles</h1>
      <p className="text-stone-600 mt-1">
        Edit the homepage category showcase — 2 wide feature banners on top, 4 colored product tiles below. All images, labels, links and colors are editable.
      </p>
      <div className="mt-6"><CategoryTilesAdmin initial={tiles} /></div>
    </div>
  );
}
