import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Clears a bogus/stale Pathao link (consignment id that doesn't actually
// exist at Pathao) so resend-pathao will retry order creation for it.
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const orderNumbers: number[] = Array.isArray(body.orderNumbers) ? body.orderNumbers.map(Number) : [];
  if (orderNumbers.length === 0) return NextResponse.json({ error: 'orderNumbers required' }, { status: 400 });

  const allOrders = await db.listOrders();
  const cleared: number[] = [];
  for (const n of orderNumbers) {
    const order = allOrders.find((o) => o.orderNumber === n);
    if (!order) continue;
    await db.clearOrderPathaoLink(order.id);
    cleared.push(n);
  }
  return NextResponse.json({ cleared });
}
