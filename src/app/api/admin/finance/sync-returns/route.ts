import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getPathaoOrderInfo } from '@/lib/pathao';

export const maxDuration = 60;

const RETURNED_SLUGS = new Set(['Return', 'Paid_Return', 'Cancelled']);

// Only sync a bounded batch per call so we stay well under the function
// timeout; the admin can click again to pick up where it left off.
const MAX_PER_CALL = 40;

export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = (await db.listOrders()).filter(
    (o) => o.pathaoConsignmentId && (o.status === 'pending' || o.status === 'dispatched'),
  );
  const batch = orders.slice(0, MAX_PER_CALL);

  let restocked = 0;
  const errors: { orderNumber: number; error: string }[] = [];

  for (const order of batch) {
    const info = await getPathaoOrderInfo(order.pathaoConsignmentId!);
    if (!info.ok) {
      errors.push({ orderNumber: order.orderNumber, error: info.error });
      continue;
    }
    if (RETURNED_SLUGS.has(info.statusSlug)) {
      await db.updateOrderStatus(order.id, 'returned');
      await db.restockOrderItems(order.items);
      restocked++;
    }
  }

  return NextResponse.json({
    checked: batch.length,
    restocked,
    remaining: Math.max(0, orders.length - batch.length),
    errors,
  });
}
