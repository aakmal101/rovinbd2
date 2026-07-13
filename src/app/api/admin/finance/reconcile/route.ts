import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

type ReconcileRow = { key: string; fee: number };

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const rows = Array.isArray(body.rows) ? (body.rows as ReconcileRow[]) : [];
  if (rows.length === 0) return NextResponse.json({ error: 'No rows provided' }, { status: 400 });

  const matched: { key: string; orderNumber: number; fee: number }[] = [];
  const unmatched: string[] = [];

  for (const row of rows) {
    const key = String(row.key || '').trim();
    const fee = Number(row.fee);
    if (!key || !Number.isFinite(fee)) {
      unmatched.push(key || '(blank)');
      continue;
    }
    const order = await db.findOrderByNumberOrConsignment(key);
    if (!order) {
      unmatched.push(key);
      continue;
    }
    await db.updateOrderDeliveryFee(order.id, fee);
    matched.push({ key, orderNumber: order.orderNumber, fee });
  }

  return NextResponse.json({ matched, unmatched });
}
