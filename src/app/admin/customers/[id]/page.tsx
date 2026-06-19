import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/format';
import { notFound } from 'next/navigation';

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.getCustomer(id);
  if (!c) notFound();
  const orders = await db.customerOrders(id);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">{c.name}</h1>
      <p className="text-stone-600 mt-1">Joined {formatDate(c.createdAt)}</p>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        <div className="card p-5 text-sm space-y-2">
          <h2 className="font-semibold mb-2">Contact</h2>
          <div><span className="text-stone-500">Email:</span> {c.email}</div>
          <div><span className="text-stone-500">Phone:</span> {c.phone}</div>
          <div><span className="text-stone-500">Address:</span> {c.address}, {c.city}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-stone-500">Total Orders</div>
          <div className="text-3xl font-bold mt-1">{c.orderCount}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-stone-500">Total Spent</div>
          <div className="text-3xl font-bold mt-1 text-brand-700">{formatPrice(c.totalSpent)}</div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="p-4 border-b border-stone-200 font-semibold">Orders</div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-2"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">#{o.orderNumber}</Link></td>
                <td className="px-4 py-2 text-stone-600">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {orders.length === 0 && <div className="p-8 text-center text-stone-500">No orders yet.</div>}
      </div>
    </div>
  );
}
