import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice, formatDate } from '@/lib/format';

export default async function AdminDashboard() {
  const [stats, allOrders] = await Promise.all([db.stats(), db.listOrders()]);
  const recentOrders = allOrders.slice(0, 5);

  const cards = [
    { label: 'Products', value: stats.products, href: '/admin/products' },
    { label: 'Orders', value: stats.orders, href: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pendingOrders, href: '/admin/orders' },
    { label: 'Customers', value: stats.customers, href: '/admin/customers' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="text-stone-600 mt-1">Overview of your store.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card p-5 hover:shadow-md transition">
            <div className="text-sm text-stone-500">{c.label}</div>
            <div className="text-3xl font-bold mt-1">{c.value}</div>
          </Link>
        ))}
        <div className="card p-5 md:col-span-4 bg-gradient-to-br from-brand-50 to-amber-50">
          <div className="text-sm text-stone-600">Total Revenue</div>
          <div className="text-3xl font-bold text-brand-700 mt-1">{formatPrice(stats.revenue)}</div>
        </div>
      </div>

      <div className="card mt-8">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-stone-50 text-stone-600 text-left">
              <tr>
                <th className="px-5 py-2">Order</th>
                <th className="px-5 py-2">Customer</th>
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Status</th>
                <th className="px-5 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">#{o.orderNumber}</Link></td>
                  <td className="px-5 py-3">{o.customerName}</td>
                  <td className="px-5 py-3 text-stone-600">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge s={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
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
