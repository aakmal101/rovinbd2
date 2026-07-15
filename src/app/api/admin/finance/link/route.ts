import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Manually link a single order to a Pathao consignment — for cases the
// automated CSV phone-match couldn't resolve (ambiguous/no match).
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const orderKey = String(body.orderKey || '').trim();
  const consignmentId = String(body.consignmentId || '').trim();
  const fee = body.fee != null ? Number(body.fee) : undefined;
  const collectedAmount = body.collectedAmount != null ? Number(body.collectedAmount) : undefined;
  const status = body.status as 'pending' | 'dispatched' | 'received' | 'returned' | undefined;

  if (!orderKey || !consignmentId) return NextResponse.json({ error: 'orderKey and consignmentId are required' }, { status: 400 });

  const order = await db.findOrderByNumberOrConsignment(orderKey);
  if (!order) return NextResponse.json({ error: `No order matching "${orderKey}"` }, { status: 404 });

  await db.updateOrderPathaoConsignment(order.id, consignmentId, Number.isFinite(fee) ? fee : undefined);
  if (Number.isFinite(collectedAmount)) await db.updateOrderCollectedAmount(order.id, collectedAmount!);
  if (status && status !== order.status) {
    await db.updateOrderStatus(order.id, status);
    if (status === 'returned') await db.restockOrderItems(order.items);
  }

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber, consignmentId, fee, status: status || order.status });
}
