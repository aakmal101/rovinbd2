'use client';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const del = async () => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    router.refresh();
  };
  return <button onClick={del} className="text-red-600 hover:underline">Delete</button>;
}
