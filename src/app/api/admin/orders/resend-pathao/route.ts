import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createPathaoOrder } from '@/lib/pathao';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const from = Number(body.from);
  const to = Number(body.to);
  if (!from || !to || to < from) {
    return NextResponse.json({ error: 'Provide numeric "from" and "to" order numbers' }, { status: 400 });
  }

  const orders = (await db.listOrders()).filter((o) => o.orderNumber >= from && o.orderNumber <= to);

  const results: { orderNumber: number; ok: boolean; consignmentId?: string; error?: string; skipped?: boolean }[] = [];

  for (const order of orders) {
    if (order.pathaoConsignmentId) {
      results.push({ orderNumber: order.orderNumber, ok: true, consignmentId: order.pathaoConsignmentId, skipped: true });
      continue;
    }
    const result = await createPathaoOrder({
      merchantOrderId: String(order.orderNumber),
      recipientName: order.customerName,
      recipientPhone: order.customerPhone,
      recipientAddress: `${order.shippingAddress}, ${order.city}`,
      amountToCollect: order.total,
      itemQuantity: order.items.reduce((s, i) => s + i.qty, 0),
      itemWeight: 0.5,
    });
    if (result.ok) {
      await db.updateOrderPathaoConsignment(order.id, result.consignmentId, result.deliveryFee);
      results.push({ orderNumber: order.orderNumber, ok: true, consignmentId: result.consignmentId });
    } else {
      results.push({ orderNumber: order.orderNumber, ok: false, error: result.error });
    }
  }

  const foundNumbers = new Set(orders.map((o) => o.orderNumber));
  const missing: number[] = [];
  for (let n = from; n <= to; n++) if (!foundNumbers.has(n)) missing.push(n);

  return NextResponse.json({ results, missing });
}
