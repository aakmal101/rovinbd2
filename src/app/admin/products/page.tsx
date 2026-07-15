import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/format';
import DeleteButton from './DeleteButton';
import MigrateVariantsButton from './MigrateVariantsButton';
import BulkSetCostButton from './BulkSetCostButton';
import SyncReturnsButton from './SyncReturnsButton';

export default async function ProductsAdmin() {
  const [products, categories] = await Promise.all([db.listProducts(), db.listProductCategories()]);
  const catLabel = (slug: string) => categories.find((c) => c.value === slug)?.label || slug;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="text-stone-600 mt-1">{products.length} products</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link href="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
          <MigrateVariantsButton />
          <BulkSetCostButton />
          <SyncReturnsButton />
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Price</th>
              <th className="px-4 py-2 text-right">Cost</th>
              <th className="px-4 py-2 text-right">Stock</th>
              <th className="px-4 py-2">Featured</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2"><img src={p.image} alt="" className="w-12 h-12 object-cover rounded" /></td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-stone-600">{catLabel(p.category)}</td>
                <td className="px-4 py-2 text-right">{formatPrice(p.price)}</td>
                <td className="px-4 py-2 text-right">{formatPrice(p.cost)}</td>
                <td className="px-4 py-2 text-right">{p.stock}</td>
                <td className="px-4 py-2">{p.featured ? '★' : '—'}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-600 hover:underline">Edit</Link>
                  <DeleteButton id={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="p-8 text-center text-stone-500">No products yet.</div>}
      </div>
    </div>
  );
}
