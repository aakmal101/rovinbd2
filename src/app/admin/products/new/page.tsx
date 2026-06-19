import { db } from '@/lib/db';
import ProductForm from '../ProductForm';

export default async function NewProductPage() {
  const categories = await db.listProductCategories();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Add Product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
