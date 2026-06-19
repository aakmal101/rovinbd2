import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/format';

export default async function OrdersAdmin() {
  const orders = await db.listOrders();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <p className="text-stone-600 mt-1">{orders.length} total</p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-stone-50 text-stone-600 text-left">
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-stone-50">
                <td className="px-4 py-2"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">#{o.orderNumber}</Link></td>
                <td className="px-4 py-2">{o.customerName}<div className="text-xs text-stone-500">{o.customerEmail}</div></td>
                <td className="px-4 py-2 text-stone-600 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-2">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td className="px-4 py-2 text-stone-600">{o.paymentMethod === 'cod' ? 'COD' : 'Bank'}</td>
                <td className="px-4 py-2 text-right font-semibold">{formatPrice(o.total)}</td>
                <td className="px-4 py-2"><StatusBadge s={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-8 text-center text-stone-500">No orders yet.</div>}
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: '🕐 Pending',    cls: 'bg-yellow-100 text-yellow-800' },
    dispatched: { label: '🚚 Dispatched', cls: 'bg-blue-100 text-blue-800' },
    received:   { label: '✅ Received',   cls: 'bg-green-100 text-green-800' },
    returned:   { label: '↩️ Returned',   cls: 'bg-red-100 text-red-800' },
  };
  const { label, cls } = map[s] ?? { label: s, cls: 'bg-stone-100 text-stone-600' };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
}
