import { NextResponse } from 'next/server';
import { db, type ProductVariant } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [products, cats] = await Promise.all([db.listProducts(), db.listProductCategories()]);

  // Group only the products that aren't already master/variant-bearing products.
  // We treat any existing product without variants as a candidate to be a "variant source".
  const sourceProducts = products.filter((p) => p.variants.length === 0);

  const byCategory = new Map<string, typeof sourceProducts>();
  for (const p of sourceProducts) {
    const arr = byCategory.get(p.category) || [];
    arr.push(p);
    byCategory.set(p.category, arr);
  }

  const created: { id: string; name: string; variants: number }[] = [];

  for (const [categoryValue, items] of byCategory) {
    if (items.length === 0) continue;
    const label = cats.find((c) => c.value === categoryValue)?.label || categoryValue;
    const masterName = `${label} Bandanas`;

    // Skip if a master product with this name already exists
    if (products.some((p) => p.name === masterName && p.variants.length > 0)) continue;

    const variants: ProductVariant[] = items.map((p) => ({
      id: 'v_' + p.id,
      name: p.name,
      image: p.image,
      stock: p.stock,
    }));

    const minPrice = Math.min(...items.map((p) => p.price));
    const firstImage = items[0]?.image || '/placeholder.svg';

    const master = await db.createProduct({
      name: masterName,
      description: `Pick your style — ${items.length} ${label.toLowerCase()} bandanas to choose from. Premium cotton, hand-finished edges.`,
      price: minPrice,
      stock: 0, // ignored when variants exist
      image: firstImage,
      category: categoryValue,
      featured: true,
      variants,
    });
    created.push({ id: master.id, name: master.name, variants: variants.length });
  }

  return NextResponse.json({ ok: true, created });
}
