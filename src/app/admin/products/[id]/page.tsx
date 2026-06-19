import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductForm from '../ProductForm';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([db.getProduct(id), db.listProductCategories()]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Edit Product</h1>
      <div className="mt-6 max-w-2xl">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
