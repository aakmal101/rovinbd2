import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notifySmsCustomer } from '@/lib/notify';

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

  let sent = 0;
  for (const order of orders) {
    await notifySmsCustomer(order);
    sent++;
  }

  const foundNumbers = new Set(orders.map((o) => o.orderNumber));
  const missing: number[] = [];
  for (let n = from; n <= to; n++) if (!foundNumbers.has(n)) missing.push(n);

  return NextResponse.json({ sent, missing });
}
